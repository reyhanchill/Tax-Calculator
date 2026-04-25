import { getTaxYearData } from "@/lib/tax/data";
import { calculateFullTax } from "@/lib/tax/calculators";
import {
  Country,
  FullTaxCalculation,
  StudentLoanPlan,
  TaxYear,
} from "@/lib/tax/types";

export type ScenarioGroup = "employee" | "self-employed" | "business-owner";

export interface ScenarioEngineInputs {
  taxYear: TaxYear;
  country: Country;
  taxCode: string;
  studentLoanPlans: StudentLoanPlan[];
  employeeSalary: number;
  employeeBonus: number;
  employeePensionRate: number;
  employeeEmployerRate: number;
  pensionUplift: number;
  salarySacrifice: boolean;
  selfEmployedProfit: number;
  selfEmployedPensionRate: number;
  companyProfit: number;
  ownerSalary: number;
  ownerDividends: number;
  ownerCompanyPension: number;
}

export interface ScenarioResult {
  id: string;
  label: string;
  description: string;
  group: ScenarioGroup;
  result: FullTaxCalculation;
  takeHome: number;
  totalTaxNow: number;
  retirementContribution: number;
  administrationComplexity: number;
  corporationTax: number;
  retainedProfit: number;
  weightedScore?: number;
}

export interface SmartOutcomeRecommendation {
  highestTakeHome: ScenarioResult;
  strongestRetirementGrowth: ScenarioResult;
  lowestImmediateTax: ScenarioResult;
  bestBalance: ScenarioResult;
}

export interface TaxRiskAlert {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  impact: string;
  action: string;
}

export interface TaxCalendarItem {
  id: string;
  title: string;
  dueDate: string;
  description: string;
}

const clampMoney = (value: number) => Math.max(0, Math.round(value * 100) / 100);

const totalPersonalTax = (result: FullTaxCalculation): number =>
  clampMoney(
    result.incomeTax.totalTax +
      result.nic.totalEmployee +
      result.studentLoans.reduce((sum, loan) => sum + loan.repayment, 0),
  );

const normalise = (value: number, min: number, max: number): number => {
  if (max === min) return 1;
  return (value - min) / (max - min);
};

export function estimateCorporationTax(taxableProfit: number): number {
  const profit = Math.max(0, taxableProfit);
  if (profit <= 50000) return clampMoney(profit * 0.19);
  if (profit >= 250000) return clampMoney(profit * 0.25);
  const marginalRate = 0.19 + ((profit - 50000) / 200000) * 0.06;
  return clampMoney(profit * marginalRate);
}

function makeScenario(
  input: Omit<ScenarioResult, "takeHome" | "totalTaxNow" | "retirementContribution" | "weightedScore">,
): ScenarioResult {
  const personalTax = totalPersonalTax(input.result);
  return {
    ...input,
    takeHome: clampMoney(input.result.takeHomePay),
    totalTaxNow: clampMoney(personalTax + input.corporationTax),
    retirementContribution: clampMoney(input.result.pension.totalContribution),
  };
}

function baseCalculation(
  inputs: ScenarioEngineInputs,
  override: Partial<{
    employmentIncome: number;
    selfEmploymentIncome: number;
    dividendIncome: number;
    pensionEmployeeRate: number;
    pensionEmployerRate: number;
    useSalarySacrifice: boolean;
  }>,
): FullTaxCalculation {
  return calculateFullTax({
    taxYear: inputs.taxYear,
    country: inputs.country,
    employmentIncome: clampMoney(override.employmentIncome ?? 0),
    selfEmploymentIncome: clampMoney(override.selfEmploymentIncome ?? 0),
    dividendIncome: clampMoney(override.dividendIncome ?? 0),
    savingsIncome: 0,
    rentalIncome: 0,
    pensionIncome: 0,
    otherIncome: 0,
    taxCode: inputs.taxCode || undefined,
    studentLoanPlans: inputs.studentLoanPlans,
    pensionEmployeeRate: Math.max(0, override.pensionEmployeeRate ?? 0),
    pensionEmployerRate: Math.max(0, override.pensionEmployerRate ?? 0),
    useSalarySacrifice: override.useSalarySacrifice ?? false,
  });
}

function withRetirementContribution(
  scenario: ScenarioResult,
  explicitContribution: number,
): ScenarioResult {
  return {
    ...scenario,
    retirementContribution: clampMoney(
      scenario.retirementContribution + Math.max(0, explicitContribution),
    ),
  };
}

export function buildScenarioResults(inputs: ScenarioEngineInputs): ScenarioResult[] {
  const employeeCurrentResult = baseCalculation(inputs, {
    employmentIncome: inputs.employeeSalary,
    pensionEmployeeRate: inputs.employeePensionRate,
    pensionEmployerRate: inputs.employeeEmployerRate,
    useSalarySacrifice: false,
  });

  const employeeBonusResult = baseCalculation(inputs, {
    employmentIncome: inputs.employeeSalary + inputs.employeeBonus,
    pensionEmployeeRate: inputs.employeePensionRate,
    pensionEmployerRate: inputs.employeeEmployerRate,
    useSalarySacrifice: false,
  });

  const employeePensionUpliftResult = baseCalculation(inputs, {
    employmentIncome: inputs.employeeSalary,
    pensionEmployeeRate: inputs.employeePensionRate + inputs.pensionUplift,
    pensionEmployerRate: inputs.employeeEmployerRate,
    useSalarySacrifice: false,
  });

  const employeeSalarySacrificeResult = baseCalculation(inputs, {
    employmentIncome: inputs.employeeSalary,
    pensionEmployeeRate: inputs.employeePensionRate + inputs.pensionUplift,
    pensionEmployerRate: inputs.employeeEmployerRate,
    useSalarySacrifice: inputs.salarySacrifice,
  });

  const soleTraderBaselineResult = baseCalculation(inputs, {
    selfEmploymentIncome: inputs.selfEmployedProfit,
    pensionEmployeeRate: 0,
    pensionEmployerRate: 0,
  });

  const soleTraderPensionResult = baseCalculation(inputs, {
    selfEmploymentIncome: inputs.selfEmployedProfit,
    pensionEmployeeRate: inputs.selfEmployedPensionRate,
    pensionEmployerRate: 0,
  });

  const ownerSalaryOnlyResult = baseCalculation(inputs, {
    employmentIncome: inputs.ownerSalary,
    pensionEmployeeRate: inputs.employeePensionRate,
    pensionEmployerRate: 0,
    useSalarySacrifice: false,
  });

  const ownerSalaryDividendResult = baseCalculation(inputs, {
    employmentIncome: inputs.ownerSalary,
    dividendIncome: inputs.ownerDividends,
    pensionEmployeeRate: inputs.employeePensionRate,
    pensionEmployerRate: 0,
    useSalarySacrifice: false,
  });

  const ownerSalaryCompanyPensionResult = baseCalculation(inputs, {
    employmentIncome: inputs.ownerSalary,
    pensionEmployeeRate: inputs.employeePensionRate,
    pensionEmployerRate: 0,
    useSalarySacrifice: false,
  });

  const corpTaxSalaryOnly = estimateCorporationTax(inputs.companyProfit - inputs.ownerSalary);
  const retainedSalaryOnly = clampMoney(inputs.companyProfit - inputs.ownerSalary - corpTaxSalaryOnly);

  const corpTaxSalaryDividend = estimateCorporationTax(inputs.companyProfit - inputs.ownerSalary);
  const retainedSalaryDividend = clampMoney(
    inputs.companyProfit - inputs.ownerSalary - corpTaxSalaryDividend - inputs.ownerDividends,
  );

  const corpTaxSalaryPension = estimateCorporationTax(
    inputs.companyProfit - inputs.ownerSalary - inputs.ownerCompanyPension,
  );
  const retainedSalaryPension = clampMoney(
    inputs.companyProfit -
      inputs.ownerSalary -
      inputs.ownerCompanyPension -
      corpTaxSalaryPension,
  );

  return [
    makeScenario({
      id: "employee-current",
      label: "Employee: Current salary",
      description: "PAYE baseline using current salary and pension settings.",
      group: "employee",
      result: employeeCurrentResult,
      administrationComplexity: 1,
      corporationTax: 0,
      retainedProfit: 0,
    }),
    makeScenario({
      id: "employee-bonus",
      label: "Employee: Salary + bonus",
      description: "Adds annual bonus to salary to model marginal-rate impact.",
      group: "employee",
      result: employeeBonusResult,
      administrationComplexity: 1,
      corporationTax: 0,
      retainedProfit: 0,
    }),
    makeScenario({
      id: "employee-pension-uplift",
      label: "Employee: Salary + pension uplift",
      description: "Increases pension contribution rate to test tax efficiency.",
      group: "employee",
      result: employeePensionUpliftResult,
      administrationComplexity: 2,
      corporationTax: 0,
      retainedProfit: 0,
    }),
    makeScenario({
      id: "employee-salary-sacrifice",
      label: "Employee: Salary sacrifice option",
      description: "Models salary sacrifice with higher pension contribution.",
      group: "employee",
      result: employeeSalarySacrificeResult,
      administrationComplexity: 3,
      corporationTax: 0,
      retainedProfit: 0,
    }),
    makeScenario({
      id: "sole-trader-baseline",
      label: "Self-employed: Sole trader baseline",
      description: "Standard sole trader tax/NIC outcome with no pension uplift.",
      group: "self-employed",
      result: soleTraderBaselineResult,
      administrationComplexity: 4,
      corporationTax: 0,
      retainedProfit: 0,
    }),
    makeScenario({
      id: "sole-trader-pension",
      label: "Self-employed: Sole trader + pension",
      description: "Adds pension contribution to compare immediate vs long-term value.",
      group: "self-employed",
      result: soleTraderPensionResult,
      administrationComplexity: 5,
      corporationTax: 0,
      retainedProfit: 0,
    }),
    makeScenario({
      id: "owner-salary-only",
      label: "Business owner: Salary only",
      description: "Director takes salary and leaves post-tax company profits retained.",
      group: "business-owner",
      result: ownerSalaryOnlyResult,
      administrationComplexity: 5,
      corporationTax: corpTaxSalaryOnly,
      retainedProfit: retainedSalaryOnly,
    }),
    makeScenario({
      id: "owner-salary-dividends",
      label: "Business owner: Salary + dividends",
      description: "Director extraction plan mixing salary and dividends.",
      group: "business-owner",
      result: ownerSalaryDividendResult,
      administrationComplexity: 6,
      corporationTax: corpTaxSalaryDividend,
      retainedProfit: retainedSalaryDividend,
    }),
    withRetirementContribution(
      makeScenario({
        id: "owner-salary-company-pension",
        label: "Business owner: Salary + company pension",
        description:
          "Models employer pension contribution from company profits before corporation tax.",
        group: "business-owner",
        result: ownerSalaryCompanyPensionResult,
        administrationComplexity: 6,
        corporationTax: corpTaxSalaryPension,
        retainedProfit: retainedSalaryPension,
      }),
      inputs.ownerCompanyPension,
    ),
  ];
}

export function buildSmartOutcomeRecommendation(
  scenarios: ScenarioResult[],
): SmartOutcomeRecommendation {
  if (scenarios.length === 0) {
    throw new Error("At least one scenario is required to compute outcomes.");
  }

  const takeHomes = scenarios.map((scenario) => scenario.takeHome);
  const taxes = scenarios.map((scenario) => scenario.totalTaxNow);
  const retirement = scenarios.map((scenario) => scenario.retirementContribution);
  const complexity = scenarios.map((scenario) => scenario.administrationComplexity);

  const scored = scenarios.map((scenario) => {
    const takeHomeScore = normalise(
      scenario.takeHome,
      Math.min(...takeHomes),
      Math.max(...takeHomes),
    );
    const retirementScore = normalise(
      scenario.retirementContribution,
      Math.min(...retirement),
      Math.max(...retirement),
    );
    const taxScore =
      1 -
      normalise(
        scenario.totalTaxNow,
        Math.min(...taxes),
        Math.max(...taxes),
      );
    const complexityScore =
      1 -
      normalise(
        scenario.administrationComplexity,
        Math.min(...complexity),
        Math.max(...complexity),
      );

    const weightedScore =
      takeHomeScore * 0.4 +
      retirementScore * 0.25 +
      taxScore * 0.25 +
      complexityScore * 0.1;

    return {
      ...scenario,
      weightedScore: Math.round(weightedScore * 1000) / 1000,
    };
  });

  const byTakeHome = [...scored].sort((a, b) => b.takeHome - a.takeHome);
  const byRetirement = [...scored].sort(
    (a, b) => b.retirementContribution - a.retirementContribution,
  );
  const byTax = [...scored].sort((a, b) => a.totalTaxNow - b.totalTaxNow);
  const byBalance = [...scored].sort(
    (a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0),
  );

  return {
    highestTakeHome: byTakeHome[0],
    strongestRetirementGrowth: byRetirement[0],
    lowestImmediateTax: byTax[0],
    bestBalance: byBalance[0],
  };
}

export function generateTaxRiskAlerts(
  inputs: ScenarioEngineInputs,
  focusScenario: ScenarioResult,
): TaxRiskAlert[] {
  const alerts: TaxRiskAlert[] = [];
  const totalIncome = focusScenario.result.totalIncome;
  const taxYearData = getTaxYearData(inputs.taxYear);
  const taxCode = (inputs.taxCode || "").toUpperCase();

  if (totalIncome > 100000 && totalIncome < 125140) {
    const allowanceLoss = Math.min(12570, (totalIncome - 100000) / 2);
    const estimatedImpact = allowanceLoss * 0.4;
    alerts.push({
      id: "pa-taper",
      title: "Personal allowance taper risk",
      severity: "high",
      impact: `Estimated additional tax from allowance taper: £${estimatedImpact.toFixed(0)}/yr.`,
      action:
        "Consider pension contributions or salary/dividend restructuring to keep adjusted income below £100,000.",
    });
  }

  if (totalIncome > 50270 && totalIncome < 56000) {
    alerts.push({
      id: "higher-rate-edge",
      title: "Higher-rate threshold crossing",
      severity: "medium",
      impact:
        "A portion of additional income may now be taxed at higher rates, reducing marginal take-home.",
      action:
        "Model pension uplift or salary sacrifice to reduce higher-rate exposure.",
    });
  }

  if (totalIncome > 50000) {
    const estimatedCharge = Math.min(100, ((totalIncome - 50000) / 100) * 1);
    alerts.push({
      id: "child-benefit",
      title: "Child benefit high-income charge warning",
      severity: "medium",
      impact: `Potential charge applies above £50,000 adjusted net income (estimated recovery rate ${Math.round(
        estimatedCharge,
      )}%).`,
      action:
        "If relevant to your household, review pension contributions to reduce adjusted net income.",
    });
  }

  const turnoverSignal = Math.max(inputs.selfEmployedProfit, inputs.companyProfit);
  if (turnoverSignal >= 70000 && turnoverSignal < 90000) {
    alerts.push({
      id: "vat-proximity",
      title: "VAT registration proximity",
      severity: "medium",
      impact:
        "You are approaching the VAT registration threshold, which can materially affect pricing and cashflow.",
      action: "Track rolling 12-month turnover and prepare VAT registration plan.",
    });
  }

  for (const plan of inputs.studentLoanPlans) {
    const planData = taxYearData.studentLoans[plan];
    if (!planData) continue;
    const distance = Math.abs(totalIncome - planData.threshold);
    if (distance <= 3000) {
      alerts.push({
        id: `student-loan-${plan}`,
        title: `Student loan threshold watch (${plan.toUpperCase()})`,
        severity: "low",
        impact: `Income is within £${Math.round(distance)} of the repayment threshold (£${planData.threshold.toLocaleString()}).`,
        action:
          "Model salary/dividend timing and pension contributions to smooth repayments.",
      });
    }
  }

  if (/(W1|M1|X)/.test(taxCode)) {
    alerts.push({
      id: "emergency-tax-code",
      title: "Emergency tax code detected",
      severity: "high",
      impact:
        "Emergency tax codes can over-deduct tax until HMRC updates your cumulative records.",
      action: "Request a tax code review with HMRC and monitor subsequent payslips.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "no-major-risks",
      title: "No immediate threshold risks detected",
      severity: "low",
      impact: "Current inputs are not triggering major UK threshold warnings.",
      action: "Re-run scenarios after material income or contribution changes.",
    });
  }

  return alerts;
}

export function buildTaxCalendar(taxYear: TaxYear): TaxCalendarItem[] {
  const [startYearRaw] = taxYear.split("-");
  const startYear = Number(startYearRaw);
  const filingYear = startYear + 2;
  const paymentYear = startYear + 1;

  return [
    {
      id: "sa-filing",
      title: "Self Assessment filing deadline",
      dueDate: `31 Jan ${filingYear}`,
      description: "Submit online Self Assessment return by this date.",
    },
    {
      id: "poa-1",
      title: "Payment on account (1st installment)",
      dueDate: `31 Jan ${filingYear}`,
      description:
        "First payment on account due with balancing payment for prior year.",
    },
    {
      id: "poa-2",
      title: "Payment on account (2nd installment)",
      dueDate: `31 Jul ${filingYear}`,
      description: "Second payment on account due mid-year.",
    },
    {
      id: "corp-tax",
      title: "Corporation tax planning checkpoint",
      dueDate: `1 Jan ${filingYear}`,
      description:
        "Typical planning target: reserve cash at least 9 months after year end.",
    },
    {
      id: "paye-reminder",
      title: "PAYE deadline reminder",
      dueDate: `Monthly by 22nd (${paymentYear}/${paymentYear + 1})`,
      description: "Reminder only for cash planning and compliance awareness.",
    },
  ];
}

export function scenarioToIncomeItems(
  scenario: ScenarioResult,
): Array<{ type: string; amount: number; description: string }> {
  const result = scenario.result;
  const items: Array<{ type: string; amount: number; description: string }> = [];
  const mapping: Array<{ type: string; value: number }> = [
    { type: "employment", value: result.employmentIncome },
    { type: "self-employment", value: result.selfEmploymentIncome },
    { type: "dividend", value: result.dividendIncome },
    { type: "savings", value: result.savingsIncome },
    { type: "rental", value: result.rentalIncome },
    { type: "pension", value: result.pensionIncome },
    { type: "other", value: result.otherIncome },
  ];

  for (const entry of mapping) {
    if (entry.value > 0) {
      items.push({
        type: entry.type,
        amount: clampMoney(entry.value),
        description: `${scenario.label} scenario`,
      });
    }
  }

  return items;
}
