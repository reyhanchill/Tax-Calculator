import { StudentLoanPlan } from "@/lib/tax/types";

export const EXPENSE_CATEGORIES = [
  { key: "officeSupplies", label: "Office & Supplies", desc: "Stationery, postage, printing, software", icon: "📎" },
  { key: "travel", label: "Travel & Vehicle", desc: "Fuel, public transport, parking, insurance", icon: "🚗" },
  { key: "premises", label: "Premises & Utilities", desc: "Rent, rates, electricity, water, broadband", icon: "🏢" },
  { key: "professional", label: "Professional Fees", desc: "Accountant, solicitor, subscriptions", icon: "⚖️" },
  { key: "marketing", label: "Marketing & Ads", desc: "Website hosting, ads, business cards", icon: "📢" },
  { key: "staffCosts", label: "Staff Costs", desc: "Subcontractors, freelancers, temps", icon: "👥" },
  { key: "insurance", label: "Insurance", desc: "Public liability, professional indemnity", icon: "🛡️" },
  { key: "costOfGoods", label: "Cost of Goods Sold", desc: "Materials, stock, raw goods for resale", icon: "📦" },
  { key: "other", label: "Other Allowable", desc: "Training, tools, bad debts, telephone", icon: "📋" },
] as const;

export const SELF_EMPLOYED_STUDENT_LOAN_OPTIONS: { value: StudentLoanPlan; label: string }[] = [
  { value: "plan1", label: "Plan 1" },
  { value: "plan2", label: "Plan 2" },
  { value: "plan4", label: "Plan 4 (Scotland)" },
  { value: "plan5", label: "Plan 5" },
  { value: "postgraduate", label: "Postgraduate" },
];
