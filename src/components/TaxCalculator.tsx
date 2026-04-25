"use client";

import { useState, useMemo, useCallback, createContext, useContext } from "react";
import { TAX_YEAR_OPTIONS, isClaimableYear, getTaxYearData } from "@/lib/tax/data";
import { TaxYear, Country, StudentLoanPlan, CGTAssetType } from "@/lib/tax/types";
import { calculateFullTax, parseTaxCode, TaxInputs } from "@/lib/tax/calculators";
import { formatCurrency, annualToPayPeriod, PayPeriod, payPeriodLabel } from "@/lib/utils";
import { generateRecommendations } from "@/lib/tax/recommendations";
import { alignTaxCodeWithCountry, normalizeCountryAndTaxCode } from "@/lib/tax/countryTaxCode";
import {
  FREQ_MULT,
  FREQ_OPTIONS,
  INCOME_TYPES,
  STUDENT_LOAN_OPTIONS,
  type IncomeEntry,
  type InputFrequency,
} from "@/components/tax-calculator/constants";

// Tooltip context — single-open behaviour
const TipCtx = createContext<{ openId: string | null; set: (id: string | null) => void }>({ openId: null, set: () => {} });


interface TaxCalculatorProps {
  defaultCountry: Country;
  defaultTaxCode: string;
  defaultStudentLoanPlans: StudentLoanPlan[];
  defaultPensionEmployeeRate: number;
  defaultPensionEmployerRate: number;
  defaultSalarySacrifice: boolean;
}

function toAnnual(e: IncomeEntry) { return e.amount * FREQ_MULT[e.frequency]; }
function defEntry(): IncomeEntry { return { amount: 0, frequency: "annual" }; }

export default function TaxCalculator(props: TaxCalculatorProps) {
  const initialCountryTax = normalizeCountryAndTaxCode(
    props.defaultCountry,
    props.defaultTaxCode,
  );
  const [taxYear, setTaxYear] = useState<TaxYear>("2025-26");
  const [country, setCountry] = useState<Country>(initialCountryTax.country);
  const [taxCode, setTaxCode] = useState(initialCountryTax.taxCode);
  const [payPeriod, setPayPeriod] = useState<PayPeriod>("annual");
  const [income, setIncome] = useState<Record<string, IncomeEntry>>({
    employment: defEntry(), selfEmployment: defEntry(), dividend: defEntry(),
    savings: defEntry(), rental: defEntry(), pension: defEntry(), other: defEntry(),
  });
  const [studentLoanPlans, setStudentLoanPlans] = useState<StudentLoanPlan[]>(props.defaultStudentLoanPlans);
  const [pensionEmployeeRate, setPensionEmployeeRate] = useState(props.defaultPensionEmployeeRate);
  const [pensionEmployerRate, setPensionEmployerRate] = useState(props.defaultPensionEmployerRate);
  const [useSalarySacrifice, setUseSalarySacrifice] = useState(props.defaultSalarySacrifice);
  const [includePension, setIncludePension] = useState(true);
  const [showCGT, setShowCGT] = useState(false);
  const [cgtGain, setCgtGain] = useState(0);
  const [cgtAssetType, setCgtAssetType] = useState<CGTAssetType>("other");
  const [cgtLosses, setCgtLosses] = useState(0);
  const [openTip, setOpenTip] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const annualIncome = useMemo(() => ({
    employment: toAnnual(income.employment), selfEmployment: toAnnual(income.selfEmployment),
    dividend: toAnnual(income.dividend), savings: toAnnual(income.savings),
    rental: toAnnual(income.rental), pension: toAnnual(income.pension), other: toAnnual(income.other),
  }), [income]);
  const normalizedTaxCode = useMemo(
    () => alignTaxCodeWithCountry(taxCode, country),
    [taxCode, country],
  );

  const result = useMemo(() => {
    const inputs: TaxInputs = {
      taxYear, country, employmentIncome: annualIncome.employment, selfEmploymentIncome: annualIncome.selfEmployment,
      dividendIncome: annualIncome.dividend, savingsIncome: annualIncome.savings, rentalIncome: annualIncome.rental,
      pensionIncome: annualIncome.pension, otherIncome: annualIncome.other, taxCode: normalizedTaxCode || undefined,
      studentLoanPlans, pensionEmployeeRate: includePension ? pensionEmployeeRate : 0,
      pensionEmployerRate: includePension ? pensionEmployerRate : 0, useSalarySacrifice,
      capitalGains: showCGT && cgtGain > 0 ? [{ amount: cgtGain, assetType: cgtAssetType }] : undefined,
      capitalLosses: showCGT ? cgtLosses : 0,
    };
    return calculateFullTax(inputs);
  }, [taxYear, country, annualIncome, normalizedTaxCode, studentLoanPlans, pensionEmployeeRate, pensionEmployerRate, useSalarySacrifice, includePension, showCGT, cgtGain, cgtAssetType, cgtLosses]);

  const yearData = useMemo(() => getTaxYearData(taxYear), [taxYear]);
  const parsedTaxCode = useMemo(
    () => parseTaxCode(normalizedTaxCode || alignTaxCodeWithCountry("1257L", country), taxYear),
    [normalizedTaxCode, country, taxYear],
  );
  const fmt = useCallback((v: number) => formatCurrency(annualToPayPeriod(v, payPeriod)), [payPeriod]);
  const hasIncome = result.totalIncome > 0;

  const totalTax = useMemo(() =>
    result.incomeTax.totalTax + result.nic.totalEmployee + result.studentLoans.reduce((s, sl) => s + sl.repayment, 0) + (result.cgt?.totalCGT ?? 0)
  , [result]);

  const recommendations = useMemo(() => generateRecommendations({
    result, taxYear, country, pensionEmployeeRate: includePension ? pensionEmployeeRate : 0,
    includePension, useSalarySacrifice, isScottish: country === "scotland",
    isSelfEmployed: annualIncome.selfEmployment > 0,
  }), [result, taxYear, country, pensionEmployeeRate, includePension, useSalarySacrifice, annualIncome.selfEmployment]);

  const setAmt = (k: string, v: number) => setIncome(p => ({ ...p, [k]: { ...p[k], amount: v } }));
  const setFreq = (k: string, f: InputFrequency) => setIncome(p => ({ ...p, [k]: { ...p[k], frequency: f } }));
  const handleCountryChange = (nextCountry: Country) => {
    setCountry(nextCountry);
    setTaxCode((prev) => alignTaxCodeWithCountry(prev, nextCountry));
  };
  const handleTaxCodeChange = (nextTaxCode: string) => {
    const normalized = normalizeCountryAndTaxCode(country, nextTaxCode);
    setCountry(normalized.country);
    setTaxCode(normalized.taxCode);
  };

  const handleReset = () => {
    const resetCountryTax = normalizeCountryAndTaxCode(
      props.defaultCountry,
      props.defaultTaxCode,
    );
    setIncome({ employment: defEntry(), selfEmployment: defEntry(), dividend: defEntry(), savings: defEntry(), rental: defEntry(), pension: defEntry(), other: defEntry() });
    setStudentLoanPlans([]); setPensionEmployeeRate(0.05); setPensionEmployerRate(0.03);
    setUseSalarySacrifice(false); setIncludePension(true); setShowCGT(false);
    setCgtGain(0); setCgtLosses(0); setTaxCode(resetCountryTax.taxCode);
    setCountry(resetCountryTax.country); setTaxYear("2025-26"); setOpenTip(null);
  };

  const card = "bg-white rounded-2xl shadow-sm border border-slate-200/80 transition-shadow hover:shadow-md";
  const sel = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition";
  const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition";
  const countryTaxNote = useMemo(() => {
    switch (country) {
      case "scotland":
        return "Scottish income tax rates apply (country-specific Scottish band model).";
      case "wales":
        return "Welsh profile selected. Welsh income tax currently mirrors rUK rates in this tax year.";
      case "northern-ireland":
        return "Northern Ireland profile selected. Income tax currently mirrors rUK rates in this tax year.";
      case "england":
      default:
        return "England profile selected. Standard rUK income tax bands apply.";
    }
  }, [country]);

  return (
    <TipCtx.Provider value={{ openId: openTip, set: setOpenTip }}>
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800">Individual Tax Workspace</h2>
        <p className="text-sm text-slate-500 mt-1">
          Run your personal tax numbers with practical individual inputs: PAYE income, other income
          sources, pension contributions, student loans, and capital gains.
        </p>
      </div>
      {/* ── Settings ────────────────────────────────────── */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Settings</h2>
          <button onClick={handleReset} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-200/60">Clear All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tax Year</label>
            <select value={taxYear} onChange={e => setTaxYear(e.target.value as TaxYear)} className={sel}>
              {TAX_YEAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {!isClaimableYear(taxYear) && (
              <div className="mt-2 flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
                <span className="text-sm leading-none mt-px">⚠️</span>
                <p className="text-[11px] leading-snug font-medium">HMRC only allows tax filing or claims for up to 4 previous years.</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Country</label>
            <select value={country} onChange={e => handleCountryChange(e.target.value as Country)} className={sel}>
              <option value="england">England</option><option value="scotland">Scotland</option>
              <option value="wales">Wales</option><option value="northern-ireland">Northern Ireland</option>
            </select>
            <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">{countryTaxNote}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tax Code</label>
            <input value={taxCode} onChange={e => handleTaxCodeChange(e.target.value)} className={inp} placeholder={alignTaxCodeWithCountry("1257L", country)} />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">{parsedTaxCode.explanation}</p>
          </div>
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Inputs ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income */}
          <div className={`${card} overflow-hidden`}>
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Income</h2>
              <p className="text-sm text-slate-400 mt-0.5">Enter each income source. Choose how you&apos;re paid and we&apos;ll annualise it.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {INCOME_TYPES.map(type => {
                const entry = income[type.key] || defEntry();
                const ann = toAnnual(entry);
                return (
                  <div key={type.key} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-lg shadow-sm flex-shrink-0 mt-0.5`}>{type.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">{type.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{type.desc}</p>
                      </div>
                      <div className="flex w-full sm:w-auto items-center gap-2 sm:flex-shrink-0 mt-3 sm:mt-0">
                        <div className="flex flex-1 sm:flex-none bg-slate-100 rounded-lg p-0.5 gap-0.5">
                          {FREQ_OPTIONS.map(fo => (
                            <button key={fo.value} type="button" onClick={() => setFreq(type.key, fo.value)}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${entry.frequency === fo.value ? "bg-white text-emerald-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                              title={fo.value}>{fo.short}</button>
                          ))}
                        </div>
                        <div className="relative w-full sm:w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-medium">£</span>
                          <input type="number" min={0} step="any" value={entry.amount || ""} onChange={e => setAmt(type.key, parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 text-right focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition" placeholder="0" />
                        </div>
                      </div>
                    </div>
                    {entry.amount > 0 && entry.frequency !== "annual" && (
                      <p className="text-[11px] text-slate-400 mt-1.5 text-right">= <span className="font-semibold text-slate-500">{formatCurrency(ann)}</span> per year</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pension */}
          <div className={`${card} p-6`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-800">Pension</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`relative w-9 h-5 rounded-full transition-colors ${includePension ? "bg-emerald-600" : "bg-slate-200"}`}>
                  <input type="checkbox" checked={includePension} onChange={e => setIncludePension(e.target.checked)} className="sr-only" />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${includePension ? "translate-x-4" : ""}`} />
                </div>
                <span className="text-xs font-medium text-slate-500">{includePension ? "On" : "Off"}</span>
              </label>
            </div>
            <p className="text-sm text-slate-400 mb-5">Auto-enrolment: 5% employee + 3% employer on qualifying earnings (£6,240 – £50,270).</p>
            {includePension && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Your rate</label>
                  <select value={pensionEmployeeRate} onChange={e => setPensionEmployeeRate(parseFloat(e.target.value))} className={sel}>
                    {[0.03,0.04,0.05,0.06,0.07,0.08,0.10,0.12,0.15].map(r => <option key={r} value={r}>{(r*100).toFixed(0)}%{r===0.05?" (minimum)":""}</option>)}
                  </select></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Employer rate</label>
                  <select value={pensionEmployerRate} onChange={e => setPensionEmployerRate(parseFloat(e.target.value))} className={sel}>
                    {[0.03,0.04,0.05,0.06,0.08,0.10].map(r => <option key={r} value={r}>{(r*100).toFixed(0)}%{r===0.03?" (minimum)":""}</option>)}
                  </select></div>
                <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer rounded-xl p-3 -mx-1 hover:bg-slate-50 transition">
                  <input type="checkbox" checked={useSalarySacrifice} onChange={e => setUseSalarySacrifice(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Salary sacrifice <span className="text-slate-400">(saves employee &amp; employer NIC)</span></span>
                </label>
              </div>
            )}
          </div>

          {/* Student Loans */}
          <div className={`${card} p-6`}>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Student Loans</h2>
            <p className="text-sm text-slate-400 mb-4">Repayments are mandatory when earning above the threshold. Select your active plan(s).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STUDENT_LOAN_OPTIONS.map(opt => {
                const active = studentLoanPlans.includes(opt.value);
                return (
                  <label key={opt.value} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${active ? "border-emerald-500 bg-emerald-50/50" : "border-transparent bg-slate-50 hover:border-slate-200"}`}>
                    <input type="checkbox" checked={active} onChange={e => { if(e.target.checked) setStudentLoanPlans(p=>[...p,opt.value]); else setStudentLoanPlans(p=>p.filter(v=>v!==opt.value)); }} className="mt-0.5 h-4 w-4 text-emerald-600 rounded border-slate-300" />
                    <div><span className={`text-sm font-semibold ${active?"text-emerald-700":"text-slate-700"}`}>{opt.label}</span><p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p></div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* CGT */}
          <div className={`${card} p-6`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-800">Capital Gains Tax</h2>
              <button onClick={() => setShowCGT(!showCGT)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition px-3 py-1.5 rounded-lg hover:bg-emerald-50">{showCGT ? "Hide" : "+ Add gains"}</button>
            </div>
            <p className="text-sm text-slate-400 mb-4">CGT on profits from selling assets above the annual exempt amount.</p>
            {showCGT && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Asset type</label>
                  <select value={cgtAssetType} onChange={e => setCgtAssetType(e.target.value as CGTAssetType)} className={sel}>
                    <option value="other">Shares / Other</option><option value="residential">Residential Property</option><option value="business-asset">Business Asset (BADR)</option>
                  </select></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Gain (£)</label><input type="number" min={0} value={cgtGain||""} onChange={e=>setCgtGain(parseFloat(e.target.value)||0)} className={inp} placeholder="0" /></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Losses (£)</label><input type="number" min={0} value={cgtLosses||""} onChange={e=>setCgtLosses(parseFloat(e.target.value)||0)} className={inp} placeholder="0" /></div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Results ──────────────────────────────── */}
        <div className="space-y-6">
          {/* Period toggle */}
          <div className={`${card} p-4`}>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">View results as</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 rounded-xl p-1">
              {(["annual","monthly","biweekly","weekly"] as PayPeriod[]).map(p => (
                <button key={p} onClick={() => setPayPeriod(p)} className={`text-xs py-2 rounded-lg transition-all font-semibold ${payPeriod===p?"bg-gradient-to-r from-[#188a4b] to-[#14733f] text-white shadow-md shadow-[#188a4b]/20":"text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>{payPeriodLabel(p)}</button>
              ))}
            </div>
          </div>

          {/* Summary card */}
          <div className={`${card} overflow-hidden`}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Take-Home Pay</p>
              <p className="text-3xl font-extrabold tracking-tight mt-1">{fmt(result.takeHomePay)}</p>
              <p className="text-xs text-emerald-200 mt-1">{payPeriodLabel(payPeriod).toLowerCase()} &middot; {result.effectiveTaxRate}% effective rate</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50">
              {(["annual","monthly","weekly"] as const).map(p => (
                <div key={p} className="px-4 py-3 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{p}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(annualToPayPeriod(result.takeHomePay, p))}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 space-y-3">
              <Row label="Gross Income" value={fmt(result.totalIncome)} color="text-slate-800" bold />
              {includePension && result.pension.employeeContribution > 0 && <Row label="Pension (you)" value={`-${fmt(result.pension.employeeContribution)}`} color="text-amber-600" />}
              <Row label="Taxable Income" value={fmt(result.incomeTax.taxableIncome)} color="text-slate-600" />
              <div className="h-px bg-slate-100" />
              <Row label="Income Tax" value={`-${fmt(result.incomeTax.totalTax)}`} color="text-red-500" />
              <Row label="National Insurance" value={`-${fmt(result.nic.totalEmployee)}`} color="text-red-500" />
              {result.studentLoans.map(sl => <Row key={sl.plan} label={`Student Loan (${sl.plan.replace("plan","Plan ").replace("postgraduate","PG")})`} value={`-${fmt(sl.repayment)}`} color="text-red-500" />)}
              {result.cgt && result.cgt.totalCGT > 0 && <Row label="Capital Gains Tax" value={`-${fmt(result.cgt.totalCGT)}`} color="text-red-500" />}
              <div className="h-px bg-slate-100" />
              <Row label="Total Tax & Deductions" value={`-${fmt(totalTax)}`} color="text-red-600" bold />
            </div>
          </div>

          {/* Income Tax Breakdown */}
          {hasIncome && (
            <DetailCard title="Income Tax Breakdown" info="Income tax is the tax you pay on your earnings. Everyone gets a tax-free Personal Allowance — you only pay tax on income above that.">
              <DRow label="Personal Allowance (tax-free)" value={formatCurrency(result.incomeTax.effectivePersonalAllowance)}
                info={`You can earn up to ${formatCurrency(yearData.incomeTax.personalAllowance)} before paying any income tax.`} />
              {result.incomeTax.personalAllowanceReduction > 0 && (
                <DRow label="Allowance reduced (income over £100k)" value={`-${formatCurrency(result.incomeTax.personalAllowanceReduction)}`} warn
                  info="Your Personal Allowance is reduced by £1 for every £2 you earn above £100,000." />
              )}
              {result.incomeTax.bands.filter(b => b.taxableAmount > 0).map((band, i) => (
                <DRow key={i} label={`${band.bandName} (${(band.rate*100).toFixed(0)}%) on ${formatCurrency(band.taxableAmount)}`} value={formatCurrency(band.tax)} />
              ))}
              {result.incomeTax.dividendTax > 0 && <DRow label="Dividend tax" value={formatCurrency(result.incomeTax.dividendTax)} info={`Dividend allowance: ${formatCurrency(yearData.incomeTax.dividendAllowance)} tax-free.`} />}
              {result.incomeTax.savingsTax > 0 && <DRow label="Savings interest tax" value={formatCurrency(result.incomeTax.savingsTax)} />}
              {result.incomeTax.marginalRate === 60 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-[11px] text-red-600 font-medium">⚠️ <strong>60% marginal rate trap</strong> — Between £100k and £125,140 you effectively pay 60p tax per extra £1.</p>
                </div>
              )}
            </DetailCard>
          )}

          {/* NIC */}
          {hasIncome && (
            <DetailCard title="National Insurance" info="NICs fund your State Pension and other benefits. You need 35 qualifying years for the full State Pension.">
              {result.nic.class1Employee > 0 && <DRow label="Class 1 (Employee)" value={`${formatCurrency(result.nic.class1Employee)}/yr`}
                info={`${(yearData.nic.class1.mainRate*100).toFixed(0)}% on earnings between ${formatCurrency(yearData.nic.class1.primaryThreshold)} and ${formatCurrency(yearData.nic.class1.upperEarningsLimit)}, then ${(yearData.nic.class1.upperRate*100).toFixed(0)}% above.`} />}
              {result.nic.class1Employer > 0 && <DRow label="Class 1 (Employer)" value={`${formatCurrency(result.nic.class1Employer)}/yr`} highlight
                info={`Your employer pays ${(yearData.nic.class1.employerRate*100).toFixed(1)}% NIC on top of your salary — this doesn't come from your pay.`} />}
              {result.nic.class2 > 0 && <DRow label="Class 2 (Self-employed)" value={`${formatCurrency(result.nic.class2)}/yr`} info={`Flat rate ${formatCurrency(yearData.nic.class2.weeklyRate)}/week.`} />}
              {result.nic.class4 > 0 && <DRow label="Class 4 (Self-employed)" value={`${formatCurrency(result.nic.class4)}/yr`} info={`${(yearData.nic.class4.mainRate*100).toFixed(0)}% on profits ${formatCurrency(yearData.nic.class4.lowerProfitsLimit)}–${formatCurrency(yearData.nic.class4.upperProfitsLimit)}.`} />}
            </DetailCard>
          )}

          {/* Pension breakdown */}
          {hasIncome && includePension && result.pension.totalContribution > 0 && (
            <DetailCard title="Pension" info="Under auto-enrolment, your employer must enrol you in a workplace pension. Both you and your employer contribute.">
              <DRow label="Qualifying earnings" value={formatCurrency(result.pension.qualifyingEarnings)} info={`Pension calculated on earnings between ${formatCurrency(yearData.pension.autoEnrolment.lowerQualifyingEarnings)} and ${formatCurrency(yearData.pension.autoEnrolment.upperQualifyingEarnings)}.`} />
              <DRow label={`Your contribution (${(pensionEmployeeRate*100).toFixed(0)}%)`} value={`${formatCurrency(result.pension.employeeContribution)}/yr`} />
              <DRow label={`Employer (${(pensionEmployerRate*100).toFixed(0)}%)`} value={`${formatCurrency(result.pension.employerContribution)}/yr`} highlight info="Free money — paid on top of your salary." />
              <div className="h-px bg-slate-100 my-1" />
              <DRow label="Total into pension" value={`${formatCurrency(result.pension.totalContribution)}/yr`} bold />
              <DRow label="Tax relief" value={`+${formatCurrency(result.pension.taxRelief)}`} green info="Government top-up: 20% basic, claim more if higher-rate." />
              {useSalarySacrifice && result.pension.salarySacrificeNICSaving > 0 && (
                <DRow label="NIC saving (salary sacrifice)" value={`+${formatCurrency(result.pension.salarySacrificeNICSaving)}`} green />
              )}
            </DetailCard>
          )}

          {/* Tax tips button */}
          {hasIncome && recommendations.length > 0 && (
            <button onClick={() => setShowTips(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
              <span className="text-lg">💡</span> Generate Tax-Saving Tips
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">{recommendations.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Tips Modal ──────────────────────────────────── */}
      {showTips && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowTips(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5"><span className="text-2xl">💡</span><div><h2 className="text-lg font-bold text-white">Smart Tax Tips</h2><p className="text-xs text-amber-100">{recommendations.length} personalised recommendations</p></div></div>
              <button onClick={() => setShowTips(false)} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {recommendations.map((rec, i) => (
                <div key={i} className="px-6 py-5"><div className="flex items-start gap-3"><span className="text-xl flex-shrink-0">{rec.icon}</span><div><p className="text-sm font-semibold text-slate-800">{rec.title}</p><p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rec.text}</p><span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">{rec.saving}</span></div></div></div>
              ))}
            </div>
            <div className="px-6 py-3 bg-amber-50 border-t border-amber-200 flex-shrink-0"><p className="text-[11px] text-amber-700">⚠️ General suggestions — not personal financial advice.</p></div>
          </div>
        </div>
      )}
    </div>
    </TipCtx.Provider>
  );
}

// ── Sub-components ────────────────────────────────────
function Row({ label, value, color, bold }: { label: string; value: string; color: string; bold?: boolean }) {
  return <div className={`flex justify-between items-center ${bold ? "font-bold text-[15px]" : "text-sm"}`}><span className="text-slate-500">{label}</span><span className={`${color} font-semibold tabular-nums`}>{value}</span></div>;
}

let _tc = 0;
function InfoTip({ text }: { text: string }) {
  const [id] = useState(() => `t-${++_tc}`);
  const { openId, set } = useContext(TipCtx);
  const open = openId === id;
  return (
    <span className="relative inline-flex ml-1">
      <button type="button" onClick={e => { e.stopPropagation(); set(open ? null : id); }}
        className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center transition-all flex-shrink-0 ${open ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600"}`} aria-label="More info">i</button>
      {open && (
        <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-white border border-slate-200 rounded-xl shadow-lg text-[11px] text-slate-600 leading-relaxed">
          {text}
          <button onClick={() => set(null)} className="block mt-2 text-emerald-600 font-semibold hover:underline text-[10px]">Got it</button>
        </div>
      )}
    </span>
  );
}

function DetailCard({ title, info, children }: { title: string; info?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-1"><h3 className="text-sm font-bold text-slate-700">{title}</h3>{info && <InfoTip text={info} />}</div>
      <div className="space-y-2 mt-3">{children}</div>
    </div>
  );
}

function DRow({ label, value, warn, highlight, green, bold, info }: { label: string; value: string; warn?: boolean; highlight?: boolean; green?: boolean; bold?: boolean; info?: string }) {
  return (
    <div className="flex justify-between items-start text-xs gap-2">
      <span className={`flex items-center gap-0.5 ${warn ? "text-amber-600" : "text-slate-500"}`}>{label}{info && <InfoTip text={info} />}</span>
      <span className={`tabular-nums font-medium flex-shrink-0 ${warn ? "text-amber-600" : highlight ? "text-emerald-600" : green ? "text-emerald-600" : bold ? "text-slate-800 font-bold" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}
