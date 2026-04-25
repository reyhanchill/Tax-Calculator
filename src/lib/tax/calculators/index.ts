// ============================================================
// UK Tax Calculation Engine — Pure Functions
// ============================================================

import { getTaxYearData } from "../data";
import {
  TaxYear,
  Country,
  StudentLoanPlan,
  CGTAssetType,
  TaxBand,
  IncomeTaxData,
  TaxBandResult,
  IncomeTaxResult,
  NICResult,
  StudentLoanResult,
  PensionResult,
  CGTResult,
  FullTaxCalculation,
} from "../types";
import { normalizeCountryAndTaxCode } from "../countryTaxCode";

// ============================================================
// Tax Code Parser
// ============================================================

export interface ParsedTaxCode {
  prefix: "S" | "C" | null; // Scottish / Welsh
  allowance: number;
  isEmergency: boolean;
  isBR: boolean; // Basic rate on all income
  isD0: boolean; // Higher rate on all income
  isD1: boolean; // Additional rate on all income
  isNT: boolean; // No tax
  isK: boolean; // Negative allowance (adds to income)
  explanation: string;
}

export function parseTaxCode(code: string, year: TaxYear): ParsedTaxCode {
  const data = getTaxYearData(year);
  const upperCode = code.toUpperCase().trim();

  let prefix: "S" | "C" | null = null;
  let remaining = upperCode;

  if (remaining.startsWith("S")) {
    prefix = "S";
    remaining = remaining.slice(1);
  } else if (remaining.startsWith("C")) {
    prefix = "C";
    remaining = remaining.slice(1);
  }

  const isEmergency = remaining.includes("W1") || remaining.includes("M1") || remaining.includes("X");
  remaining = remaining.replace(/\s*(W1|M1|X)\s*/g, "");

  const countryLabel = prefix === "S" ? "Scottish" : prefix === "C" ? "Welsh" : "Standard";

  if (remaining === "BR") {
    return {
      prefix, allowance: 0, isEmergency, isBR: true, isD0: false, isD1: false, isNT: false, isK: false,
      explanation: `${countryLabel} Basic Rate — all income taxed at 20%. No personal allowance applied through this employment.`,
    };
  }
  if (remaining === "D0") {
    return {
      prefix, allowance: 0, isEmergency, isBR: false, isD0: true, isD1: false, isNT: false, isK: false,
      explanation: `${countryLabel} Higher Rate — all income taxed at 40%. Typically used for second jobs.`,
    };
  }
  if (remaining === "D1") {
    return {
      prefix, allowance: 0, isEmergency, isBR: false, isD0: false, isD1: true, isNT: false, isK: false,
      explanation: `${countryLabel} Additional Rate — all income taxed at 45%.`,
    };
  }
  if (remaining === "NT") {
    return {
      prefix, allowance: 0, isEmergency, isBR: false, isD0: false, isD1: false, isNT: true, isK: false,
      explanation: "No Tax — no income tax deducted. Rare, usually for diplomatic staff or specific circumstances.",
    };
  }
  if (remaining === "0T") {
    return {
      prefix, allowance: 0, isEmergency, isBR: false, isD0: false, isD1: false, isNT: false, isK: false,
      explanation: "Zero allowance — all income is taxable. Often used when HMRC hasn't received enough information.",
    };
  }

  const isK = remaining.startsWith("K");
  if (isK) remaining = remaining.slice(1);

  // Extract numeric part and suffix letter
  const match = remaining.match(/^(\d+)([A-Z])?$/);
  if (match) {
    const numericPart = parseInt(match[1], 10);
    const allowance = numericPart * 10;
    const suffix = match[2] || "L";

    let explanation = "";
    if (isK) {
      explanation = `K code — you owe tax on £${allowance.toLocaleString()} of benefits/unpaid tax from previous years, added to your taxable income.`;
    } else if (suffix === "L") {
      explanation = `You have a tax-free Personal Allowance of £${allowance.toLocaleString()}.`;
      if (allowance === data.incomeTax.personalAllowance) {
        explanation += " This is the standard Personal Allowance.";
      }
    } else if (suffix === "M") {
      explanation = `Marriage Allowance — you've received a transfer of £${data.incomeTax.marriageAllowance.toLocaleString()} from your partner. Your allowance is £${allowance.toLocaleString()}.`;
    } else if (suffix === "N") {
      explanation = `Marriage Allowance — you've transferred £${data.incomeTax.marriageAllowance.toLocaleString()} to your partner. Your allowance is £${allowance.toLocaleString()}.`;
    } else if (suffix === "T") {
      explanation = `Your allowance is £${allowance.toLocaleString()}. HMRC needs to review some items in your tax code.`;
    }

    if (isEmergency) {
      explanation += " ⚠️ Emergency tax code — your tax may be calculated on a non-cumulative basis. Contact HMRC to correct this.";
    }
    if (prefix === "S") explanation = "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish tax rates apply. " + explanation;
    if (prefix === "C") explanation = "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Welsh tax rates apply. " + explanation;

    return {
      prefix,
      allowance: isK ? -allowance : allowance,
      isEmergency,
      isBR: false,
      isD0: false,
      isD1: false,
      isNT: false,
      isK,
      explanation,
    };
  }

  return {
    prefix,
    allowance: data.incomeTax.personalAllowance,
    isEmergency: false,
    isBR: false,
    isD0: false,
    isD1: false,
    isNT: false,
    isK: false,
    explanation: "Unable to parse tax code. Using standard Personal Allowance as default.",
  };
}

// ============================================================
// Income Tax Calculator
// ============================================================

function calculatePersonalAllowance(totalIncome: number, standardPA: number, taperThreshold: number): { pa: number; reduction: number } {
  if (totalIncome <= taperThreshold) {
    return { pa: standardPA, reduction: 0 };
  }
  const excess = totalIncome - taperThreshold;
  const reduction = Math.min(Math.floor(excess / 2), standardPA);
  return { pa: standardPA - reduction, reduction };
}

function taxOnBands(taxableIncome: number, bands: TaxBand[]): TaxBandResult[] {
  const results: TaxBandResult[] = [];
  let remaining = taxableIncome;

  for (const band of bands) {
    if (remaining <= 0) break;
    const bandWidth = band.to === Infinity ? remaining : band.to - band.from;
    const taxableInBand = Math.min(remaining, bandWidth);
    results.push({
      bandName: band.name,
      rate: band.rate,
      taxableAmount: taxableInBand,
      tax: Math.round(taxableInBand * band.rate * 100) / 100,
    });
    remaining -= taxableInBand;
  }

  return results;
}

function resolveCountryFromTaxCodePrefix(
  selectedCountry: Country,
  prefix: ParsedTaxCode["prefix"] | null | undefined,
): Country {
  if (prefix === "S") return "scotland";
  if (prefix === "C") return "wales";
  return selectedCountry;
}

function selectIncomeTaxBandsForCountry(
  incomeTaxData: IncomeTaxData,
  country: Country,
): TaxBand[] {
  switch (country) {
    case "scotland":
      return incomeTaxData.scottishBands;
    case "wales":
      return incomeTaxData.welshBands ?? incomeTaxData.bands;
    case "northern-ireland":
      return incomeTaxData.northernIrelandBands ?? incomeTaxData.bands;
    case "england":
    default:
      return incomeTaxData.bands;
  }
}

export function calculateIncomeTax(
  grossIncome: number,
  dividendIncome: number,
  savingsIncome: number,
  year: TaxYear,
  country: Country,
  taxCode?: string,
): IncomeTaxResult {
  const data = getTaxYearData(year);
  const itData = data.incomeTax;
  const normalizedInput = normalizeCountryAndTaxCode(country, taxCode ?? "");
  const normalizedCountry = normalizedInput.country;
  const normalizedTaxCode = normalizedInput.taxCode;

  // Determine PA
  let effectivePA = itData.personalAllowance;
  let paReduction = 0;
  let parsedTaxCode: ParsedTaxCode | null = null;

  if (normalizedTaxCode) {
    parsedTaxCode = parseTaxCode(normalizedTaxCode, year);
    const parsed = parsedTaxCode;
    if (parsed.isNT) {
      return {
        personalAllowance: itData.personalAllowance, personalAllowanceReduction: 0,
        effectivePersonalAllowance: itData.personalAllowance, taxableIncome: 0,
        bands: [], totalIncomeTax: 0, dividendTax: 0, dividendAllowanceUsed: 0,
        savingsTax: 0, savingsAllowanceUsed: 0, totalTax: 0, effectiveRate: 0, marginalRate: 0,
      };
    }
    if (parsed.isBR || parsed.isD0 || parsed.isD1) {
      effectivePA = 0;
    } else {
      effectivePA = parsed.allowance >= 0 ? parsed.allowance : 0;
    }
  }

  const totalIncome = grossIncome + dividendIncome + savingsIncome;

  // Apply PA taper
  const { pa, reduction } = calculatePersonalAllowance(totalIncome, effectivePA, itData.personalAllowanceTaperThreshold);
  effectivePA = pa;
  paReduction = reduction;

  // Non-savings, non-dividend income
  const nonSavingsIncome = Math.max(0, grossIncome - effectivePA);

  // Select bands
  const effectiveCountry = resolveCountryFromTaxCodePrefix(
    normalizedCountry,
    parsedTaxCode?.prefix,
  );
  const bands = selectIncomeTaxBandsForCountry(itData, effectiveCountry);

  // Tax on non-savings income
  const bandResults = taxOnBands(nonSavingsIncome, bands);
  const totalNonSavingsTax = bandResults.reduce((sum, b) => sum + b.tax, 0);

  // Determine which band the non-savings income reaches
  let usedBandWidth = nonSavingsIncome;

  // Savings tax (simplified: use remaining basic rate band)
  let savingsTax = 0;
  let savingsAllowanceUsed = 0;
  if (savingsIncome > 0) {
    const basicRateEnd = bands[0]?.to ?? 37700;
    const remainingBasicBand = Math.max(0, basicRateEnd - usedBandWidth);
    // PSA
    const isHigherRatePayer = nonSavingsIncome > basicRateEnd;
    const psa = isHigherRatePayer ? itData.savingsAllowanceHigher : itData.savingsAllowanceBasic;
    savingsAllowanceUsed = Math.min(savingsIncome, psa);
    const taxableSavings = Math.max(0, savingsIncome - savingsAllowanceUsed);

    const savingsInBasic = Math.min(taxableSavings, remainingBasicBand);
    const savingsInHigher = taxableSavings - savingsInBasic;
    savingsTax = savingsInBasic * 0.20 + savingsInHigher * 0.40;
    usedBandWidth += savingsIncome;
  }

  // Dividend tax
  let dividendTax = 0;
  let dividendAllowanceUsed = 0;
  if (dividendIncome > 0) {
    dividendAllowanceUsed = Math.min(dividendIncome, itData.dividendAllowance);
    const taxableDividends = dividendIncome - dividendAllowanceUsed;
    if (taxableDividends > 0) {
      const basicRateEnd = bands[0]?.to ?? 37700;
      const remainingBasicBand = Math.max(0, basicRateEnd - usedBandWidth);
      const divInBasic = Math.min(taxableDividends, remainingBasicBand);
      const divAboveBasic = taxableDividends - divInBasic;
      // Simplified: split higher/additional
      const higherBandEnd = (bands[1]?.to ?? 125140) - basicRateEnd;
      const divInHigher = Math.min(divAboveBasic, Math.max(0, higherBandEnd - Math.max(0, usedBandWidth - basicRateEnd)));
      const divInAdditional = divAboveBasic - divInHigher;

      dividendTax =
        divInBasic * itData.dividendRates.basic +
        divInHigher * itData.dividendRates.higher +
        divInAdditional * itData.dividendRates.additional;
    }
  }

  const totalTax = Math.round((totalNonSavingsTax + savingsTax + dividendTax) * 100) / 100;
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  // Marginal rate
  let marginalRate = 0;
  if (totalIncome > 0) {
    const lastBand = bandResults.filter((b) => b.taxableAmount > 0).pop();
    marginalRate = (lastBand?.rate ?? 0) * 100;
    // 60% effective marginal rate trap
    if (totalIncome > 100000 && totalIncome <= 125140) {
      marginalRate = 60;
    }
  }

  return {
    personalAllowance: itData.personalAllowance,
    personalAllowanceReduction: paReduction,
    effectivePersonalAllowance: effectivePA,
    taxableIncome: nonSavingsIncome,
    bands: bandResults,
    totalIncomeTax: totalNonSavingsTax,
    dividendTax: Math.round(dividendTax * 100) / 100,
    dividendAllowanceUsed,
    savingsTax: Math.round(savingsTax * 100) / 100,
    savingsAllowanceUsed,
    totalTax,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    marginalRate,
  };
}

// ============================================================
// NIC Calculator
// ============================================================

export function calculateNIC(
  employmentIncome: number,
  selfEmploymentProfits: number,
  year: TaxYear,
): NICResult {
  const data = getTaxYearData(year);
  const nic = data.nic;

  // Class 1 — Employee
  let class1Employee = 0;
  let class1Employer = 0;

  if (employmentIncome > 0) {
    // Employee NIC
    const earningsAbovePT = Math.max(0, employmentIncome - nic.class1.primaryThreshold);
    const earningsInMainBand = Math.min(earningsAbovePT, nic.class1.upperEarningsLimit - nic.class1.primaryThreshold);
    const earningsAboveUEL = Math.max(0, employmentIncome - nic.class1.upperEarningsLimit);
    class1Employee = earningsInMainBand * nic.class1.mainRate + earningsAboveUEL * nic.class1.upperRate;

    // Employer NIC
    const earningsAboveST = Math.max(0, employmentIncome - nic.class1.secondaryThreshold);
    class1Employer = earningsAboveST * nic.class1.employerRate;
  }

  // Class 2 & 4 — Self-employed
  let class2 = 0;
  let class4 = 0;

  if (selfEmploymentProfits > 0) {
    // Class 2 — voluntary from 2024/25 onwards, but treated as paid if above threshold
    if (selfEmploymentProfits >= nic.class2.smallProfitsThreshold) {
      class2 = nic.class2.weeklyRate * 52;
    }

    // Class 4
    const profitsAboveLPL = Math.max(0, selfEmploymentProfits - nic.class4.lowerProfitsLimit);
    const profitsInMainBand = Math.min(profitsAboveLPL, nic.class4.upperProfitsLimit - nic.class4.lowerProfitsLimit);
    const profitsAboveUPL = Math.max(0, selfEmploymentProfits - nic.class4.upperProfitsLimit);
    class4 = profitsInMainBand * nic.class4.mainRate + profitsAboveUPL * nic.class4.upperRate;
  }

  return {
    class1Employee: Math.round(class1Employee * 100) / 100,
    class1Employer: Math.round(class1Employer * 100) / 100,
    class2: Math.round(class2 * 100) / 100,
    class4: Math.round(class4 * 100) / 100,
    totalEmployee: Math.round((class1Employee + class2 + class4) * 100) / 100,
    totalEmployer: Math.round(class1Employer * 100) / 100,
  };
}

// ============================================================
// Student Loan Calculator
// ============================================================

export function calculateStudentLoans(
  grossIncome: number,
  plans: StudentLoanPlan[],
  year: TaxYear,
): StudentLoanResult[] {
  const data = getTaxYearData(year);
  const results: StudentLoanResult[] = [];

  for (const plan of plans) {
    let planData;
    switch (plan) {
      case "plan1": planData = data.studentLoans.plan1; break;
      case "plan2": planData = data.studentLoans.plan2; break;
      case "plan4": planData = data.studentLoans.plan4; break;
      case "plan5": planData = data.studentLoans.plan5; if (!planData) continue; break;
      case "postgraduate": planData = data.studentLoans.postgraduate; break;
    }

    const incomeAboveThreshold = Math.max(0, grossIncome - planData.threshold);
    const repayment = Math.round(incomeAboveThreshold * planData.rate * 100) / 100;

    results.push({
      plan,
      threshold: planData.threshold,
      rate: planData.rate,
      repayment,
    });
  }

  return results;
}

// ============================================================
// Pension Calculator
// ============================================================

export function calculatePension(
  grossIncome: number,
  employeeRate: number,
  employerRate: number,
  year: TaxYear,
  useSalarySacrifice: boolean = false,
): PensionResult {
  const data = getTaxYearData(year);
  const ae = data.pension.autoEnrolment;

  const qualifyingEarnings = Math.max(
    0,
    Math.min(grossIncome, ae.upperQualifyingEarnings) - ae.lowerQualifyingEarnings,
  );

  const employeeContribution = Math.round(qualifyingEarnings * employeeRate * 100) / 100;
  const employerContribution = Math.round(qualifyingEarnings * employerRate * 100) / 100;
  const totalContribution = employeeContribution + employerContribution;

  // Tax relief (basic rate relief is automatic)
  const taxRelief = Math.round(employeeContribution * 0.25 * 100) / 100; // 20% relief = multiply net by 1.25

  // Salary sacrifice NIC saving
  let salarySacrificeNICSaving = 0;
  if (useSalarySacrifice) {
    // Employee saves NIC on the sacrificed amount
    const nicData = data.nic.class1;
    if (grossIncome > nicData.primaryThreshold) {
      salarySacrificeNICSaving = Math.round(employeeContribution * nicData.mainRate * 100) / 100;
    }
  }

  return {
    employeeContribution,
    employerContribution,
    totalContribution,
    taxRelief,
    qualifyingEarnings,
    salarySacrificeNICSaving,
  };
}

// ============================================================
// Capital Gains Tax Calculator
// ============================================================

export function calculateCGT(
  gains: { amount: number; assetType: CGTAssetType }[],
  losses: number,
  totalTaxableIncome: number,
  year: TaxYear,
): CGTResult {
  const data = getTaxYearData(year);
  const cgtData = data.cgt;
  const itBands = data.incomeTax.bands;

  const totalGains = gains.reduce((sum, g) => sum + g.amount, 0);
  const netGains = Math.max(0, totalGains - losses);
  const aea = Math.min(netGains, cgtData.annualExemptAmount);
  const taxableGains = Math.max(0, netGains - aea);

  if (taxableGains === 0) {
    return {
      totalGains, totalLosses: losses, netGains, annualExemptAmountUsed: aea,
      taxableGains: 0, taxAtBasicRate: 0, taxAtHigherRate: 0, totalCGT: 0,
    };
  }

  // Determine how much basic rate band is remaining
  const basicRateBandEnd = itBands[0]?.to ?? 37700;
  const remainingBasicBand = Math.max(0, basicRateBandEnd - totalTaxableIncome);

  // Check if any gains are residential
  const hasResidential = gains.some((g) => g.assetType === "residential");
  const rates = hasResidential ? cgtData.residentialRates : cgtData.rates;

  const gainsAtBasic = Math.min(taxableGains, remainingBasicBand);
  const gainsAtHigher = taxableGains - gainsAtBasic;

  const taxAtBasicRate = Math.round(gainsAtBasic * rates.basicRate * 100) / 100;
  const taxAtHigherRate = Math.round(gainsAtHigher * rates.higherRate * 100) / 100;

  return {
    totalGains,
    totalLosses: losses,
    netGains,
    annualExemptAmountUsed: aea,
    taxableGains,
    taxAtBasicRate,
    taxAtHigherRate,
    totalCGT: taxAtBasicRate + taxAtHigherRate,
  };
}

// ============================================================
// Full Tax Calculation
// ============================================================

export interface TaxInputs {
  taxYear: TaxYear;
  country: Country;
  employmentIncome: number;
  selfEmploymentIncome: number;
  dividendIncome: number;
  savingsIncome: number;
  rentalIncome: number;
  pensionIncome: number;
  otherIncome: number;
  taxCode?: string;
  studentLoanPlans: StudentLoanPlan[];
  pensionEmployeeRate: number;
  pensionEmployerRate: number;
  useSalarySacrifice: boolean;
  capitalGains?: { amount: number; assetType: CGTAssetType }[];
  capitalLosses?: number;
}

export function calculateFullTax(inputs: TaxInputs): FullTaxCalculation {
  const {
    taxYear, country, employmentIncome, selfEmploymentIncome, dividendIncome,
    savingsIncome, rentalIncome, pensionIncome, otherIncome, taxCode,
    studentLoanPlans, pensionEmployeeRate, pensionEmployerRate, useSalarySacrifice,
    capitalGains, capitalLosses,
  } = inputs;
  const normalizedInput = normalizeCountryAndTaxCode(country, taxCode ?? "");
  const normalizedCountry = normalizedInput.country;
  const normalizedTaxCode = normalizedInput.taxCode || undefined;

  const grossNonDividendNonSavings = employmentIncome + selfEmploymentIncome + rentalIncome + pensionIncome + otherIncome;
  const totalIncome = grossNonDividendNonSavings + dividendIncome + savingsIncome;

  // Income Tax
  const incomeTax = calculateIncomeTax(
    grossNonDividendNonSavings,
    dividendIncome,
    savingsIncome,
    taxYear,
    normalizedCountry,
    normalizedTaxCode,
  );

  // NIC
  const nic = calculateNIC(employmentIncome, selfEmploymentIncome, taxYear);

  // Student Loans (on gross income)
  const studentLoans = calculateStudentLoans(totalIncome, studentLoanPlans, taxYear);

  // Pension
  const pension = calculatePension(employmentIncome, pensionEmployeeRate, pensionEmployerRate, taxYear, useSalarySacrifice);

  // CGT
  let cgt: CGTResult | null = null;
  if (capitalGains && capitalGains.length > 0) {
    cgt = calculateCGT(capitalGains, capitalLosses ?? 0, incomeTax.taxableIncome, taxYear);
  }

  // Summary
  const studentLoanTotal = studentLoans.reduce((sum, sl) => sum + sl.repayment, 0);
  const totalDeductions = incomeTax.totalTax + nic.totalEmployee + studentLoanTotal + pension.employeeContribution + (cgt?.totalCGT ?? 0);
  const takeHomePay = totalIncome - totalDeductions;
  const effectiveTaxRate = totalIncome > 0 ? (totalDeductions / totalIncome) * 100 : 0;

  return {
    taxYear,
    country: normalizedCountry,
    totalIncome,
    employmentIncome,
    selfEmploymentIncome,
    dividendIncome,
    savingsIncome,
    rentalIncome,
    pensionIncome,
    otherIncome,
    incomeTax,
    nic,
    studentLoans,
    pension,
    cgt,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    takeHomePay: Math.round(takeHomePay * 100) / 100,
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
  };
}
