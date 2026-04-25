// ============================================================
// UK Tax Calculator - Core Types
// All monetary values are annual amounts in GBP
// ============================================================

export type TaxYear =
  | "2025-26"
  | "2024-25"
  | "2023-24"
  | "2022-23"
  | "2021-22"
  | "2020-21"
  | "2019-20"
  | "2018-19";

export type Country = "england" | "scotland" | "wales" | "northern-ireland";

export type EmploymentType = "employed" | "self-employed" | "director";

export type StudentLoanPlan = "plan1" | "plan2" | "plan4" | "plan5" | "postgraduate";

export type IncomeType =
  | "employment"
  | "self-employment"
  | "dividend"
  | "savings"
  | "rental"
  | "pension"
  | "other";

export type CGTAssetType = "residential" | "shares" | "other" | "business-asset";

// ============================================================
// Tax Band Configuration
// ============================================================

export interface TaxBand {
  name: string;
  rate: number; // e.g. 0.20 for 20%
  from: number; // taxable income from (above PA)
  to: number; // taxable income to (above PA), Infinity for top band
}

// ============================================================
// Tax Year Data
// ============================================================

export interface IncomeTaxData {
  personalAllowance: number;
  personalAllowanceTaperThreshold: number; // £100,000
  personalAllowanceTaperRate: number; // £1 lost per £2 over threshold
  bands: TaxBand[];
  scottishBands: TaxBand[];
  // Wales currently aligns with rest-of-UK rates, but is tracked separately for regional policy updates.
  welshBands?: TaxBand[];
  // Northern Ireland currently aligns with rest-of-UK rates, but is tracked separately for regional policy updates.
  northernIrelandBands?: TaxBand[];
  dividendAllowance: number;
  dividendRates: { basic: number; higher: number; additional: number };
  savingsAllowanceBasic: number;
  savingsAllowanceHigher: number;
  savingsStartingRateBand: number; // £5,000
  marriageAllowance: number;
  blindPersonsAllowance: number;
}

export interface NICData {
  // Class 1 - Employed
  class1: {
    lowerEarningsLimit: number; // annual
    primaryThreshold: number; // annual - employee starts paying
    upperEarningsLimit: number; // annual
    mainRate: number; // between PT and UEL
    upperRate: number; // above UEL
    // Employer
    secondaryThreshold: number;
    employerRate: number;
  };
  // Class 2 - Self-employed flat rate
  class2: {
    weeklyRate: number;
    smallProfitsThreshold: number;
  };
  // Class 4 - Self-employed on profits
  class4: {
    lowerProfitsLimit: number;
    upperProfitsLimit: number;
    mainRate: number;
    upperRate: number;
  };
}

// For years with mid-year rate changes (2022-23)
export interface NICDataMultiPeriod extends NICData {
  periods?: Array<{
    from: string; // e.g. "2022-04-06"
    to: string;
    class1Override: Partial<NICData["class1"]>;
  }>;
}

export interface StudentLoanData {
  plan1: { threshold: number; rate: number };
  plan2: { threshold: number; rate: number };
  plan4: { threshold: number; rate: number };
  plan5?: { threshold: number; rate: number }; // From 2023-24
  postgraduate: { threshold: number; rate: number };
}

export interface PensionData {
  autoEnrolment: {
    lowerQualifyingEarnings: number;
    upperQualifyingEarnings: number;
    minimumEmployeeRate: number; // 0.05
    minimumEmployerRate: number; // 0.03
    totalMinimumRate: number; // 0.08
    earningsTrigger: number; // £10,000
  };
  annualAllowance: number;
  taperThreshold: number; // adjusted income where taper starts
  minimumTaperedAllowance: number;
  maxTaxFreeLumpSum: number;
}

export interface CGTData {
  annualExemptAmount: number;
  rates: {
    basicRate: number;
    higherRate: number;
  };
  residentialRates: {
    basicRate: number;
    higherRate: number;
  };
  businessAssetDisposalReliefRate: number;
  businessAssetDisposalReliefLifetimeLimit: number;
}

export interface TaxYearData {
  year: TaxYear;
  label: string; // e.g. "2025/26"
  startDate: string;
  endDate: string;
  incomeTax: IncomeTaxData;
  nic: NICData;
  studentLoans: StudentLoanData;
  pension: PensionData;
  cgt: CGTData;
}

// ============================================================
// Calculation Results
// ============================================================

export interface TaxBandResult {
  bandName: string;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface IncomeTaxResult {
  personalAllowance: number;
  personalAllowanceReduction: number;
  effectivePersonalAllowance: number;
  taxableIncome: number;
  bands: TaxBandResult[];
  totalIncomeTax: number;
  // Dividend tax
  dividendTax: number;
  dividendAllowanceUsed: number;
  // Savings
  savingsTax: number;
  savingsAllowanceUsed: number;
  // Totals
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
}

export interface NICResult {
  class1Employee: number;
  class1Employer: number;
  class2: number;
  class4: number;
  totalEmployee: number;
  totalEmployer: number;
}

export interface StudentLoanResult {
  plan: StudentLoanPlan;
  threshold: number;
  rate: number;
  repayment: number;
}

export interface PensionResult {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  taxRelief: number;
  qualifyingEarnings: number;
  salarySacrificeNICSaving: number;
}

export interface CGTResult {
  totalGains: number;
  totalLosses: number;
  netGains: number;
  annualExemptAmountUsed: number;
  taxableGains: number;
  taxAtBasicRate: number;
  taxAtHigherRate: number;
  totalCGT: number;
}

export interface FullTaxCalculation {
  taxYear: TaxYear;
  country: Country;
  // Income
  totalIncome: number;
  employmentIncome: number;
  selfEmploymentIncome: number;
  dividendIncome: number;
  savingsIncome: number;
  rentalIncome: number;
  pensionIncome: number;
  otherIncome: number;
  // Results
  incomeTax: IncomeTaxResult;
  nic: NICResult;
  studentLoans: StudentLoanResult[];
  pension: PensionResult;
  cgt: CGTResult | null;
  // Summary
  totalDeductions: number;
  takeHomePay: number;
  effectiveTaxRate: number;
}
