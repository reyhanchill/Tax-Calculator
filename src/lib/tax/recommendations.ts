import { FullTaxCalculation, TaxYear, Country } from "./types";
import { formatCurrency } from "../utils";

export interface Recommendation {
  icon: string;
  title: string;
  text: string;
  saving: string;
  priority: number; // lower = higher priority
}

interface RecommendationContext {
  result: FullTaxCalculation;
  taxYear: TaxYear;
  country: Country;
  pensionEmployeeRate: number;
  includePension: boolean;
  useSalarySacrifice: boolean;
  isScottish: boolean;
  isSelfEmployed: boolean;
}

export function generateRecommendations(ctx: RecommendationContext): Recommendation[] {
  const { result, pensionEmployeeRate, includePension, useSalarySacrifice, isScottish, isSelfEmployed } = ctx;
  const recs: Recommendation[] = [];
  const totalIncome = result.totalIncome;
  const taxableIncome = result.incomeTax.taxableIncome + result.incomeTax.effectivePersonalAllowance;

  if (totalIncome <= 0) return recs;

  // ── Pension contributions ────────────────────────────
  if (pensionEmployeeRate < 0.05 || !includePension) {
    const currentPct = includePension ? pensionEmployeeRate * 100 : 0;
    const suggestedPct = 5;
    const suggestedAmount = totalIncome * (suggestedPct / 100);
    const taxRate = totalIncome > 50270 + 12570 ? 0.4 : 0.2;
    const estimatedRelief = suggestedAmount * taxRate;

    recs.push({
      icon: "💰",
      title: "Increase Pension Contributions",
      text: `You're currently contributing ${currentPct.toFixed(0)}% to your pension. Increasing to ${suggestedPct}% (${formatCurrency(suggestedAmount)}/yr) would save you approximately ${formatCurrency(estimatedRelief)} in tax relief. Your net cost after relief would be just ${formatCurrency(suggestedAmount - estimatedRelief)}/yr while building your retirement fund.`,
      saving: `Tax relief: ~${formatCurrency(estimatedRelief)}/yr`,
      priority: 1,
    });
  } else if (pensionEmployeeRate >= 0.05 && pensionEmployeeRate < 0.10) {
    recs.push({
      icon: "📈",
      title: "Maximise Pension Benefits",
      text: `Great job contributing ${(pensionEmployeeRate * 100).toFixed(0)}%! Consider increasing to 10% for even greater tax relief and long-term compound growth. Every extra 1% costs less than you think after tax relief.`,
      saving: "Long-term wealth building",
      priority: 5,
    });
  }

  // ── Personal Allowance taper zone (£100k–£125,140) ──
  if (taxableIncome > 100000 && taxableIncome < 125140) {
    const excessOver100k = taxableIncome - 100000;
    const effectiveRate = isScottish ? 67.5 : 60;
    const pensionToRecover = excessOver100k;
    const taxSavings = pensionToRecover * (effectiveRate / 100);

    recs.push({
      icon: "⚠️",
      title: "Personal Allowance Taper Zone",
      text: `You're in the £100k–£125,140 danger zone where you lose £1 of Personal Allowance for every £2 earned — creating an effective ${effectiveRate}% tax rate. Contributing ${formatCurrency(pensionToRecover)} more to your pension would restore your full allowance and save you approximately ${formatCurrency(taxSavings)} in tax.`,
      saving: `Potential saving: ${formatCurrency(taxSavings)}`,
      priority: 0,
    });
  }

  // ── Salary sacrifice ────────────────────────────────
  if (!useSalarySacrifice && totalIncome > 20000 && includePension) {
    const nicRate = 0.08; // approximate
    const pensionAmount = result.pension.employeeContribution;
    const potentialNICSaving = pensionAmount * nicRate;

    if (potentialNICSaving > 50) {
      recs.push({
        icon: "🚗",
        title: "Consider Salary Sacrifice",
        text: `Switching your pension to salary sacrifice would save you approximately ${formatCurrency(potentialNICSaving)}/yr in National Insurance, and your employer would also save on NIC. Ask your employer if they offer this — many will share their NIC savings with you too. Note: this may reduce your mortgage affordability and statutory pay.`,
        saving: `NIC saving: ~${formatCurrency(potentialNICSaving)}/yr`,
        priority: 2,
      });
    }
  }

  // ── Salary sacrifice schemes ────────────────────────
  if (totalIncome > 20000) {
    recs.push({
      icon: "🔄",
      title: "Salary Sacrifice Schemes",
      text: "Ask your employer about salary sacrifice for: electric vehicles (save on BIK tax — EVs have just 2% BIK), cycle-to-work scheme (save up to 42% on a bike), and tech schemes. These reduce your taxable income while giving you valuable benefits.",
      saving: "Variable savings",
      priority: 7,
    });
  }

  // ── ISA ──────────────────────────────────────────────
  if (totalIncome > 25000) {
    recs.push({
      icon: "🏦",
      title: "Use Your ISA Allowance",
      text: "You have a £20,000 annual ISA allowance for tax-free savings and investments. Unlike a regular savings account, you pay zero tax on interest, dividends, or capital gains earned inside an ISA. Consider a Stocks & Shares ISA for long-term growth.",
      saving: "Tax-free growth",
      priority: 6,
    });
  }

  // ── Marriage Allowance ──────────────────────────────
  if (taxableIncome > 12570 && taxableIncome <= 50270) {
    recs.push({
      icon: "💑",
      title: "Marriage Allowance",
      text: "If you have a spouse or civil partner earning less than £12,570, they can transfer £1,260 of their Personal Allowance to you. This saves up to £252/year in tax. You can also backdate claims for up to 4 years.",
      saving: "Save up to £252/yr",
      priority: 4,
    });
  }

  // ── Gift Aid for higher-rate payers ──────────────────
  if (taxableIncome > 50270 + 12570) {
    recs.push({
      icon: "📊",
      title: "Gift Aid Declarations",
      text: "As a higher-rate taxpayer, you can claim extra tax relief on charitable donations through Self Assessment. For every £100 donated (which costs the charity £125 via Gift Aid), you can personally claim back £25 — or £31.25 if you're an additional-rate payer.",
      saving: "Extra relief on donations",
      priority: 8,
    });

    recs.push({
      icon: "👨‍👩‍👧‍👦",
      title: "Income Splitting",
      text: "If your partner is in a lower tax bracket, consider transferring income-generating assets (shares, rental property) to them to make use of their lower tax rates and Personal Allowance. This is entirely legal and can significantly reduce your household tax bill.",
      saving: "Household tax optimisation",
      priority: 9,
    });
  }

  // ── Tax-Free Childcare ──────────────────────────────
  if (taxableIncome > 15000 && taxableIncome < 100000) {
    recs.push({
      icon: "👶",
      title: "Tax-Free Childcare",
      text: "If you have children under 11 (or under 17 with disabilities), the government adds 25p for every 75p you pay into a Tax-Free Childcare account — up to £2,000 per child per year. This is available to both employed and self-employed parents.",
      saving: "Up to £2,000/child/yr",
      priority: 6,
    });
  }

  // ── Scottish-specific ───────────────────────────────
  if (isScottish && taxableIncome > 27491 + 12570 && taxableIncome < 43662 + 12570) {
    recs.push({
      icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      title: "Scottish Intermediate Rate",
      text: "As a Scottish taxpayer in the intermediate band (21%), pension contributions are especially valuable. Every £1 you put into your pension effectively costs you only 79p — better value than the 80p it costs basic-rate taxpayers in England.",
      saving: "21% tax relief",
      priority: 3,
    });
  }

  // ── Self-employed specific ──────────────────────────
  if (isSelfEmployed) {
    if (result.selfEmploymentIncome > 0 && result.selfEmploymentIncome <= 1000) {
      recs.push({
        icon: "🎯",
        title: "Trading Allowance",
        text: "If your self-employment income is under £1,000, you may not need to register for Self Assessment at all — the £1,000 trading allowance means this income is completely tax-free.",
        saving: "Potentially no tax to pay",
        priority: 1,
      });
    }

    recs.push({
      icon: "🏠",
      title: "Working From Home Allowance",
      text: "If you work from home, you can claim a flat-rate deduction of £6/week (£312/year) without needing receipts, or calculate the actual proportion of home costs used for business. This reduces your taxable profit.",
      saving: "Up to £312/yr (flat rate)",
      priority: 5,
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}
