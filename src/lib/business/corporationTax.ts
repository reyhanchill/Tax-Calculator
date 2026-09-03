import { TaxYear } from "@/lib/tax/types";

/**
 * Estimate UK Corporation Tax for a 12-month period with no associated companies.
 *
 * The small-profits-rate/marginal-relief regime (19% to £50k, tapered to 25%
 * at £250k+) only applies from April 2023. Before that, Corporation Tax was a
 * flat 19% at every profit level.
 */
export function estimateCorporationTax(taxableProfit: number, taxYear: TaxYear): number {
  const profit = Math.max(0, taxableProfit);
  const usesTieredRegime = Number(taxYear.slice(0, 4)) >= 2023;

  const tax = !usesTieredRegime || profit <= 50_000
    ? profit * 0.19
    : profit >= 250_000
      ? profit * 0.25
      : profit * 0.25 - (250_000 - profit) * (3 / 200);
  return Math.round(tax * 100) / 100;
}
