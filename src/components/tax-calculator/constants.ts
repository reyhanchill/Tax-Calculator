import { StudentLoanPlan } from "@/lib/tax/types";

export type InputFrequency = "weekly" | "biweekly" | "monthly" | "annual";

export interface IncomeEntry {
  amount: number;
  frequency: InputFrequency;
}

export const FREQ_MULT: Record<InputFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  annual: 1,
};

export const FREQ_OPTIONS: { value: InputFrequency; short: string }[] = [
  { value: "weekly", short: "Wk" },
  { value: "biweekly", short: "2Wk" },
  { value: "monthly", short: "Mo" },
  { value: "annual", short: "Yr" },
];

export const INCOME_TYPES = [
  { key: "employment", label: "Employment", desc: "Salary, wages, bonuses from your employer", icon: "💼", color: "from-blue-500 to-blue-600" },
  { key: "selfEmployment", label: "Self-Employment", desc: "Net profits after allowable expenses", icon: "🏪", color: "from-emerald-500 to-emerald-600" },
  { key: "dividend", label: "Dividends", desc: "Dividends from company shares", icon: "📈", color: "from-violet-500 to-violet-600" },
  { key: "savings", label: "Savings Interest", desc: "Bank accounts, bonds, savings", icon: "🏦", color: "from-amber-500 to-amber-600" },
  { key: "rental", label: "Rental Income", desc: "Net income from letting property", icon: "🏠", color: "from-rose-500 to-rose-600" },
  { key: "pension", label: "Pension Income", desc: "State or private pension", icon: "👴", color: "from-teal-500 to-teal-600" },
  { key: "other", label: "Other Income", desc: "Any other taxable income", icon: "📋", color: "from-slate-500 to-slate-600" },
] as const;

export const STUDENT_LOAN_OPTIONS: { value: StudentLoanPlan; label: string; desc: string }[] = [
  { value: "plan1", label: "Plan 1", desc: "England/Wales before Sept 2012, or Northern Ireland" },
  { value: "plan2", label: "Plan 2", desc: "England/Wales Sept 2012 – Jul 2023" },
  { value: "plan4", label: "Plan 4", desc: "Scotland" },
  { value: "plan5", label: "Plan 5", desc: "England/Wales from Aug 2023" },
  { value: "postgraduate", label: "Postgraduate", desc: "Master's or Doctoral loan" },
];
