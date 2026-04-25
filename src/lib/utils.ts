import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

export type PayPeriod = "weekly" | "biweekly" | "monthly" | "annual";

export function annualToPayPeriod(annual: number, period: PayPeriod): number {
  switch (period) {
    case "weekly":
      return annual / 52;
    case "biweekly":
      return annual / 26;
    case "monthly":
      return annual / 12;
    case "annual":
      return annual;
  }
}

export function payPeriodLabel(period: PayPeriod): string {
  switch (period) {
    case "weekly":
      return "Weekly";
    case "biweekly":
      return "Bi-weekly";
    case "monthly":
      return "Monthly";
    case "annual":
      return "Annual";
  }
}
