import { describe, expect, it } from "vitest";
import {
  calculateCGT,
  calculateFullTax,
  calculateIncomeTax,
  calculateNIC,
  calculateStudentLoans,
} from "./index";
import { estimateCorporationTax } from "../../business/corporationTax";

describe("tax calculation boundaries", () => {
  it("does not charge Class 2 NIC from 2024/25", () => {
    expect(calculateNIC(0, 30_000, "2025-26").class2).toBe(0);
  });

  it("charges only one 9% deduction for multiple undergraduate plans", () => {
    const loans = calculateStudentLoans(40_000, ["plan1", "plan2"], "2025-26");
    expect(loans).toHaveLength(1);
    expect(loans[0].repayment).toBe(1037.7);
  });

  it("allows a separate postgraduate deduction", () => {
    const loans = calculateStudentLoans(
      40_000,
      ["plan1", "plan2", "postgraduate"],
      "2025-26",
    );
    expect(loans).toHaveLength(2);
    expect(loans.reduce((sum, loan) => sum + loan.repayment, 0)).toBe(2177.7);
  });

  it("uses statutory corporation-tax marginal relief", () => {
    expect(estimateCorporationTax(100_000, "2025-26")).toBe(22_750);
  });

  it("applies the flat pre-2023 corporation tax rate for older tax years", () => {
    expect(estimateCorporationTax(100_000, "2022-23")).toBe(19_000);
  });

  it("gives additional-rate taxpayers no Personal Savings Allowance", () => {
    const result = calculateIncomeTax(125_140, 0, 1_000, "2025-26", "england");
    expect(result.savingsAllowanceUsed).toBe(0);
  });

  it("applies Business Asset Disposal Relief to eligible gains", () => {
    const result = calculateCGT(
      [{ amount: 10_000, assetType: "business-asset" }],
      0,
      0,
      "2025-26",
    );
    expect(result.totalCGT).toBe(980);
  });

  it("has BADR-relieved gains consume the basic-rate band before other gains", () => {
    const result = calculateCGT(
      [
        { amount: 50_000, assetType: "business-asset" },
        { amount: 10_000, assetType: "shares" },
      ],
      0,
      30_000,
      "2025-26",
    );
    expect(result.totalCGT).toBe(8_930);
  });

  it("taxes savings income above the additional-rate threshold at 45%", () => {
    const result = calculateIncomeTax(130_000, 0, 10_000, "2025-26", "england");
    expect(result.savingsTax).toBe(4_500);
  });

  it("reduces taxable earnings when salary sacrifice is enabled", () => {
    const base = {
      taxYear: "2025-26" as const,
      country: "england" as const,
      employmentIncome: 50_000,
      selfEmploymentIncome: 0,
      dividendIncome: 0,
      savingsIncome: 0,
      rentalIncome: 0,
      pensionIncome: 0,
      otherIncome: 0,
      studentLoanPlans: [],
      pensionEmployeeRate: 0.05,
      pensionEmployerRate: 0.03,
      useSalarySacrifice: false,
    };
    const ordinary = calculateFullTax(base);
    const sacrificed = calculateFullTax({ ...base, useSalarySacrifice: true });
    expect(sacrificed.incomeTax.totalTax).toBeLessThan(ordinary.incomeTax.totalTax);
    expect(sacrificed.nic.totalEmployee).toBeLessThan(ordinary.nic.totalEmployee);
  });
});
