"use client";

import { useState, useMemo, useCallback, createContext, useContext } from "react";
import { TAX_YEAR_OPTIONS, isClaimableYear, getTaxYearData } from "@/lib/tax/data";
import { TaxYear, Country, StudentLoanPlan } from "@/lib/tax/types";
import { calculateFullTax } from "@/lib/tax/calculators";
import { formatCurrency, annualToPayPeriod, PayPeriod, payPeriodLabel } from "@/lib/utils";
import { generateRecommendations } from "@/lib/tax/recommendations";
import {
  EXPENSE_CATEGORIES,
  SELF_EMPLOYED_STUDENT_LOAN_OPTIONS,
} from "@/components/self-employed/constants";

const TipCtx = createContext<{ openId: string | null; set: (id: string | null) => void }>({ openId: null, set: () => {} });


interface Props { defaultCountry: Country; defaultStudentLoanPlans: StudentLoanPlan[]; defaultPensionEmployeeRate: number; }

export default function SelfEmployedAssessment(props: Props) {
  const [taxYear, setTaxYear] = useState<TaxYear>("2025-26");
  const [country, setCountry] = useState<Country>(props.defaultCountry);
  const [payPeriod, setPayPeriod] = useState<PayPeriod>("annual");
  const [turnover, setTurnover] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [useTradingAllowance, setUseTradingAllowance] = useState(false);
  const [expenses, setExpenses] = useState<Record<string, number>>(Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.key, 0])));
  const [studentLoans, setStudentLoans] = useState<StudentLoanPlan[]>(props.defaultStudentLoanPlans);
  const [pensionRate, setPensionRate] = useState(props.defaultPensionEmployeeRate);
  const [includePension, setIncludePension] = useState(false);
  const [openTip, setOpenTip] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const totalExpenses = useMemo(() => Object.values(expenses).reduce((s, v) => s + v, 0), [expenses]);
  const netProfit = useMemo(() => Math.max(0, useTradingAllowance ? turnover - 1000 : turnover - totalExpenses), [turnover, totalExpenses, useTradingAllowance]);

  const result = useMemo(() => calculateFullTax({
    taxYear, country, employmentIncome: otherIncome, selfEmploymentIncome: netProfit,
    dividendIncome: 0, savingsIncome: 0, rentalIncome: 0, pensionIncome: 0, otherIncome: 0,
    studentLoanPlans: studentLoans, pensionEmployeeRate: includePension ? pensionRate : 0,
    pensionEmployerRate: 0, useSalarySacrifice: false,
  }), [taxYear, country, otherIncome, netProfit, studentLoans, includePension, pensionRate]);

  const yearData = useMemo(() => getTaxYearData(taxYear), [taxYear]);
  const fmt = useCallback((v: number) => formatCurrency(annualToPayPeriod(v, payPeriod)), [payPeriod]);
  const hasIncome = netProfit > 0 || otherIncome > 0;
  const paymentOnAccount = useMemo(() => (result.incomeTax.totalTax + result.nic.class4 + result.nic.class2) / 2, [result]);
  const totalTax = useMemo(() => result.incomeTax.totalTax + result.nic.class2 + result.nic.class4 + result.nic.class1Employee + result.studentLoans.reduce((s, sl) => s + sl.repayment, 0), [result]);
  const recommendations = useMemo(() => generateRecommendations({ result, taxYear, country, pensionEmployeeRate: includePension ? pensionRate : 0, includePension, useSalarySacrifice: false, isScottish: country === "scotland", isSelfEmployed: true }), [result, taxYear, country, pensionRate, includePension]);

  const handleReset = () => {
    setTurnover(0); setOtherIncome(0); setUseTradingAllowance(false);
    setExpenses(Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.key, 0]))); setStudentLoans([]);
    setIncludePension(false); setPensionRate(0.05); setTaxYear("2025-26");
    setCountry(props.defaultCountry); setOpenTip(null);
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
        <h2 className="text-lg font-bold text-slate-800">Self-Employed Tax Workspace</h2>
        <p className="text-sm text-slate-500 mt-1">
          Run your self-employed tax numbers with practical sole-trader inputs: turnover,
          allowable expenses, trading allowance, student loans, pension contributions, and
          payments on account.
        </p>
      </div>
      {/* ── Settings ────────────────────────────────────── */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Settings</h2>
          <button onClick={handleReset} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-200/60">Clear All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tax Year</label>
            <select value={taxYear} onChange={e => setTaxYear(e.target.value as TaxYear)} className={sel}>{TAX_YEAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            {!isClaimableYear(taxYear) && <div className="mt-2 flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2"><span className="text-sm leading-none mt-px">⚠️</span><p className="text-[11px] leading-snug font-medium">HMRC only allows tax filing or claims for up to 4 previous years.</p></div>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Country</label>
            <select value={country} onChange={e => setCountry(e.target.value as Country)} className={sel}><option value="england">England</option><option value="scotland">Scotland</option><option value="wales">Wales</option><option value="northern-ireland">Northern Ireland</option></select>
            <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">{countryTaxNote}</p>
          </div>
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Income */}
          <div className={`${card} p-6`}>
            <h2 className="text-lg font-bold text-slate-800">Business Income</h2>
            <p className="text-sm text-slate-400 mt-0.5 mb-5">Your total self-employment turnover before expenses.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Annual Turnover (£)</label><input type="number" min={0} value={turnover||""} onChange={e=>setTurnover(parseFloat(e.target.value)||0)} className={inp} placeholder="0" /></div>
              <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Other Employment Income (£)</label><input type="number" min={0} value={otherIncome||""} onChange={e=>setOtherIncome(parseFloat(e.target.value)||0)} className={inp} placeholder="0" /><p className="text-[11px] text-slate-400 mt-1">Any PAYE salary alongside self-employment</p></div>
            </div>
            <div className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={useTradingAllowance} onChange={e=>setUseTradingAllowance(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                <div><span className="text-sm font-semibold text-emerald-800">Use Trading Allowance (£1,000)</span><p className="text-[11px] text-emerald-600 mt-0.5">Deduct £1,000 instead of actual expenses. Cannot claim both.</p></div>
              </label>
            </div>
          </div>

          {/* Expenses */}
          {!useTradingAllowance && (
            <div className={`${card} overflow-hidden`}>
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-lg font-bold text-slate-800">Allowable Business Expenses</h2>
                <p className="text-sm text-slate-400 mt-0.5">Deducted from turnover to calculate taxable profit.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {EXPENSE_CATEGORIES.map(cat => (
                  <div key={cat.key} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">{cat.icon}</div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-700">{cat.label}</p><p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p></div>
                      <div className="relative w-full sm:w-32 sm:flex-shrink-0 mt-2 sm:mt-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-medium">£</span>
                        <input type="number" min={0} value={expenses[cat.key]||""} onChange={e=>setExpenses(prev=>({...prev,[cat.key]:parseFloat(e.target.value)||0}))}
                          className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 text-right focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition" placeholder="0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Total Expenses</span>
                <span className="text-sm font-bold text-red-500">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          )}

          {/* Student Loans & Pension */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`${card} p-6`}>
              <h2 className="text-base font-bold text-slate-800 mb-3">Student Loans</h2>
              <div className="space-y-2">
                {SELF_EMPLOYED_STUDENT_LOAN_OPTIONS.map(opt => {
                  const active = studentLoans.includes(opt.value);
                  return (
                    <label key={opt.value} className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all ${active ? "bg-emerald-50 border border-emerald-200" : "hover:bg-slate-50 border border-transparent"}`}>
                      <input type="checkbox" checked={active} onChange={e=>{ if(e.target.checked) setStudentLoans(p=>[...p,opt.value]); else setStudentLoans(p=>p.filter(v=>v!==opt.value)); }} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                      <span className={`text-sm font-medium ${active?"text-emerald-700":"text-slate-600"}`}>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className={`${card} p-6`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800">Pension</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${includePension?"bg-emerald-600":"bg-slate-200"}`}>
                    <input type="checkbox" checked={includePension} onChange={e=>setIncludePension(e.target.checked)} className="sr-only" />
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${includePension?"translate-x-4":""}`} />
                  </div>
                </label>
              </div>
              <p className="text-xs text-slate-400 mb-3">Self-employed pension contribution (voluntary).</p>
              {includePension && <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Contribution rate</label><select value={pensionRate} onChange={e=>setPensionRate(parseFloat(e.target.value))} className={sel}>{[0.03,0.05,0.08,0.10,0.15,0.20].map(r=><option key={r} value={r}>{(r*100).toFixed(0)}%</option>)}</select></div>}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          <div className={`${card} p-4`}>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">View results as</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 rounded-xl p-1">
              {(["annual","monthly","biweekly","weekly"] as PayPeriod[]).map(p => (
                <button key={p} onClick={()=>setPayPeriod(p)} className={`text-xs py-2 rounded-lg transition-all font-semibold ${payPeriod===p?"bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20":"text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>{payPeriodLabel(p)}</button>
              ))}
            </div>
          </div>

          {/* Profit Summary */}
          <div className={`${card} overflow-hidden`}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Net Profit</p>
              <p className="text-3xl font-extrabold tracking-tight mt-1">{fmt(netProfit)}</p>
              <p className="text-xs text-emerald-200 mt-1">{useTradingAllowance ? "After £1,000 trading allowance" : `After ${formatCurrency(totalExpenses)} expenses`}</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <SRow label="Turnover" value={fmt(turnover)} color="text-[#188a4b]" bold />
              <SRow label={useTradingAllowance ? "Trading Allowance" : "Total Expenses"} value={`-${fmt(useTradingAllowance ? 1000 : totalExpenses)}`} color="text-red-500" />
              <div className="h-px bg-slate-100" />
              <SRow label="Taxable Profit" value={fmt(netProfit)} color="text-[#188a4b]" bold />
              {otherIncome > 0 && <SRow label="Other Income" value={fmt(otherIncome)} color="text-[#188a4b]" />}
            </div>
          </div>

          {/* Take-Home */}
          {hasIncome && (
            <div className={`${card} overflow-hidden`}>
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 text-white">
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">Take-Home Pay</p>
                <p className="text-3xl font-extrabold tracking-tight mt-1">{fmt(result.takeHomePay)}</p>
                <p className="text-xs text-slate-400 mt-1">{payPeriodLabel(payPeriod).toLowerCase()} &middot; {result.effectiveTaxRate}% effective rate</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50">
                {(["annual","monthly","weekly"] as const).map(p => (
                  <div key={p} className="px-4 py-3 text-center"><p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{p}</p><p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(annualToPayPeriod(result.takeHomePay, p))}</p></div>
                ))}
              </div>
              <div className="px-6 py-5 space-y-3">
                <SRow label="Income Tax" value={`-${fmt(result.incomeTax.totalTax)}`} color="text-red-500" />
                {result.nic.class2 > 0 && <SRow label="NIC Class 2" value={`-${fmt(result.nic.class2)}`} color="text-red-500" />}
                {result.nic.class4 > 0 && <SRow label="NIC Class 4" value={`-${fmt(result.nic.class4)}`} color="text-red-500" />}
                {result.nic.class1Employee > 0 && <SRow label="NIC Class 1 (PAYE)" value={`-${fmt(result.nic.class1Employee)}`} color="text-red-500" />}
                {result.studentLoans.map(sl => <SRow key={sl.plan} label={`Student Loan (${sl.plan.replace("plan","Plan ").replace("postgraduate","PG")})`} value={`-${fmt(sl.repayment)}`} color="text-red-500" />)}
                {includePension && result.pension.employeeContribution > 0 && <SRow label="Pension" value={`-${fmt(result.pension.employeeContribution)}`} color="text-red-500" />}
                <div className="h-px bg-slate-100" />
                <SRow label="Total Tax & NIC" value={`-${fmt(totalTax)}`} color="text-red-600" bold />
              </div>
            </div>
          )}

          {/* Detail cards */}
          {hasIncome && <>
            <DetailCard title="Income Tax Breakdown" info="Self-employed income tax is paid on profits through Self Assessment.">
              <DRow label="Personal Allowance (tax-free)" value={formatCurrency(result.incomeTax.effectivePersonalAllowance)} info={`You can earn up to ${formatCurrency(yearData.incomeTax.personalAllowance)} tax-free.`} />
              {result.incomeTax.bands.filter(b=>b.taxableAmount>0).map((band,i) => <DRow key={i} label={`${band.bandName} (${(band.rate*100).toFixed(0)}%) on ${formatCurrency(band.taxableAmount)}`} value={formatCurrency(band.tax)} />)}
            </DetailCard>
            <DetailCard title="National Insurance" info="Self-employed: Class 2 (flat weekly) + Class 4 (% on profits). Counts towards State Pension.">
              {result.nic.class2 > 0 && <DRow label="Class 2 (flat rate)" value={`${formatCurrency(result.nic.class2)}/yr`} info={`${formatCurrency(yearData.nic.class2.weeklyRate)}/week if profits exceed ${formatCurrency(yearData.nic.class2.smallProfitsThreshold)}.`} />}
              {result.nic.class4 > 0 && <DRow label="Class 4 (on profits)" value={`${formatCurrency(result.nic.class4)}/yr`} info={`${(yearData.nic.class4.mainRate*100).toFixed(0)}% on profits ${formatCurrency(yearData.nic.class4.lowerProfitsLimit)}–${formatCurrency(yearData.nic.class4.upperProfitsLimit)}.`} />}
            </DetailCard>
            <DetailCard title="Payments on Account" info="HMRC requires two advance payments towards next year's tax. Due 31 Jan and 31 Jul.">
              <DRow label="1st payment (31 Jan)" value={formatCurrency(paymentOnAccount)} />
              <DRow label="2nd payment (31 Jul)" value={formatCurrency(paymentOnAccount)} />
              <div className="h-px bg-slate-100 my-1" />
              <DRow label="Total payments on account" value={formatCurrency(paymentOnAccount * 2)} bold />
            </DetailCard>
          </>}

          {/* Tips button */}
          {hasIncome && recommendations.length > 0 && (
            <button onClick={()=>setShowTips(true)} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
              <span className="text-lg">💡</span> Generate Tax-Saving Tips <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">{recommendations.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Tips Modal ──────────────────────────────────── */}
      {showTips && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={()=>setShowTips(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5"><span className="text-2xl">💡</span><div><h2 className="text-lg font-bold text-white">Smart Tax Tips</h2><p className="text-xs text-amber-100">{recommendations.length} personalised recommendations</p></div></div>
              <button onClick={()=>setShowTips(false)} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {recommendations.map((rec,i) => <div key={i} className="px-6 py-5"><div className="flex items-start gap-3"><span className="text-xl flex-shrink-0">{rec.icon}</span><div><p className="text-sm font-semibold text-slate-800">{rec.title}</p><p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rec.text}</p><span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">{rec.saving}</span></div></div></div>)}
            </div>
            <div className="px-6 py-3 bg-amber-50 border-t border-amber-200 flex-shrink-0"><p className="text-[11px] text-amber-700">⚠️ General suggestions — not personal financial advice.</p></div>
          </div>
        </div>
      )}
    </div>
    </TipCtx.Provider>
  );
}

function SRow({ label, value, color, bold }: { label: string; value: string; color: string; bold?: boolean }) {
  return <div className={`flex justify-between items-center ${bold ? "font-bold text-[15px]" : "text-sm"}`}><span className="text-slate-500">{label}</span><span className={`${color} font-semibold tabular-nums`}>{value}</span></div>;
}

let _tc = 0;
function InfoTip({ text }: { text: string }) {
  const [id] = useState(() => `se-${++_tc}`);
  const { openId, set } = useContext(TipCtx);
  const open = openId === id;
  return (
    <span className="relative inline-flex ml-1">
      <button type="button" onClick={e=>{e.stopPropagation();set(open?null:id);}}
        className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center transition-all flex-shrink-0 ${open?"bg-emerald-600 text-white":"bg-slate-200 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600"}`} aria-label="More info">i</button>
      {open && <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-white border border-slate-200 rounded-xl shadow-lg text-[11px] text-slate-600 leading-relaxed">{text}<button onClick={()=>set(null)} className="block mt-2 text-emerald-600 font-semibold hover:underline text-[10px]">Got it</button></div>}
    </span>
  );
}

function DetailCard({ title, info, children }: { title: string; info?: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 hover:shadow-md transition-shadow"><div className="flex items-center gap-1"><h3 className="text-sm font-bold text-slate-700">{title}</h3>{info && <InfoTip text={info} />}</div><div className="space-y-2 mt-3">{children}</div></div>;
}

function DRow({ label, value, warn, highlight, green, bold, info }: { label: string; value: string; warn?: boolean; highlight?: boolean; green?: boolean; bold?: boolean; info?: string }) {
  return <div className="flex justify-between items-start text-xs gap-2"><span className={`flex items-center gap-0.5 ${warn?"text-amber-600":"text-slate-500"}`}>{label}{info && <InfoTip text={info} />}</span><span className={`tabular-nums font-medium flex-shrink-0 ${warn?"text-amber-600":highlight?"text-emerald-600":green?"text-emerald-600":bold?"text-slate-800 font-bold":"text-slate-700"}`}>{value}</span></div>;
}
