// UK Tax Calculation Engine — Pure Functions

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
  EmploymentIncomeTaxBreakdown,
  NICResult,
  StudentLoanResult,
  PensionResult,
  CGTResult,
  FullTaxCalculation,
} from "../types";
import { alignTaxCodeWithCountry, normalizeCountryAndTaxCode } from "../countryTaxCode";
import {
  getFluxQuickReferenceByCode,
  TAX_CODE_SPECIAL_RULES,
  TAX_CODE_SUFFIX_REFERENCE,
  TaxCodeRateRule,
} from "../taxCodeDataset";

// Tax Code Parser

export interface ParsedTaxCode {
  prefix: "S" | "C" | null; // Scottish / Welsh
  allowance: number;
  taxableAdjustment: number;
  isEmergency: boolean;
  emergencyBasis: "W1" | "M1" | "X" | null;
  isBR: boolean; // Basic rate on all income
  isD0: boolean; // Higher rate on all income
  isD1: boolean; // Additional rate on all income
  isNT: boolean; // No tax
  isK: boolean; // Negative allowance (adds to income)
  rateRule: TaxCodeRateRule;
  validationStatus: "valid-known" | "valid-unusual" | "invalid";
  validationMessage?: string;
  explanation: string;
}
function withRegionalPrefixExplanation(
  explanation: string,
  prefix: ParsedTaxCode["prefix"],
): string {
  if (prefix === "S") return `🏴 Scottish taxpayer prefix (S) detected. ${explanation}`;
  if (prefix === "C") return `🏴 Welsh taxpayer prefix (C) detected. ${explanation}`;
  return explanation;
}

function withEmergencyExplanation(explanation: string, isEmergency: boolean): string {
  if (!isEmergency) return explanation;
  return `${explanation} ⚠️ Emergency marker (W1/M1/X) detected — tax may be run on a non-cumulative basis until HMRC updates records.`;
}

function extractAndNormalizeTaxCode(
  code: string,
): {
  prefix: "S" | "C" | null;
  normalized: string;
  isEmergency: boolean;
  emergencyBasis: "W1" | "M1" | "X" | null;
} {
  const upperCode = code.toUpperCase().replace(/\s+/g, "").trim();
  let prefix: "S" | "C" | null = null;
  let normalized = upperCode;

  if (normalized.startsWith("S")) {
    prefix = "S";
    normalized = normalized.slice(1);
  } else if (normalized.startsWith("C")) {
    prefix = "C";
    normalized = normalized.slice(1);
  }

  const emergencyBasis = normalized.includes("W1")
    ? "W1"
    : normalized.includes("M1")
      ? "M1"
      : normalized.includes("X")
        ? "X"
        : null;
  const isEmergency = emergencyBasis !== null;
  normalized = normalized.replace(/W1|M1|X/g, "").replace(/\//g, "");
  return { prefix, normalized, isEmergency, emergencyBasis };
}

export function parseTaxCode(code: string, year: TaxYear): ParsedTaxCode {
  const data = getTaxYearData(year);
  const { prefix, normalized, isEmergency, emergencyBasis } = extractAndNormalizeTaxCode(code);
  const exactRule = TAX_CODE_SPECIAL_RULES[normalized];
  const quickReference = getFluxQuickReferenceByCode(
    `${prefix ?? ""}${normalized}`,
  ) ?? getFluxQuickReferenceByCode(normalized);

  if (exactRule) {
    const baseExplanation = quickReference
      ? `${quickReference.meaning} Typical use: ${quickReference.whoHasIt}`
      : "Special HMRC code detected.";
    const explanation = withEmergencyExplanation(
      withRegionalPrefixExplanation(baseExplanation, prefix),
      isEmergency,
    );

    return {
      prefix,
      allowance: 0,
      taxableAdjustment: 0,
      isEmergency,
      emergencyBasis,
      isBR: normalized === "BR",
      isD0: normalized === "D0",
      isD1: normalized === "D1",
      isNT: normalized === "NT",
      isK: false,
      rateRule: exactRule.rateRule,
      validationStatus: "valid-known",
      explanation,
    };
  }

  const kMatch = normalized.match(/^K(\d+)$/);
  if (kMatch) {
    const adjustment = parseInt(kMatch[1], 10) * 10;
    const baseExplanation = `K code detected — £${adjustment.toLocaleString()} is added to taxable income for this source (deductions/untaxed amounts exceed allowance).`;
    const explanation = withEmergencyExplanation(
      withRegionalPrefixExplanation(baseExplanation, prefix),
      isEmergency,
    );

    return {
      prefix,
      allowance: -adjustment,
      taxableAdjustment: adjustment,
      isEmergency,
      emergencyBasis,
      isBR: false,
      isD0: false,
      isD1: false,
      isNT: false,
      isK: true,
      rateRule: "standard-bands",
      validationStatus: "valid-known",
      explanation,
    };
  }
  const numericOnlyMatch = normalized.match(/^(\d+)$/);
  if (numericOnlyMatch) {
    const validationMessage =
      "This tax code is incomplete. Tax codes normally include a letter or suffix.";
    return {
      prefix,
      allowance: data.incomeTax.personalAllowance,
      taxableAdjustment: 0,
      isEmergency,
      emergencyBasis,
      isBR: false,
      isD0: false,
      isD1: false,
      isNT: false,
      isK: false,
      rateRule: "standard-bands",
      validationStatus: "invalid",
      validationMessage,
      explanation: validationMessage,
    };
  }

  const numericMatch = normalized.match(/^(\d+)([A-Z])$/);
  if (numericMatch) {
    const numericPart = parseInt(numericMatch[1], 10);
    const allowance = numericPart * 10;
    const suffix = numericMatch[2];
    const allowedSuffixes = new Set(["L", "M", "N", "T"]);
    if (!allowedSuffixes.has(suffix)) {
      const validationMessage =
        "This tax code suffix is not recognised. Use a valid HMRC suffix or special code.";
      return {
        prefix,
        allowance: data.incomeTax.personalAllowance,
        taxableAdjustment: 0,
        isEmergency,
        emergencyBasis,
        isBR: false,
        isD0: false,
        isD1: false,
        isNT: false,
        isK: false,
        rateRule: "standard-bands",
        validationStatus: "invalid",
        validationMessage,
        explanation: validationMessage,
      };
    }
    const suffixMeaning =
      TAX_CODE_SUFFIX_REFERENCE.find((rule) => rule.suffix === suffix)?.meaning ??
      "Allowance code suffix.";
    const validationStatus = quickReference ? "valid-known" : "valid-unusual";
    const validationMessage =
      validationStatus === "valid-unusual"
        ? "This looks like an unusual tax code. Please confirm it matches your HMRC notice."
        : undefined;

    let baseExplanation = `Tax-free allowance from code: £${allowance.toLocaleString()}. ${suffixMeaning}`;

    if (suffix === "M") {
      baseExplanation = `Marriage Allowance received. Your code gives a £${allowance.toLocaleString()} allowance (current transfer value: £${data.incomeTax.marriageAllowance.toLocaleString()}).`;
    } else if (suffix === "N") {
      baseExplanation = `Marriage Allowance transferred to partner. Your code gives a £${allowance.toLocaleString()} allowance (current transfer value: £${data.incomeTax.marriageAllowance.toLocaleString()}).`;
    } else if (suffix === "T") {
      baseExplanation = `T suffix code. Allowance is £${allowance.toLocaleString()} and HMRC flags this code for review/calculation checks.`;
    } else if (suffix === "L" && allowance === data.incomeTax.personalAllowance) {
      baseExplanation = `Standard Personal Allowance code detected (£${allowance.toLocaleString()}).`;
    }

    const explanation = withEmergencyExplanation(
      withRegionalPrefixExplanation(baseExplanation, prefix),
      isEmergency,
    );

    return {
      prefix,
      allowance,
      taxableAdjustment: 0,
      isEmergency,
      emergencyBasis,
      isBR: false,
      isD0: false,
      isD1: false,
      isNT: false,
      isK: false,
      rateRule: "standard-bands",
      validationStatus,
      validationMessage,
      explanation:
        validationMessage && validationStatus === "valid-unusual"
          ? `${explanation} ⚠️ ${validationMessage}`
          : explanation,
    };
  }

  const validationMessage =
    "This tax code format is invalid. Tax codes should match HMRC patterns (for example 1257L, BR, D0, K125, or 0T).";

  return {
    prefix,
    allowance: data.incomeTax.personalAllowance,
    taxableAdjustment: 0,
    isEmergency,
    emergencyBasis,
    isBR: false,
    isD0: false,
    isD1: false,
    isNT: false,
    isK: false,
    rateRule: "standard-bands",
    validationStatus: "invalid",
    validationMessage,
    explanation: validationMessage,
  };
}

function assertParsedTaxCodeIsValid(parsedTaxCode: ParsedTaxCode, taxCode: string): void {
  if (parsedTaxCode.validationStatus !== "invalid") return;
  const reason = parsedTaxCode.validationMessage ?? "Unknown validation error.";
  throw new Error(`Invalid tax code "${taxCode}": ${reason}`);
}

// Income Tax Calculator

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

function getForcedTaxRateForRule(
  rateRule: TaxCodeRateRule,
  country: Country,
  incomeTaxData: IncomeTaxData,
): number | null {
  if (rateRule === "standard-bands" || rateRule === "no-tax") return null;

  if (country === "scotland") {
    const scottishBands = incomeTaxData.scottishBands;
    if (rateRule === "basic-rate-only") {
      return (
        scottishBands.find((band) => band.name.toLowerCase().includes("basic rate"))
          ?.rate ?? 0.2
      );
    }
    if (rateRule === "higher-rate-only") {
      return (
        scottishBands.find((band) => band.name.toLowerCase().includes("higher rate"))
          ?.rate ?? 0.42
      );
    }
    return (
      scottishBands.find((band) => band.name.toLowerCase().includes("top rate"))?.rate ??
      scottishBands[scottishBands.length - 1]?.rate ??
      0.48
    );
  }

  if (rateRule === "basic-rate-only") return 0.2;
  if (rateRule === "higher-rate-only") return 0.4;
  return 0.45;
}

function getForcedBandNameForRule(
  rateRule: TaxCodeRateRule,
  country: Country,
): string {
  if (rateRule === "basic-rate-only") {
    return country === "scotland" ? "Scottish basic-rate code" : "Basic-rate code";
  }
  if (rateRule === "higher-rate-only") {
    return country === "scotland" ? "Scottish higher-rate code" : "Higher-rate code";
  }
  return country === "scotland"
    ? "Scottish top-rate code"
    : "Additional-rate code";
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getEmergencyPeriodsPerYear(
  parsedTaxCode: ParsedTaxCode,
  fallbackPeriodsPerYear: number,
): number {
  if (parsedTaxCode.emergencyBasis === "W1") return 52;
  if (parsedTaxCode.emergencyBasis === "M1") return 12;
  if (parsedTaxCode.emergencyBasis === "X") {
    return fallbackPeriodsPerYear > 1 ? fallbackPeriodsPerYear : 12;
  }
  return fallbackPeriodsPerYear > 1 ? fallbackPeriodsPerYear : 12;
}

function getEmploymentCalculationBasis(
  parsedTaxCode: ParsedTaxCode,
): EmploymentIncomeTaxBreakdown["calculationBasis"] {
  if (!parsedTaxCode.isEmergency) return "cumulative";
  if (parsedTaxCode.emergencyBasis === "W1") return "non-cumulative-week1";
  if (parsedTaxCode.emergencyBasis === "M1") return "non-cumulative-month1";
  return "non-cumulative-x";
}

function scaleBandsToPeriods(bands: TaxBand[], periodsPerYear: number): TaxBand[] {
  if (periodsPerYear <= 1) return bands;
  return bands.map((band) => ({
    ...band,
    from: band.from / periodsPerYear,
    to: band.to === Infinity ? Infinity : band.to / periodsPerYear,
  }));
}

function calculatePerEmploymentPAYEIncomeTax(
  employments: Array<{ income: number; taxCode?: string; periodsPerYear?: number }>,
  otherNonSavingsIncome: number,
  dividendIncome: number,
  savingsIncome: number,
  year: TaxYear,
  country: Country,
): IncomeTaxResult {
  const data = getTaxYearData(year);
  const itData = data.incomeTax;
  const activeEmployments = employments
    .filter((employment) => employment.income > 0)
    .map((employment, index) => {
      const normalizedTaxCode = employment.taxCode?.trim()
        ? alignTaxCodeWithCountry(employment.taxCode, country)
        : alignTaxCodeWithCountry("1257L", country);
      const parsedTaxCode = parseTaxCode(normalizedTaxCode, year);
      assertParsedTaxCodeIsValid(parsedTaxCode, normalizedTaxCode);
      return {
        employmentIndex: index + 1,
        income: employment.income,
        taxCode: normalizedTaxCode,
        periodsPerYear: Math.max(1, Math.round(employment.periodsPerYear ?? 12)),
        parsedTaxCode,
        country: resolveCountryFromTaxCodePrefix(country, parsedTaxCode.prefix),
      };
    });

  const totalIncome =
    activeEmployments.reduce((sum, employment) => sum + employment.income, 0) +
    otherNonSavingsIncome +
    dividendIncome +
    savingsIncome;
  const allowanceEligibleEmployments = activeEmployments.filter((employment) => {
    const parsed = employment.parsedTaxCode;
    return (
      parsed.allowance > 0 &&
      parsed.rateRule === "standard-bands" &&
      !parsed.isK &&
      !parsed.isNT
    );
  });
  const primaryAllowanceEmployment = [...allowanceEligibleEmployments].sort(
    (a, b) => b.income - a.income,
  )[0];
  const standardAllowanceFromCode = primaryAllowanceEmployment
    ? Math.max(0, primaryAllowanceEmployment.parsedTaxCode.allowance)
    : 0;
  const { pa: effectivePrimaryAllowance, reduction: paReduction } =
    calculatePersonalAllowance(
      totalIncome,
      standardAllowanceFromCode,
      itData.personalAllowanceTaperThreshold,
    );

  const employmentBreakdown: EmploymentIncomeTaxBreakdown[] = [];
  const combinedBandResults: TaxBandResult[] = [];
  let taxableEmploymentIncome = 0;
  let totalEmploymentTax = 0;

  for (const employment of activeEmployments) {
    const parsedTaxCode = employment.parsedTaxCode;
    const forcedRate = getForcedTaxRateForRule(
      parsedTaxCode.rateRule,
      employment.country,
      itData,
    );
    const allowanceUsed =
      primaryAllowanceEmployment?.employmentIndex === employment.employmentIndex &&
      parsedTaxCode.rateRule === "standard-bands" &&
      !parsedTaxCode.isK
        ? effectivePrimaryAllowance
        : 0;
    const taxableAdjustment = parsedTaxCode.isK ? parsedTaxCode.taxableAdjustment : 0;
    const taxableIncome = Math.max(0, employment.income - allowanceUsed + taxableAdjustment);
    taxableEmploymentIncome += taxableIncome;

    let bands: TaxBandResult[] = [];
    let employmentTax = 0;

    if (parsedTaxCode.rateRule !== "no-tax") {
      const isEmergencyNonCumulative = parsedTaxCode.isEmergency;
      const periodsPerYearForTax = isEmergencyNonCumulative
        ? getEmergencyPeriodsPerYear(parsedTaxCode, employment.periodsPerYear)
        : employment.periodsPerYear;

      if (forcedRate !== null) {
        if (isEmergencyNonCumulative) {
          const periodTaxableIncome = Math.max(
            0,
            employment.income / periodsPerYearForTax -
              allowanceUsed / periodsPerYearForTax +
              taxableAdjustment / periodsPerYearForTax,
          );
          employmentTax = roundCurrency(periodTaxableIncome * forcedRate * periodsPerYearForTax);
        } else {
          employmentTax = roundCurrency(taxableIncome * forcedRate);
        }
        bands = [
          {
            bandName: getForcedBandNameForRule(parsedTaxCode.rateRule, employment.country),
            rate: forcedRate,
            taxableAmount: roundCurrency(taxableIncome),
            tax: employmentTax,
          },
        ];
      } else {
        const countryBands = selectIncomeTaxBandsForCountry(itData, employment.country);
        if (isEmergencyNonCumulative) {
          const periodBands = scaleBandsToPeriods(countryBands, periodsPerYearForTax);
          const periodTaxableIncome = Math.max(
            0,
            employment.income / periodsPerYearForTax -
              allowanceUsed / periodsPerYearForTax +
              taxableAdjustment / periodsPerYearForTax,
          );
          const periodBandResults = taxOnBands(periodTaxableIncome, periodBands);
          bands = periodBandResults.map((band) => ({
            bandName: band.bandName,
            rate: band.rate,
            taxableAmount: roundCurrency(band.taxableAmount * periodsPerYearForTax),
            tax: roundCurrency(band.tax * periodsPerYearForTax),
          }));
        } else {
          bands = taxOnBands(taxableIncome, countryBands).map((band) => ({
            ...band,
            taxableAmount: roundCurrency(band.taxableAmount),
            tax: roundCurrency(band.tax),
          }));
        }
        employmentTax = roundCurrency(bands.reduce((sum, band) => sum + band.tax, 0));
      }
    }

    totalEmploymentTax += employmentTax;
    employmentBreakdown.push({
      employmentIndex: employment.employmentIndex,
      employmentIncome: roundCurrency(employment.income),
      taxCode: employment.taxCode,
      country: employment.country,
      calculationBasis: getEmploymentCalculationBasis(parsedTaxCode),
      periodsPerYear: parsedTaxCode.isEmergency
        ? getEmergencyPeriodsPerYear(parsedTaxCode, employment.periodsPerYear)
        : employment.periodsPerYear,
      allowanceUsed: roundCurrency(allowanceUsed),
      taxableAdjustment: roundCurrency(taxableAdjustment),
      taxableIncome: roundCurrency(taxableIncome),
      bands,
      totalTax: roundCurrency(employmentTax),
    });
    combinedBandResults.push(
      ...bands.map((band) => ({
        ...band,
        bandName: `Employment ${employment.employmentIndex}: ${band.bandName}`,
      })),
    );
  }

  const taxableOtherNonSavings = Math.max(0, otherNonSavingsIncome);
  let otherNonSavingsTax = 0;
  if (taxableOtherNonSavings > 0) {
    const otherBands = taxOnBands(
      taxableOtherNonSavings,
      selectIncomeTaxBandsForCountry(itData, country),
    ).map((band) => ({
      ...band,
      taxableAmount: roundCurrency(band.taxableAmount),
      tax: roundCurrency(band.tax),
    }));
    otherNonSavingsTax = roundCurrency(otherBands.reduce((sum, band) => sum + band.tax, 0));
    combinedBandResults.push(
      ...otherBands.map((band) => ({
        ...band,
        bandName: `Other income: ${band.bandName}`,
      })),
    );
  }

  const totalNonSavingsTax = roundCurrency(totalEmploymentTax + otherNonSavingsTax);
  const taxableNonSavingsIncome = roundCurrency(taxableEmploymentIncome + taxableOtherNonSavings);
  const selectedCountryBands = selectIncomeTaxBandsForCountry(itData, country);
  const basicRateBandEnd = selectedCountryBands[0]?.to ?? 37700;
  let usedBandWidth = taxableNonSavingsIncome;

  let savingsTax = 0;
  let savingsAllowanceUsed = 0;
  if (savingsIncome > 0) {
    const remainingBasicBand = Math.max(0, basicRateBandEnd - usedBandWidth);
    const isHigherRatePayer = taxableNonSavingsIncome > basicRateBandEnd;
    const psa = isHigherRatePayer
      ? itData.savingsAllowanceHigher
      : itData.savingsAllowanceBasic;
    savingsAllowanceUsed = Math.min(savingsIncome, psa);
    const taxableSavings = Math.max(0, savingsIncome - savingsAllowanceUsed);
    const savingsInBasic = Math.min(taxableSavings, remainingBasicBand);
    const savingsInHigher = taxableSavings - savingsInBasic;
    savingsTax = roundCurrency(savingsInBasic * 0.2 + savingsInHigher * 0.4);
    usedBandWidth += savingsIncome;
  }

  let dividendTax = 0;
  let dividendAllowanceUsed = 0;
  if (dividendIncome > 0) {
    dividendAllowanceUsed = Math.min(dividendIncome, itData.dividendAllowance);
    const taxableDividends = Math.max(0, dividendIncome - dividendAllowanceUsed);
    if (taxableDividends > 0) {
      const remainingBasicBand = Math.max(0, basicRateBandEnd - usedBandWidth);
      const dividendsInBasic = Math.min(taxableDividends, remainingBasicBand);
      const dividendsAboveBasic = taxableDividends - dividendsInBasic;
      const higherBandEnd = (selectedCountryBands[1]?.to ?? 125140) - basicRateBandEnd;
      const dividendsInHigher = Math.min(
        dividendsAboveBasic,
        Math.max(0, higherBandEnd - Math.max(0, usedBandWidth - basicRateBandEnd)),
      );
      const dividendsInAdditional = dividendsAboveBasic - dividendsInHigher;
      dividendTax = roundCurrency(
        dividendsInBasic * itData.dividendRates.basic +
          dividendsInHigher * itData.dividendRates.higher +
          dividendsInAdditional * itData.dividendRates.additional,
      );
    }
  }

  const totalTax = roundCurrency(totalNonSavingsTax + savingsTax + dividendTax);
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
  const lastBand = combinedBandResults.filter((band) => band.taxableAmount > 0).pop();
  let marginalRate = (lastBand?.rate ?? 0) * 100;
  if (totalIncome > 100000 && totalIncome <= 125140) {
    marginalRate = 60;
  }

  return {
    personalAllowance: itData.personalAllowance,
    personalAllowanceReduction: paReduction,
    effectivePersonalAllowance: roundCurrency(effectivePrimaryAllowance),
    taxableIncome: taxableNonSavingsIncome,
    bands: combinedBandResults,
    totalIncomeTax: totalNonSavingsTax,
    dividendTax: roundCurrency(dividendTax),
    dividendAllowanceUsed: roundCurrency(dividendAllowanceUsed),
    savingsTax: roundCurrency(savingsTax),
    savingsAllowanceUsed: roundCurrency(savingsAllowanceUsed),
    totalTax,
    effectiveRate: roundCurrency(effectiveRate),
    marginalRate,
    calculationMode: "per-employment-paye",
    employmentBreakdown,
  };
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
  let taxCodeTaxableAdjustment = 0;

  if (normalizedTaxCode) {
    parsedTaxCode = parseTaxCode(normalizedTaxCode, year);
    assertParsedTaxCodeIsValid(parsedTaxCode, normalizedTaxCode);
    const parsed = parsedTaxCode;
    if (parsed.rateRule === "no-tax") {
      return {
        personalAllowance: itData.personalAllowance, personalAllowanceReduction: 0,
        effectivePersonalAllowance: itData.personalAllowance, taxableIncome: 0,
        bands: [], totalIncomeTax: 0, dividendTax: 0, dividendAllowanceUsed: 0,
        savingsTax: 0, savingsAllowanceUsed: 0, totalTax: 0, effectiveRate: 0, marginalRate: 0,
        calculationMode: "combined-annual-liability",
      };
    }

    if (parsed.isK) {
      effectivePA = 0;
      taxCodeTaxableAdjustment = parsed.taxableAdjustment;
    } else if (
      parsed.rateRule === "basic-rate-only" ||
      parsed.rateRule === "higher-rate-only" ||
      parsed.rateRule === "additional-rate-only"
    ) {
      effectivePA = 0;
    } else {
      effectivePA = Math.max(0, parsed.allowance);
    }
  }

  const totalIncome = grossIncome + dividendIncome + savingsIncome;

  // Apply PA taper
  const { pa, reduction } = calculatePersonalAllowance(totalIncome, effectivePA, itData.personalAllowanceTaperThreshold);
  effectivePA = pa;
  paReduction = reduction;

  // Non-savings, non-dividend income
  const nonSavingsIncome = Math.max(
    0,
    grossIncome - effectivePA + taxCodeTaxableAdjustment,
  );

  // Select bands
  const effectiveCountry = resolveCountryFromTaxCodePrefix(
    normalizedCountry,
    parsedTaxCode?.prefix,
  );
  const bands = selectIncomeTaxBandsForCountry(itData, effectiveCountry);

  // Tax on non-savings income
  const forcedRate = parsedTaxCode
    ? getForcedTaxRateForRule(parsedTaxCode.rateRule, effectiveCountry, itData)
    : null;
  const bandResults =
    forcedRate !== null
      ? [
          {
            bandName: getForcedBandNameForRule(
              parsedTaxCode?.rateRule ?? "standard-bands",
              effectiveCountry,
            ),
            rate: forcedRate,
            taxableAmount: nonSavingsIncome,
            tax: Math.round(nonSavingsIncome * forcedRate * 100) / 100,
          },
        ]
      : taxOnBands(nonSavingsIncome, bands);
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
    calculationMode: "combined-annual-liability",
  };
}

// NIC Calculator

export function calculateNIC(
  employmentIncome: number,
  selfEmploymentProfits: number,
  year: TaxYear,
  employmentIncomes: number[] = [],
): NICResult {
  const data = getTaxYearData(year);
  const nic = data.nic;
  const class1EmploymentStreams =
    employmentIncomes.length > 0
      ? employmentIncomes.filter((income) => income > 0)
      : employmentIncome > 0
        ? [employmentIncome]
        : [];

  const class1ByEmployment = class1EmploymentStreams.map((streamIncome) => {
    const earningsAbovePT = Math.max(0, streamIncome - nic.class1.primaryThreshold);
    const earningsInMainBand = Math.min(
      earningsAbovePT,
      nic.class1.upperEarningsLimit - nic.class1.primaryThreshold,
    );
    const earningsAboveUEL = Math.max(0, streamIncome - nic.class1.upperEarningsLimit);
    const employeeNIC =
      earningsInMainBand * nic.class1.mainRate + earningsAboveUEL * nic.class1.upperRate;

    const earningsAboveST = Math.max(0, streamIncome - nic.class1.secondaryThreshold);
    const employerNIC = earningsAboveST * nic.class1.employerRate;

    return {
      employmentIncome: Math.round(streamIncome * 100) / 100,
      employeeNIC: Math.round(employeeNIC * 100) / 100,
      employerNIC: Math.round(employerNIC * 100) / 100,
    };
  });

  const class1Employee = class1ByEmployment.reduce(
    (sum, employmentNIC) => sum + employmentNIC.employeeNIC,
    0,
  );
  const class1Employer = class1ByEmployment.reduce(
    (sum, employmentNIC) => sum + employmentNIC.employerNIC,
    0,
  );

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
    class1ByEmployment,
  };
}

// Student Loan Calculator

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

// Pension Calculator

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

// Capital Gains Tax Calculator

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

// Full Tax Calculation

export interface TaxInputs {
  taxYear: TaxYear;
  country: Country;
  employmentIncome: number;
  employments?: Array<{
    income: number;
    taxCode?: string;
    periodsPerYear?: number;
  }>;
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

function deriveAggregateEmploymentTaxCode(
  employments: Array<{ income: number; taxCode?: string }>,
  year: TaxYear,
  country: Country,
): string | undefined {
  const activeEmployments = employments
    .filter((employment) => employment.income > 0 && employment.taxCode?.trim())
    .map((employment) => ({
      income: employment.income,
      taxCode: employment.taxCode!.trim(),
    }));

  if (activeEmployments.length === 0) return undefined;

  let hasNoTaxCode = false;
  const allowanceEmployments: Array<{ income: number; taxCode: string }> = [];

  for (const employment of activeEmployments) {
    const parsed = parseTaxCode(employment.taxCode, year);
    assertParsedTaxCodeIsValid(parsed, employment.taxCode);
    if (parsed.isNT) {
      hasNoTaxCode = true;
      continue;
    }
    if (parsed.isBR || parsed.isD0 || parsed.isD1) {
      continue;
    }
    allowanceEmployments.push(employment);
  }

  if (allowanceEmployments.length > 0) {
    const primaryAllowanceEmployment = [...allowanceEmployments].sort(
      (a, b) => b.income - a.income,
    )[0];
    return alignTaxCodeWithCountry(primaryAllowanceEmployment.taxCode, country);
  }

  if (hasNoTaxCode && activeEmployments.length === 1) {
    return alignTaxCodeWithCountry("NT", country);
  }

  const highestIncomeEmploymentWithCode = [...activeEmployments]
    .sort((a, b) => b.income - a.income)[0];
  return highestIncomeEmploymentWithCode?.taxCode;
}

export function calculateFullTax(inputs: TaxInputs): FullTaxCalculation {
  const {
    taxYear, country, employmentIncome, employments, selfEmploymentIncome, dividendIncome,
    savingsIncome, rentalIncome, pensionIncome, otherIncome, taxCode,
    studentLoanPlans, pensionEmployeeRate, pensionEmployerRate, useSalarySacrifice,
    capitalGains, capitalLosses,
  } = inputs;
  const normalizedInput = normalizeCountryAndTaxCode(country, taxCode ?? "");
  const normalizedCountry = normalizedInput.country;
  const normalizedTaxCode = normalizedInput.taxCode || undefined;
  const normalizedEmployments =
    employments?.map((employment) => ({
      income: Math.max(0, employment.income),
      taxCode: employment.taxCode
        ? alignTaxCodeWithCountry(employment.taxCode, normalizedCountry)
        : undefined,
      periodsPerYear: employment.periodsPerYear,
    })) ?? [];
  const hasEmploymentBreakdown = normalizedEmployments.some(
    (employment) => employment.income > 0,
  );
  const employmentIncomesForNIC = hasEmploymentBreakdown
    ? normalizedEmployments.map((employment) => employment.income).filter((income) => income > 0)
    : [];
  const resolvedEmploymentIncome = hasEmploymentBreakdown
    ? employmentIncomesForNIC.reduce((sum, income) => sum + income, 0)
    : employmentIncome;
  const effectiveTaxCode = hasEmploymentBreakdown
    ? deriveAggregateEmploymentTaxCode(normalizedEmployments, taxYear, normalizedCountry) ??
      normalizedTaxCode
    : normalizedTaxCode;

  const grossNonDividendNonSavings =
    resolvedEmploymentIncome +
    selfEmploymentIncome +
    rentalIncome +
    pensionIncome +
    otherIncome;
  const totalIncome = grossNonDividendNonSavings + dividendIncome + savingsIncome;

  // Income Tax
  const annualLiabilityIncomeTax = calculateIncomeTax(
    grossNonDividendNonSavings,
    dividendIncome,
    savingsIncome,
    taxYear,
    normalizedCountry,
    effectiveTaxCode,
  );
  const incomeTax = hasEmploymentBreakdown
    ? {
        ...calculatePerEmploymentPAYEIncomeTax(
          normalizedEmployments,
          selfEmploymentIncome + rentalIncome + pensionIncome + otherIncome,
          dividendIncome,
          savingsIncome,
          taxYear,
          normalizedCountry,
        ),
        annualLiabilityComparison: {
          taxableIncome: annualLiabilityIncomeTax.taxableIncome,
          effectivePersonalAllowance:
            annualLiabilityIncomeTax.effectivePersonalAllowance,
          totalIncomeTax: annualLiabilityIncomeTax.totalIncomeTax,
          totalTax: annualLiabilityIncomeTax.totalTax,
        },
      }
    : annualLiabilityIncomeTax;

  // NIC
  const nic = calculateNIC(
    resolvedEmploymentIncome,
    selfEmploymentIncome,
    taxYear,
    employmentIncomesForNIC,
  );

  // Student Loans (on gross income)
  const studentLoans = calculateStudentLoans(totalIncome, studentLoanPlans, taxYear);

  // Pension
  const pension = calculatePension(
    resolvedEmploymentIncome,
    pensionEmployeeRate,
    pensionEmployerRate,
    taxYear,
    useSalarySacrifice,
  );

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
    employmentIncome: resolvedEmploymentIncome,
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
