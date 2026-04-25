export interface LandingFeature {
  title: string;
  desc: string;
}
export interface RoadmapItem {
  title: string;
  timeline: string;
  description: string;
}

export interface PlatformModule {
  title: string;
  description: string;
  features: string[];
  href: string;
  accentBarClass: string;
  titleClass: string;
  bulletClass: string;
  buttonClass: string;
}

export const LANDING_FEATURES: LandingFeature[] = [
  { title: "Income Tax", desc: "PAYE, tax codes, personal allowance, and band calculations." },
  { title: "National Insurance", desc: "Class 1, 2, and 4 for employees and self-employed users." },
  { title: "Student Loans", desc: "Plan 1, 2, 4, 5, and postgraduate repayment handling." },
  { title: "Pensions", desc: "Contribution modelling, salary sacrifice, and tax relief impact." },
  { title: "Capital Gains", desc: "Shares and property gains with annual exemption support." },
  { title: "Multi-year coverage", desc: "UK rates and thresholds across available tax years." },
  { title: "Smart recommendations", desc: "Outcome cards to support faster tax decisions." },
  { title: "Secure data handling", desc: "Encrypted account records and privacy-first storage." },
];
export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    title: "Compare Options Workspace",
    timeline: "In progress",
    description:
      "A side-by-side comparison view to test tax outcomes before choosing the best income strategy.",
  },
  {
    title: "Pension Centre",
    timeline: "Next release",
    description:
      "A focused pension area for contribution tuning, salary sacrifice impact, and retirement tax efficiency insights.",
  },
  {
    title: "Save & Export Outcomes",
    timeline: "Roadmap",
    description:
      "Save generated tax outcomes into structured files and export results for sharing, records, and follow-up planning.",
  },
];

export const PLATFORM_MODULES: PlatformModule[] = [
  {
    title: "Personal Tax Calculator",
    description:
      "For employed individuals. Calculate your Income Tax, National Insurance, Student Loans, and Pension contributions based on your salary and tax code.",
    features: [
      "PAYE Income Tax with tax code support",
      "National Insurance (Class 1)",
      "Student Loan repayments",
      "Pension auto-enrolment & salary sacrifice",
      "Capital Gains Tax",
      "Smart tax-saving recommendations",
    ],
    href: "/register?type=individual",
    accentBarClass: "bg-[#188a4b]",
    titleClass: "text-[#188a4b]",
    bulletClass: "bg-[#188a4b]/10 text-[#188a4b]",
    buttonClass: "bg-[#188a4b] hover:bg-[#14733f]",
  },
  {
    title: "Self-Employed Assessment",
    description:
      "For sole traders and freelancers. Enter your business turnover and expenses to calculate your profits, tax, NIC, and payments on account.",
    features: [
      "Business income & allowable expenses",
      "Trading Allowance (£1,000)",
      "Class 2 & Class 4 NIC",
      "Income Tax on profits",
      "Payments on account estimate",
      "Smart tax-saving recommendations",
    ],
    href: "/register?type=self-employed",
    accentBarClass: "bg-[#3b82f6]",
    titleClass: "text-[#2563eb]",
    bulletClass: "bg-[#2563eb]/10 text-[#2563eb]",
    buttonClass: "bg-[#2563eb] hover:bg-[#1d4ed8]",
  },
  {
    title: "Business Tax Strategy",
    description:
      "For business owners and directors. Plan salary, dividends, corporation tax, and pension contributions for tax-efficient profit extraction.",
    features: [
      "Salary vs dividend planner",
      "Corporation tax estimator",
      "Profit extraction planner",
      "Company pension contribution modelling",
      "Tax risk alerts and deadlines",
      "Smart outcome recommendations",
    ],
    href: "/register?type=business",
    accentBarClass: "bg-[#8b5cf6]",
    titleClass: "text-[#7c3aed]",
    bulletClass: "bg-[#7c3aed]/10 text-[#7c3aed]",
    buttonClass: "bg-[#7c3aed] hover:bg-[#6d28d9]",
  },
];
