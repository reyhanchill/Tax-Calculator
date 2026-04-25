"use client";

import { useMemo, useState } from "react";
import { TAX_YEAR_OPTIONS } from "@/lib/tax/data";
import { estimateCorporationTax } from "@/lib/business/scenarios";
import { calculateFullTax, calculateNIC } from "@/lib/tax/calculators";
import { Country, StudentLoanPlan, TaxYear } from "@/lib/tax/types";
import { formatCurrency } from "@/lib/utils";
import { STUDENT_LOAN_OPTIONS } from "@/components/business-tax/constants";
import { FieldInput, FieldSelect, StatRow, SummaryCard } from "@/components/business-tax/ui";
import { alignTaxCodeWithCountry, normalizeCountryAndTaxCode } from "@/lib/tax/countryTaxCode";

interface BusinessTaxHubProps {
  defaultCountry: Country;
  defaultTaxCode: string;
  defaultStudentLoanPlans: StudentLoanPlan[];
  defaultPensionEmployeeRate: number;
}


export default function BusinessTaxHub({
  defaultCountry,
  defaultTaxCode,
  defaultStudentLoanPlans,
  defaultPensionEmployeeRate,
}: BusinessTaxHubProps) {
  const initialCountryTax = normalizeCountryAndTaxCode(defaultCountry, defaultTaxCode);
  const [taxYear, setTaxYear] = useState<TaxYear>("2025-26");
  const [country, setCountry] = useState<Country>(initialCountryTax.country);
  const [taxCode, setTaxCode] = useState(initialCountryTax.taxCode);
  const [studentLoanPlans, setStudentLoanPlans] = useState<StudentLoanPlan[]>(defaultStudentLoanPlans);

  const [turnover, setTurnover] = useState(0);
  const [allowableExpenses, setAllowableExpenses] = useState(0);
  const [staffPayroll, setStaffPayroll] = useState(0);
  const [directorSalary, setDirectorSalary] = useState(0);
  const [directorDividends, setDirectorDividends] = useState(0);
  const [companyPensionContributions, setCompanyPensionContributions] = useState(0);
  const [capitalAllowances, setCapitalAllowances] = useState(0);
  const [directorPensionRate, setDirectorPensionRate] = useState(defaultPensionEmployeeRate);

  const [vatRegistered, setVatRegistered] = useState(false);
  const [vatCollected, setVatCollected] = useState(0);
  const [vatReclaimable, setVatReclaimable] = useState(0);

  const employerNic = useMemo(() => {
    return calculateNIC(staffPayroll + directorSalary, 0, taxYear).class1Employer;
  }, [staffPayroll, directorSalary, taxYear]);

  const deductibleCosts = useMemo(
    () =>
      allowableExpenses +
      staffPayroll +
      directorSalary +
      companyPensionContributions +
      capitalAllowances +
      employerNic,
    [
      allowableExpenses,
      staffPayroll,
      directorSalary,
      companyPensionContributions,
      capitalAllowances,
      employerNic,
    ],
  );

  const taxableProfit = useMemo(() => Math.max(0, turnover - deductibleCosts), [turnover, deductibleCosts]);
  const corporationTax = useMemo(() => estimateCorporationTax(taxableProfit), [taxableProfit]);
  const postTaxProfit = useMemo(
    () => Math.max(0, taxableProfit - corporationTax),
    [taxableProfit, corporationTax],
  );

  const vatDue = useMemo(
    () => (vatRegistered ? Math.max(0, vatCollected - vatReclaimable) : 0),
    [vatRegistered, vatCollected, vatReclaimable],
  );
  const vatRefund = useMemo(
    () => (vatRegistered ? Math.max(0, vatReclaimable - vatCollected) : 0),
    [vatRegistered, vatCollected, vatReclaimable],
  );

  const retainedProfit = useMemo(
    () => postTaxProfit - directorDividends,
    [postTaxProfit, directorDividends],
  );
  const dividendShortfall = useMemo(
    () => Math.max(0, directorDividends - postTaxProfit),
    [directorDividends, postTaxProfit],
  );

  const directorTaxResult = useMemo(
    () =>
      calculateFullTax({
        taxYear,
        country,
        employmentIncome: directorSalary,
        selfEmploymentIncome: 0,
        dividendIncome: directorDividends,
        savingsIncome: 0,
        rentalIncome: 0,
        pensionIncome: 0,
        otherIncome: 0,
        taxCode: taxCode || undefined,
        studentLoanPlans,
        pensionEmployeeRate: directorPensionRate,
        pensionEmployerRate: 0,
        useSalarySacrifice: false,
      }),
    [
      taxYear,
      country,
      directorSalary,
      directorDividends,
      taxCode,
      studentLoanPlans,
      directorPensionRate,
    ],
  );

  const directorStudentLoanTotal = useMemo(
    () => directorTaxResult.studentLoans.reduce((sum, loan) => sum + loan.repayment, 0),
    [directorTaxResult.studentLoans],
  );

  const directorPersonalTax = useMemo(
    () =>
      directorTaxResult.incomeTax.totalTax +
      directorTaxResult.nic.totalEmployee +
      directorStudentLoanTotal,
    [directorTaxResult, directorStudentLoanTotal],
  );

  const businessTaxDue = useMemo(
    () => corporationTax + employerNic + vatDue,
    [corporationTax, employerNic, vatDue],
  );
  const countryTaxNote = useMemo(() => {
    switch (country) {
      case "scotland":
        return "Scottish income tax rates apply for director personal-tax projections.";
      case "wales":
        return "Welsh profile selected. Welsh income tax currently mirrors rUK rates in this tax year.";
      case "northern-ireland":
        return "Northern Ireland profile selected. Income tax currently mirrors rUK rates in this tax year.";
      case "england":
      default:
        return "England profile selected. Standard rUK income tax bands apply.";
    }
  }, [country]);

  const cardClass = "bg-white rounded-2xl border border-slate-200";
  const handleCountryChange = (nextCountry: Country) => {
    setCountry(nextCountry);
    setTaxCode((prev) => alignTaxCodeWithCountry(prev, nextCountry));
  };
  const handleTaxCodeChange = (nextTaxCode: string) => {
    const normalized = normalizeCountryAndTaxCode(country, nextTaxCode);
    setCountry(normalized.country);
    setTaxCode(normalized.taxCode);
  };

  return (
    <div className="space-y-6">
      <div className={`${cardClass} p-6`}>
        <h2 className="text-lg font-bold text-slate-800">Business Tax Workspace</h2>
        <p className="text-sm text-slate-500 mt-1">
          Run your business tax numbers with practical company inputs: turnover, costs,
          payroll, VAT, corporation tax, and director extraction.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <FieldSelect
            label="Tax year"
            value={taxYear}
            onChange={(value) => setTaxYear(value as TaxYear)}
            options={TAX_YEAR_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <FieldSelect
            label="Country"
            value={country}
            onChange={(value) => handleCountryChange(value as Country)}
            options={[
              { value: "england", label: "England" },
              { value: "scotland", label: "Scotland" },
              { value: "wales", label: "Wales" },
              { value: "northern-ireland", label: "Northern Ireland" },
            ]}
          />
          <FieldInput
            label="Director tax code"
            value={taxCode}
            onChange={(value) => handleTaxCodeChange(String(value))}
            type="text"
          />
        </div>
        <p className="text-[11px] text-emerald-600 mt-3 font-medium">{countryTaxNote}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardClass} p-6`}>
          <h3 className="text-base font-semibold text-slate-800">Company income & costs</h3>
          <p className="text-xs text-slate-500 mt-1">
            Enter annual figures used to estimate company taxable profit.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <FieldInput
              label="Annual turnover (£)"
              value={turnover}
              onChange={(value) => setTurnover(Number(value) || 0)}
            />
            <FieldInput
              label="Allowable expenses (£)"
              value={allowableExpenses}
              onChange={(value) => setAllowableExpenses(Number(value) || 0)}
            />
            <FieldInput
              label="Staff payroll (excl. director) (£)"
              value={staffPayroll}
              onChange={(value) => setStaffPayroll(Number(value) || 0)}
            />
            <FieldInput
              label="Capital allowances (£)"
              value={capitalAllowances}
              onChange={(value) => setCapitalAllowances(Number(value) || 0)}
            />
            <FieldInput
              label="Director salary (£)"
              value={directorSalary}
              onChange={(value) => setDirectorSalary(Number(value) || 0)}
            />
            <FieldInput
              label="Company pension contributions (£)"
              value={companyPensionContributions}
              onChange={(value) => setCompanyPensionContributions(Number(value) || 0)}
            />
          </div>
        </div>

        <div className={`${cardClass} p-6`}>
          <h3 className="text-base font-semibold text-slate-800">Director extraction</h3>
          <p className="text-xs text-slate-500 mt-1">
            Estimate personal tax impact from salary, dividends, and pension rate.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <FieldInput
              label="Planned dividends (£)"
              value={directorDividends}
              onChange={(value) => setDirectorDividends(Number(value) || 0)}
            />
            <FieldInput
              label="Director pension rate (%)"
              value={directorPensionRate * 100}
              onChange={(value) =>
                setDirectorPensionRate(Math.max(0, Number(value) / 100))
              }
            />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Student loan plans
            </p>
            <div className="flex flex-wrap gap-2">
              {STUDENT_LOAN_OPTIONS.map((plan) => {
                const active = studentLoanPlans.includes(plan.value);
                return (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => {
                      setStudentLoanPlans((prev) =>
                        prev.includes(plan.value)
                          ? prev.filter((item) => item !== plan.value)
                          : [...prev, plan.value],
                      );
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border ${active
                      ? "bg-[#188a4b] text-white border-[#188a4b]"
                      : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {plan.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-base font-semibold text-slate-800">VAT position</h3>
            <p className="text-xs text-slate-500 mt-1">
              Include VAT only if your business is VAT registered.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={vatRegistered}
              onChange={(event) => setVatRegistered(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            VAT registered
          </label>
        </div>

        {vatRegistered && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <FieldInput
              label="VAT collected on sales (£)"
              value={vatCollected}
              onChange={(value) => setVatCollected(Number(value) || 0)}
            />
            <FieldInput
              label="VAT reclaimable on costs (£)"
              value={vatReclaimable}
              onChange={(value) => setVatReclaimable(Number(value) || 0)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Taxable company profit"
          value={formatCurrency(taxableProfit)}
          tone="primary"
        />
        <SummaryCard
          title="Corporation tax"
          value={formatCurrency(corporationTax)}
          tone="danger"
        />
        <SummaryCard
          title="Employer NIC estimate"
          value={formatCurrency(employerNic)}
          tone="danger"
        />
        <SummaryCard
          title={vatRefund > 0 ? "VAT repayment" : "VAT payable"}
          value={formatCurrency(vatRefund > 0 ? vatRefund : vatDue)}
          tone={vatRefund > 0 ? "success" : "danger"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardClass} p-6`}>
          <h3 className="text-base font-semibold text-slate-800">Company tax breakdown</h3>
          <div className="space-y-2 mt-4 text-sm">
            <StatRow label="Turnover" value={formatCurrency(turnover)} tone="income" />
            <StatRow label="Total deductible costs" value={formatCurrency(deductibleCosts)} tone="deduction" />
            <StatRow label="Taxable company profit" value={formatCurrency(taxableProfit)} tone="income" />
            <StatRow label="Corporation tax" value={`-${formatCurrency(corporationTax)}`} tone="deduction" />
            <StatRow
              label={vatRefund > 0 ? "VAT repayment" : "VAT payable"}
              value={`${vatRefund > 0 ? "+" : "-"}${formatCurrency(vatRefund > 0 ? vatRefund : vatDue)}`}
              tone={vatRefund > 0 ? "income" : "deduction"}
            />
            <div className="h-px bg-slate-100 my-1" />
            <StatRow label="Post-tax profit" value={formatCurrency(postTaxProfit)} tone="income" strong />
            <StatRow label="Planned dividends" value={`-${formatCurrency(directorDividends)}`} tone="deduction" />
            <StatRow label="Estimated retained profit" value={formatCurrency(retainedProfit)} tone={retainedProfit >= 0 ? "income" : "deduction"} strong />
          </div>

          {dividendShortfall > 0 && (
            <div className="mt-4 p-3 rounded-xl border border-amber-200 bg-amber-50">
              <p className="text-xs text-amber-700 font-medium">
                Planned dividends exceed post-tax profit by {formatCurrency(dividendShortfall)}.
                Reduce dividends or increase retained earnings to avoid over-distribution.
              </p>
            </div>
          )}
        </div>

        <div className={`${cardClass} p-6`}>
          <h3 className="text-base font-semibold text-slate-800">Director personal tax estimate</h3>
          <p className="text-xs text-slate-500 mt-1">
            Estimated from salary + dividends using your selected tax code and plans.
          </p>
          <div className="space-y-2 mt-4 text-sm">
            <StatRow label="Director gross income" value={formatCurrency(directorTaxResult.totalIncome)} tone="income" />
            <StatRow label="Income tax" value={`-${formatCurrency(directorTaxResult.incomeTax.totalTax)}`} tone="deduction" />
            <StatRow label="Employee NIC" value={`-${formatCurrency(directorTaxResult.nic.totalEmployee)}`} tone="deduction" />
            <StatRow label="Student loan" value={`-${formatCurrency(directorStudentLoanTotal)}`} tone="deduction" />
            <div className="h-px bg-slate-100 my-1" />
            <StatRow label="Director personal tax total" value={formatCurrency(directorPersonalTax)} tone="deduction" strong />
            <StatRow label="Director take-home estimate" value={formatCurrency(directorTaxResult.takeHomePay)} tone="income" strong />
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <h3 className="text-base font-semibold text-slate-800">Business tax compliance checklist</h3>
        <p className="text-xs text-slate-500 mt-1">
          Key obligations to track while preparing company taxes.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>• Corporation Tax payment is due 9 months and 1 day after your accounting period end.</li>
          <li>• CT600 return filing is due within 12 months after your accounting period end.</li>
          <li>• PAYE/NIC for payroll is usually due monthly by the 22nd (electronic payment).</li>
          {vatRegistered && (
            <li>• VAT returns/payment are typically due one month and 7 days after each VAT quarter.</li>
          )}
        </ul>
        <div className="mt-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-700 font-medium">
            Estimated business taxes due now: {formatCurrency(businessTaxDue)}
          </p>
        </div>
      </div>
    </div>
  );
}
