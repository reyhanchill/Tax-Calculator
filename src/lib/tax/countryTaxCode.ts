import { Country } from "./types";

function normalizeTaxCodeInput(taxCode: string): string {
  return taxCode.toUpperCase().replace(/\s+/g, "").trim();
}

function taxCodePrefixForCountry(country: Country): "S" | "C" | "" {
  if (country === "scotland") return "S";
  if (country === "wales") return "C";
  return "";
}

function stripRegionalPrefix(taxCode: string): string {
  return normalizeTaxCodeInput(taxCode).replace(/^[SC]/, "");
}

export function detectCountryFromTaxCodePrefix(taxCode: string): Country | null {
  const normalized = normalizeTaxCodeInput(taxCode);
  if (normalized.startsWith("S")) return "scotland";
  if (normalized.startsWith("C")) return "wales";
  return null;
}

export function alignTaxCodeWithCountry(taxCode: string, country: Country): string {
  const normalized = normalizeTaxCodeInput(taxCode);
  if (!normalized) return "";

  const withoutPrefix = stripRegionalPrefix(normalized);
  const prefix = taxCodePrefixForCountry(country);
  return `${prefix}${withoutPrefix}`;
}

export function defaultTaxCodeForCountry(country: Country): string {
  return alignTaxCodeWithCountry("1257L", country);
}

export function normalizeCountryAndTaxCode(
  selectedCountry: Country,
  taxCode: string,
): { country: Country; taxCode: string } {
  const inferredCountry = detectCountryFromTaxCodePrefix(taxCode);
  const country = inferredCountry ?? selectedCountry;

  return {
    country,
    taxCode: alignTaxCodeWithCountry(taxCode, country),
  };
}
