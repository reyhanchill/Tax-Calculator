// UK Tax Year Data — HMRC-Verified Rates & Thresholds
// Sources: gov.uk/hmrc-rates, gov.uk/guidance/rates-and-thresholds

import { TaxBand, TaxYear, TaxYearData } from "../types";

// 2026/27 — Latest published dataset in-app (6 Apr 2026 – 5 Apr 2027)
const data2026_27: TaxYearData = {
  year: "2026-27",
  label: "2026/27",
  startDate: "2026-04-06",
  endDate: "2027-04-05",
  incomeTax: {
    personalAllowance: 12570,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 37700 },
      { name: "Higher rate", rate: 0.40, from: 37700, to: 125140 },
      { name: "Additional rate", rate: 0.45, from: 125140, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 3967 },
      { name: "Basic rate", rate: 0.20, from: 3967, to: 16956 },
      { name: "Intermediate rate", rate: 0.21, from: 16956, to: 31092 },
      { name: "Higher rate", rate: 0.42, from: 31092, to: 62430 },
      { name: "Advanced rate", rate: 0.45, from: 62430, to: 125140 },
      { name: "Top rate", rate: 0.48, from: 125140, to: Infinity },
    ],
    dividendAllowance: 500,
    dividendRates: { basic: 0.1075, higher: 0.3575, additional: 0.3935 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1260,
    blindPersonsAllowance: 3250,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6708,
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      mainRate: 0.08,
      upperRate: 0.02,
      secondaryThreshold: 5000,
      employerRate: 0.15,
    },
    class2: { weeklyRate: 3.65, smallProfitsThreshold: 7105 },
    class4: {
      lowerProfitsLimit: 12570,
      upperProfitsLimit: 50270,
      mainRate: 0.06,
      upperRate: 0.02,
    },
  },
  studentLoans: {
    plan1: { threshold: 26900, rate: 0.09 },
    plan2: { threshold: 29385, rate: 0.09 },
    plan4: { threshold: 33795, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6240,
      upperQualifyingEarnings: 50270,
      minimumEmployeeRate: 0.05,
      minimumEmployerRate: 0.03,
      totalMinimumRate: 0.08,
      earningsTrigger: 10000,
    },
    annualAllowance: 60000,
    taperThreshold: 260000,
    minimumTaperedAllowance: 10000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 3000,
    rates: { basicRate: 0.18, higherRate: 0.24 },
    residentialRates: { basicRate: 0.18, higherRate: 0.24 },
    businessAssetDisposalReliefRate: 0.18,
    businessAssetDisposalReliefLifetimeLimit: 1000000,
  },
};

// 2025/26 (6 Apr 2025 – 5 Apr 2026)
const data2025_26: TaxYearData = {
  year: "2025-26",
  label: "2025/26",
  startDate: "2025-04-06",
  endDate: "2026-04-05",
  incomeTax: {
    personalAllowance: 12570,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 37700 },
      { name: "Higher rate", rate: 0.40, from: 37700, to: 125140 },
      { name: "Additional rate", rate: 0.45, from: 125140, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 2827 },
      { name: "Basic rate", rate: 0.20, from: 2827, to: 14921 },
      { name: "Intermediate rate", rate: 0.21, from: 14921, to: 31092 },
      { name: "Higher rate", rate: 0.42, from: 31092, to: 62430 },
      { name: "Advanced rate", rate: 0.45, from: 62430, to: 125140 },
      { name: "Top rate", rate: 0.48, from: 125140, to: Infinity },
    ],
    dividendAllowance: 500,
    dividendRates: { basic: 0.0875, higher: 0.3375, additional: 0.3935 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1260,
    blindPersonsAllowance: 3130,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6500,
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      mainRate: 0.08,
      upperRate: 0.02,
      secondaryThreshold: 5000,
      employerRate: 0.15,
    },
    class2: { weeklyRate: 3.50, smallProfitsThreshold: 6845 },
    class4: {
      lowerProfitsLimit: 12570,
      upperProfitsLimit: 50270,
      mainRate: 0.06,
      upperRate: 0.02,
    },
  },
  studentLoans: {
    plan1: { threshold: 26065, rate: 0.09 },
    plan2: { threshold: 28470, rate: 0.09 },
    plan4: { threshold: 32745, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6240,
      upperQualifyingEarnings: 50270,
      minimumEmployeeRate: 0.05,
      minimumEmployerRate: 0.03,
      totalMinimumRate: 0.08,
      earningsTrigger: 10000,
    },
    annualAllowance: 60000,
    taperThreshold: 260000,
    minimumTaperedAllowance: 10000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 3000,
    rates: { basicRate: 0.18, higherRate: 0.24 },
    residentialRates: { basicRate: 0.18, higherRate: 0.24 },
    businessAssetDisposalReliefRate: 0.14,
    businessAssetDisposalReliefLifetimeLimit: 1000000,
  },
};

// 2024/25 (6 Apr 2024 – 5 Apr 2025)
// Note: CGT rates changed 30 Oct 2024 (main rates 10%/20% → 18%/24%)
// Using post-Oct rates as the dominant period
const data2024_25: TaxYearData = {
  year: "2024-25",
  label: "2024/25",
  startDate: "2024-04-06",
  endDate: "2025-04-05",
  incomeTax: {
    personalAllowance: 12570,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 37700 },
      { name: "Higher rate", rate: 0.40, from: 37700, to: 125140 },
      { name: "Additional rate", rate: 0.45, from: 125140, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 2306 },
      { name: "Basic rate", rate: 0.20, from: 2306, to: 13991 },
      { name: "Intermediate rate", rate: 0.21, from: 13991, to: 31092 },
      { name: "Higher rate", rate: 0.42, from: 31092, to: 62430 },
      { name: "Advanced rate", rate: 0.45, from: 62430, to: 125140 },
      { name: "Top rate", rate: 0.48, from: 125140, to: Infinity },
    ],
    dividendAllowance: 500,
    dividendRates: { basic: 0.0875, higher: 0.3375, additional: 0.3935 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1260,
    blindPersonsAllowance: 3070,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6396,
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      mainRate: 0.08,
      upperRate: 0.02,
      secondaryThreshold: 9100,
      employerRate: 0.138,
    },
    class2: { weeklyRate: 3.45, smallProfitsThreshold: 6725 },
    class4: {
      lowerProfitsLimit: 12570,
      upperProfitsLimit: 50270,
      mainRate: 0.06,
      upperRate: 0.02,
    },
  },
  studentLoans: {
    plan1: { threshold: 24990, rate: 0.09 },
    plan2: { threshold: 27295, rate: 0.09 },
    plan4: { threshold: 31395, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6240,
      upperQualifyingEarnings: 50270,
      minimumEmployeeRate: 0.05,
      minimumEmployerRate: 0.03,
      totalMinimumRate: 0.08,
      earningsTrigger: 10000,
    },
    annualAllowance: 60000,
    taperThreshold: 260000,
    minimumTaperedAllowance: 10000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 3000,
    // Post-30 Oct 2024 rates (dominant period)
    rates: { basicRate: 0.18, higherRate: 0.24 },
    residentialRates: { basicRate: 0.18, higherRate: 0.24 },
    businessAssetDisposalReliefRate: 0.10,
    businessAssetDisposalReliefLifetimeLimit: 1000000,
  },
};

// 2023/24 (6 Apr 2023 – 5 Apr 2024)
// NIC: 12% until 5 Jan 2024, then 10% from 6 Jan 2024
// Using weighted average ~11.5% but we'll use the main rate for simplicity
const data2023_24: TaxYearData = {
  year: "2023-24",
  label: "2023/24",
  startDate: "2023-04-06",
  endDate: "2024-04-05",
  incomeTax: {
    personalAllowance: 12570,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 37700 },
      { name: "Higher rate", rate: 0.40, from: 37700, to: 125140 },
      { name: "Additional rate", rate: 0.45, from: 125140, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 2162 },
      { name: "Basic rate", rate: 0.20, from: 2162, to: 13118 },
      { name: "Intermediate rate", rate: 0.21, from: 13118, to: 31092 },
      { name: "Higher rate", rate: 0.42, from: 31092, to: 125140 },
      { name: "Top rate", rate: 0.47, from: 125140, to: Infinity },
    ],
    dividendAllowance: 1000,
    dividendRates: { basic: 0.0875, higher: 0.3375, additional: 0.3935 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1260,
    blindPersonsAllowance: 2870,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6396,
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      mainRate: 0.12, // 12% Apr-Jan, 10% Jan-Apr — calculator uses 12% as default
      upperRate: 0.02,
      secondaryThreshold: 9100,
      employerRate: 0.138,
    },
    class2: { weeklyRate: 3.45, smallProfitsThreshold: 6725 },
    class4: {
      lowerProfitsLimit: 12570,
      upperProfitsLimit: 50270,
      mainRate: 0.09,
      upperRate: 0.02,
    },
  },
  studentLoans: {
    plan1: { threshold: 22015, rate: 0.09 },
    plan2: { threshold: 27295, rate: 0.09 },
    plan4: { threshold: 27660, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6240,
      upperQualifyingEarnings: 50270,
      minimumEmployeeRate: 0.05,
      minimumEmployerRate: 0.03,
      totalMinimumRate: 0.08,
      earningsTrigger: 10000,
    },
    annualAllowance: 60000,
    taperThreshold: 260000,
    minimumTaperedAllowance: 10000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 6000,
    rates: { basicRate: 0.10, higherRate: 0.20 },
    residentialRates: { basicRate: 0.18, higherRate: 0.28 },
    businessAssetDisposalReliefRate: 0.10,
    businessAssetDisposalReliefLifetimeLimit: 1000000,
  },
};

// 2022/23 (6 Apr 2022 – 5 Apr 2023)
// Complex NIC year: 13.25% Apr-Nov, 12% Nov-Apr; PT changed Jul
// Using dominant rates for simplicity
const data2022_23: TaxYearData = {
  year: "2022-23",
  label: "2022/23",
  startDate: "2022-04-06",
  endDate: "2023-04-05",
  incomeTax: {
    personalAllowance: 12570,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 37700 },
      { name: "Higher rate", rate: 0.40, from: 37700, to: 150000 },
      { name: "Additional rate", rate: 0.45, from: 150000, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 2162 },
      { name: "Basic rate", rate: 0.20, from: 2162, to: 13118 },
      { name: "Intermediate rate", rate: 0.21, from: 13118, to: 31092 },
      { name: "Higher rate", rate: 0.41, from: 31092, to: 150000 },
      { name: "Top rate", rate: 0.46, from: 150000, to: Infinity },
    ],
    dividendAllowance: 2000,
    dividendRates: { basic: 0.0875, higher: 0.3375, additional: 0.3935 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1260,
    blindPersonsAllowance: 2600,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6396,
      primaryThreshold: 12570, // changed to 12570 from July 2022
      upperEarningsLimit: 50270,
      mainRate: 0.1325, // 13.25% Apr-Nov, 12% Nov-Apr (blended ~12.73%)
      upperRate: 0.0325, // 3.25% Apr-Nov, 2% Nov-Apr
      secondaryThreshold: 9100,
      employerRate: 0.1505, // 15.05% Apr-Nov, 13.8% Nov-Apr
    },
    class2: { weeklyRate: 3.15, smallProfitsThreshold: 6725 },
    class4: {
      lowerProfitsLimit: 11908, // blended
      upperProfitsLimit: 50270,
      mainRate: 0.0973, // blended 10.25%/9%
      upperRate: 0.0273, // blended 3.25%/2%
    },
  },
  studentLoans: {
    plan1: { threshold: 20195, rate: 0.09 },
    plan2: { threshold: 27295, rate: 0.09 },
    plan4: { threshold: 25375, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6240,
      upperQualifyingEarnings: 50270,
      minimumEmployeeRate: 0.05,
      minimumEmployerRate: 0.03,
      totalMinimumRate: 0.08,
      earningsTrigger: 10000,
    },
    annualAllowance: 40000,
    taperThreshold: 240000,
    minimumTaperedAllowance: 4000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 12300,
    rates: { basicRate: 0.10, higherRate: 0.20 },
    residentialRates: { basicRate: 0.18, higherRate: 0.28 },
    businessAssetDisposalReliefRate: 0.10,
    businessAssetDisposalReliefLifetimeLimit: 1000000,
  },
};

// 2021/22
const data2021_22: TaxYearData = {
  year: "2021-22",
  label: "2021/22",
  startDate: "2021-04-06",
  endDate: "2022-04-05",
  incomeTax: {
    personalAllowance: 12570,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 37700 },
      { name: "Higher rate", rate: 0.40, from: 37700, to: 150000 },
      { name: "Additional rate", rate: 0.45, from: 150000, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 2097 },
      { name: "Basic rate", rate: 0.20, from: 2097, to: 12726 },
      { name: "Intermediate rate", rate: 0.21, from: 12726, to: 31092 },
      { name: "Higher rate", rate: 0.41, from: 31092, to: 150000 },
      { name: "Top rate", rate: 0.46, from: 150000, to: Infinity },
    ],
    dividendAllowance: 2000,
    dividendRates: { basic: 0.075, higher: 0.325, additional: 0.381 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1260,
    blindPersonsAllowance: 2520,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6240,
      primaryThreshold: 9568,
      upperEarningsLimit: 50270,
      mainRate: 0.12,
      upperRate: 0.02,
      secondaryThreshold: 8840,
      employerRate: 0.138,
    },
    class2: { weeklyRate: 3.05, smallProfitsThreshold: 6515 },
    class4: {
      lowerProfitsLimit: 9568,
      upperProfitsLimit: 50270,
      mainRate: 0.09,
      upperRate: 0.02,
    },
  },
  studentLoans: {
    plan1: { threshold: 19895, rate: 0.09 },
    plan2: { threshold: 27295, rate: 0.09 },
    plan4: { threshold: 25000, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6240,
      upperQualifyingEarnings: 50270,
      minimumEmployeeRate: 0.05,
      minimumEmployerRate: 0.03,
      totalMinimumRate: 0.08,
      earningsTrigger: 10000,
    },
    annualAllowance: 40000,
    taperThreshold: 240000,
    minimumTaperedAllowance: 4000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 12300,
    rates: { basicRate: 0.10, higherRate: 0.20 },
    residentialRates: { basicRate: 0.18, higherRate: 0.28 },
    businessAssetDisposalReliefRate: 0.10,
    businessAssetDisposalReliefLifetimeLimit: 1000000,
  },
};

// 2020/21
const data2020_21: TaxYearData = {
  year: "2020-21",
  label: "2020/21",
  startDate: "2020-04-06",
  endDate: "2021-04-05",
  incomeTax: {
    personalAllowance: 12500,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 37500 },
      { name: "Higher rate", rate: 0.40, from: 37500, to: 150000 },
      { name: "Additional rate", rate: 0.45, from: 150000, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 2085 },
      { name: "Basic rate", rate: 0.20, from: 2085, to: 12658 },
      { name: "Intermediate rate", rate: 0.21, from: 12658, to: 30930 },
      { name: "Higher rate", rate: 0.41, from: 30930, to: 150000 },
      { name: "Top rate", rate: 0.46, from: 150000, to: Infinity },
    ],
    dividendAllowance: 2000,
    dividendRates: { basic: 0.075, higher: 0.325, additional: 0.381 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1250,
    blindPersonsAllowance: 2500,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6240,
      primaryThreshold: 9500,
      upperEarningsLimit: 50000,
      mainRate: 0.12,
      upperRate: 0.02,
      secondaryThreshold: 8788,
      employerRate: 0.138,
    },
    class2: { weeklyRate: 3.05, smallProfitsThreshold: 6475 },
    class4: {
      lowerProfitsLimit: 9500,
      upperProfitsLimit: 50000,
      mainRate: 0.09,
      upperRate: 0.02,
    },
  },
  studentLoans: {
    plan1: { threshold: 19390, rate: 0.09 },
    plan2: { threshold: 26575, rate: 0.09 },
    plan4: { threshold: 25000, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6240,
      upperQualifyingEarnings: 50000,
      minimumEmployeeRate: 0.05,
      minimumEmployerRate: 0.03,
      totalMinimumRate: 0.08,
      earningsTrigger: 10000,
    },
    annualAllowance: 40000,
    taperThreshold: 240000,
    minimumTaperedAllowance: 4000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 12300,
    rates: { basicRate: 0.10, higherRate: 0.20 },
    residentialRates: { basicRate: 0.18, higherRate: 0.28 },
    businessAssetDisposalReliefRate: 0.10,
    businessAssetDisposalReliefLifetimeLimit: 1000000,
  },
};

// 2019/20
const data2019_20: TaxYearData = {
  year: "2019-20",
  label: "2019/20",
  startDate: "2019-04-06",
  endDate: "2020-04-05",
  incomeTax: {
    personalAllowance: 12500,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 37500 },
      { name: "Higher rate", rate: 0.40, from: 37500, to: 150000 },
      { name: "Additional rate", rate: 0.45, from: 150000, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 2049 },
      { name: "Basic rate", rate: 0.20, from: 2049, to: 12444 },
      { name: "Intermediate rate", rate: 0.21, from: 12444, to: 30930 },
      { name: "Higher rate", rate: 0.41, from: 30930, to: 150000 },
      { name: "Top rate", rate: 0.46, from: 150000, to: Infinity },
    ],
    dividendAllowance: 2000,
    dividendRates: { basic: 0.075, higher: 0.325, additional: 0.381 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1250,
    blindPersonsAllowance: 2450,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6136,
      primaryThreshold: 8632,
      upperEarningsLimit: 50000,
      mainRate: 0.12,
      upperRate: 0.02,
      secondaryThreshold: 8632,
      employerRate: 0.138,
    },
    class2: { weeklyRate: 3.00, smallProfitsThreshold: 6365 },
    class4: {
      lowerProfitsLimit: 8632,
      upperProfitsLimit: 50000,
      mainRate: 0.09,
      upperRate: 0.02,
    },
  },
  studentLoans: {
    plan1: { threshold: 18935, rate: 0.09 },
    plan2: { threshold: 25725, rate: 0.09 },
    plan4: { threshold: 18935, rate: 0.09 }, // Plan 4 not yet separate, using Plan 1
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6136,
      upperQualifyingEarnings: 50000,
      minimumEmployeeRate: 0.05,
      minimumEmployerRate: 0.03,
      totalMinimumRate: 0.08,
      earningsTrigger: 10000,
    },
    annualAllowance: 40000,
    taperThreshold: 150000,
    minimumTaperedAllowance: 10000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 12000,
    rates: { basicRate: 0.10, higherRate: 0.20 },
    residentialRates: { basicRate: 0.18, higherRate: 0.28 },
    businessAssetDisposalReliefRate: 0.10,
    businessAssetDisposalReliefLifetimeLimit: 10000000,
  },
};

// 2018/19
const data2018_19: TaxYearData = {
  year: "2018-19",
  label: "2018/19",
  startDate: "2018-04-06",
  endDate: "2019-04-05",
  incomeTax: {
    personalAllowance: 11850,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceTaperRate: 0.5,
    bands: [
      { name: "Basic rate", rate: 0.20, from: 0, to: 34500 },
      { name: "Higher rate", rate: 0.40, from: 34500, to: 150000 },
      { name: "Additional rate", rate: 0.45, from: 150000, to: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, from: 0, to: 2000 },
      { name: "Basic rate", rate: 0.20, from: 2000, to: 12150 },
      { name: "Intermediate rate", rate: 0.21, from: 12150, to: 31580 },
      { name: "Higher rate", rate: 0.41, from: 31580, to: 150000 },
      { name: "Top rate", rate: 0.46, from: 150000, to: Infinity },
    ],
    dividendAllowance: 2000,
    dividendRates: { basic: 0.075, higher: 0.325, additional: 0.381 },
    savingsAllowanceBasic: 1000,
    savingsAllowanceHigher: 500,
    savingsStartingRateBand: 5000,
    marriageAllowance: 1185,
    blindPersonsAllowance: 2390,
  },
  nic: {
    class1: {
      lowerEarningsLimit: 6032,
      primaryThreshold: 8424,
      upperEarningsLimit: 46350,
      mainRate: 0.12,
      upperRate: 0.02,
      secondaryThreshold: 8424,
      employerRate: 0.138,
    },
    class2: { weeklyRate: 2.95, smallProfitsThreshold: 6205 },
    class4: {
      lowerProfitsLimit: 8424,
      upperProfitsLimit: 46350,
      mainRate: 0.09,
      upperRate: 0.02,
    },
  },
  studentLoans: {
    plan1: { threshold: 18330, rate: 0.09 },
    plan2: { threshold: 25000, rate: 0.09 },
    plan4: { threshold: 18330, rate: 0.09 }, // Plan 4 not yet separate
    postgraduate: { threshold: 21000, rate: 0.06 },
  },
  pension: {
    autoEnrolment: {
      lowerQualifyingEarnings: 6032,
      upperQualifyingEarnings: 46350,
      minimumEmployeeRate: 0.03, // 2018/19 was transitional: 3% employee + 2% employer
      minimumEmployerRate: 0.02,
      totalMinimumRate: 0.05,
      earningsTrigger: 10000,
    },
    annualAllowance: 40000,
    taperThreshold: 150000,
    minimumTaperedAllowance: 10000,
    maxTaxFreeLumpSum: 268275,
  },
  cgt: {
    annualExemptAmount: 11700,
    rates: { basicRate: 0.10, higherRate: 0.20 },
    residentialRates: { basicRate: 0.18, higherRate: 0.28 },
    businessAssetDisposalReliefRate: 0.10,
    businessAssetDisposalReliefLifetimeLimit: 10000000,
  },
};

// Tax Year Registry

export const TAX_YEARS: Record<TaxYear, TaxYearData> = {
  "2026-27": data2026_27,
  "2025-26": data2025_26,
  "2024-25": data2024_25,
  "2023-24": data2023_24,
  "2022-23": data2022_23,
  "2021-22": data2021_22,
  "2020-21": data2020_21,
  "2019-20": data2019_20,
  "2018-19": data2018_19,
};
const BASE_TAX_YEAR_OPTIONS: { value: TaxYear; label: string; claimable: boolean }[] = [
  { value: "2026-27", label: "2026/27", claimable: true },
  { value: "2025-26", label: "2025/26", claimable: true },
  { value: "2024-25", label: "2024/25", claimable: true },
  { value: "2023-24", label: "2023/24", claimable: true },
  { value: "2022-23", label: "2022/23", claimable: true },
  { value: "2021-22", label: "2021/22", claimable: false },
  { value: "2020-21", label: "2020/21", claimable: false },
  { value: "2019-20", label: "2019/20", claimable: false },
  { value: "2018-19", label: "2018/19", claimable: false },
];

export function getCurrentTaxYearValue(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hasTaxYearStarted = month > 3 || (month === 3 && day >= 6);
  const startYear = hasTaxYearStarted ? year : year - 1;
  const endYear = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYear}`;
}

function hasTaxYearData(value: string): value is TaxYear {
  return value in TAX_YEARS;
}

export function getLatestAvailableTaxYear(): TaxYear {
  return BASE_TAX_YEAR_OPTIONS[0].value;
}

export function getDefaultTaxYear(date: Date = new Date()): TaxYear {
  const currentTaxYear = getCurrentTaxYearValue(date);
  if (hasTaxYearData(currentTaxYear)) {
    return currentTaxYear;
  }
  return getLatestAvailableTaxYear();
}

const systemCurrentTaxYear = getCurrentTaxYearValue();
const latestAvailableTaxYear = getLatestAvailableTaxYear();
const isSystemCurrentYearAvailable = hasTaxYearData(systemCurrentTaxYear);

export const TAX_YEAR_OPTIONS: { value: TaxYear; label: string; claimable: boolean }[] =
  BASE_TAX_YEAR_OPTIONS.map((option) => {
    const isCurrent = option.value === systemCurrentTaxYear;
    const isLatestAvailableButNotCurrent =
      option.value === latestAvailableTaxYear && !isSystemCurrentYearAvailable;
    const suffix = isCurrent
      ? " (Current)"
      : isLatestAvailableButNotCurrent
        ? " (Latest available)"
        : "";

    return {
      ...option,
      label: `${option.label}${suffix}`,
    };
  });

function cloneBands(bands: TaxBand[]): TaxBand[] {
  return bands.map((band) => ({ ...band }));
}

function withExplicitRegionalBands(yearData: TaxYearData): TaxYearData {
  const baseBands = yearData.incomeTax.bands;
  return {
    ...yearData,
    incomeTax: {
      ...yearData.incomeTax,
      welshBands: yearData.incomeTax.welshBands ?? cloneBands(baseBands),
      northernIrelandBands:
        yearData.incomeTax.northernIrelandBands ?? cloneBands(baseBands),
    },
  };
}

export function getTaxYearData(year: TaxYear): TaxYearData {
  return withExplicitRegionalBands(TAX_YEARS[year]);
}

export function isClaimableYear(year: TaxYear): boolean {
  const option = TAX_YEAR_OPTIONS.find((o) => o.value === year);
  return option?.claimable ?? false;
}
