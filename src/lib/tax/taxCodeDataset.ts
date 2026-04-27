// UK Tax Code Dataset
// Source: https://fluxaccounting.co.uk/list-of-uk-tax-codes/

export type TaxCodeRateRule =
  | "standard-bands"
  | "basic-rate-only"
  | "higher-rate-only"
  | "additional-rate-only"
  | "no-tax";

export interface TaxCodeQuickReference {
  code: string;
  meaning: string;
  whoHasIt: string;
  rateRule: TaxCodeRateRule;
  allowanceTreatment: "code-derived" | "no-allowance" | "negative-allowance";
}

export interface TaxCodePatternReference {
  pattern: string;
  meaning: string;
  ruleSummary: string;
}

export interface TaxCodeSuffixReference {
  suffix: string;
  meaning: string;
}

export interface TaxCodeSpecialRule {
  rateRule: TaxCodeRateRule;
  allowanceTreatment: "code-derived" | "no-allowance" | "negative-allowance";
}

// Table: "Quick Reference: Common Tax Codes 2024/25" (Flux)
export const FLUX_COMMON_TAX_CODE_REFERENCE: TaxCodeQuickReference[] = [
  {
    code: "1257L",
    meaning: "Standard Personal Allowance.",
    whoHasIt: "Most employees with one job/pension and straightforward tax affairs.",
    rateRule: "standard-bands",
    allowanceTreatment: "code-derived",
  },
  {
    code: "1382M",
    meaning: "Marriage Allowance received.",
    whoHasIt: "Married/civil partners receiving transferred allowance.",
    rateRule: "standard-bands",
    allowanceTreatment: "code-derived",
  },
  {
    code: "1131N",
    meaning: "Marriage Allowance transferred to partner.",
    whoHasIt: "Married/civil partners transferring allowance.",
    rateRule: "standard-bands",
    allowanceTreatment: "code-derived",
  },
  {
    code: "S1257L",
    meaning: "Scottish taxpayer with standard Personal Allowance.",
    whoHasIt: "Taxpayers with main residence in Scotland.",
    rateRule: "standard-bands",
    allowanceTreatment: "code-derived",
  },
  {
    code: "C1257L",
    meaning: "Welsh taxpayer with standard Personal Allowance.",
    whoHasIt: "Taxpayers with main residence in Wales.",
    rateRule: "standard-bands",
    allowanceTreatment: "code-derived",
  },
  {
    code: "BR",
    meaning: "All income taxed at basic rate, no Personal Allowance on this source.",
    whoHasIt: "Common on second jobs/pensions.",
    rateRule: "basic-rate-only",
    allowanceTreatment: "no-allowance",
  },
  {
    code: "D0",
    meaning: "All income taxed at higher rate, no Personal Allowance on this source.",
    whoHasIt: "Additional income source for higher-rate taxpayers.",
    rateRule: "higher-rate-only",
    allowanceTreatment: "no-allowance",
  },
  {
    code: "D1",
    meaning: "All income taxed at additional/top rate, no Personal Allowance on this source.",
    whoHasIt: "Additional income source for very high earners.",
    rateRule: "additional-rate-only",
    allowanceTreatment: "no-allowance",
  },
  {
    code: "0T",
    meaning: "No Personal Allowance applied.",
    whoHasIt: "Can appear for high earners, new jobs, or when HMRC needs details.",
    rateRule: "standard-bands",
    allowanceTreatment: "no-allowance",
  },
  {
    code: "K497",
    meaning: "Deductions exceed allowance; taxable adjustment added to pay.",
    whoHasIt: "Untaxed benefits/unpaid tax from earlier years.",
    rateRule: "standard-bands",
    allowanceTreatment: "negative-allowance",
  },
  {
    code: "NT",
    meaning: "No tax deducted.",
    whoHasIt: "Rare special cases.",
    rateRule: "no-tax",
    allowanceTreatment: "no-allowance",
  },
  {
    code: "1257L W1/M1",
    meaning: "Emergency code (non-cumulative).",
    whoHasIt: "Often temporary for new starters until HMRC records update.",
    rateRule: "standard-bands",
    allowanceTreatment: "code-derived",
  },
];

export const UK_TAX_CODE_PATTERN_REFERENCE: TaxCodePatternReference[] = [
  {
    pattern: "[SC]?\\d+L",
    meaning: "Standard allowance tax code.",
    ruleSummary: "Personal Allowance = numeric part × 10, taxed through normal bands.",
  },
  {
    pattern: "[SC]?\\d+M",
    meaning: "Marriage Allowance received.",
    ruleSummary: "Higher allowance and normal banded taxation.",
  },
  {
    pattern: "[SC]?\\d+N",
    meaning: "Marriage Allowance transferred.",
    ruleSummary: "Lower allowance and normal banded taxation.",
  },
  {
    pattern: "[SC]?\\d+T",
    meaning: "HMRC review flag code.",
    ruleSummary: "Numeric allowance with HMRC review flag; normal banded taxation.",
  },
  {
    pattern: "[SC]?K\\d+",
    meaning: "Negative allowance code.",
    ruleSummary: "Numeric part × 10 is added to taxable income.",
  },
  {
    pattern: "[SC]?(BR|D0|D1|NT|0T)",
    meaning: "Special non-standard allowance/rate code.",
    ruleSummary: "Applies fixed-rate or no-allowance rulings depending on code.",
  },
  {
    pattern: ".*(W1|M1|X)$",
    meaning: "Emergency marker.",
    ruleSummary: "Week 1 / Month 1 non-cumulative handling marker.",
  },
];

export const TAX_CODE_SUFFIX_REFERENCE: TaxCodeSuffixReference[] = [
  { suffix: "L", meaning: "Standard Personal Allowance suffix." },
  { suffix: "M", meaning: "Marriage Allowance received." },
  { suffix: "N", meaning: "Marriage Allowance transferred to partner." },
  { suffix: "T", meaning: "HMRC needs to review some items in the code." },
];

export const TAX_CODE_SPECIAL_RULES: Record<string, TaxCodeSpecialRule> = {
  BR: { rateRule: "basic-rate-only", allowanceTreatment: "no-allowance" },
  D0: { rateRule: "higher-rate-only", allowanceTreatment: "no-allowance" },
  D1: { rateRule: "additional-rate-only", allowanceTreatment: "no-allowance" },
  NT: { rateRule: "no-tax", allowanceTreatment: "no-allowance" },
  "0T": { rateRule: "standard-bands", allowanceTreatment: "no-allowance" },
};

function normalizeTaxCodeKey(value: string): string {
  return value.toUpperCase().replace(/\s+/g, "").trim();
}

export function getFluxQuickReferenceByCode(
  code: string,
): TaxCodeQuickReference | undefined {
  const normalized = normalizeTaxCodeKey(code);
  return FLUX_COMMON_TAX_CODE_REFERENCE.find(
    (entry) => normalizeTaxCodeKey(entry.code) === normalized,
  );
}
