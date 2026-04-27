"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import { normalizeCountryAndTaxCode } from "@/lib/tax/countryTaxCode";
import { Country } from "@/lib/tax/types";

// Audit Logger
async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  before: unknown,
  after: unknown,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      before: before ? JSON.stringify(before) : null,
      after: after ? JSON.stringify(after) : null,
    },
  });
}

// Tax Entry CRUD

export async function saveTaxEntry(data: {
  taxYear: string;
  entryName: string;
  country: Country;
  taxCode?: string;
  incomeItems: { type: string; amount: number; description: string }[];
  capitalGains?: { assetType: string; purchasePrice: number; salePrice: number; costs: number; description: string }[];
}) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const normalizedCountryTax = normalizeCountryAndTaxCode(data.country, data.taxCode ?? "");

  const entry = await prisma.taxEntry.create({
    data: {
      userId: session.userId,
      taxYear: data.taxYear,
      entryName: data.entryName || "Tax Calculation",
      country: normalizedCountryTax.country,
      taxCode: normalizedCountryTax.taxCode || null,
      incomeItems: {
        create: data.incomeItems.filter((i) => i.amount > 0),
      },
      capitalGains: data.capitalGains
        ? { create: data.capitalGains.filter((g) => g.salePrice > 0) }
        : undefined,
    },
    include: { incomeItems: true, capitalGains: true },
  });

  await createAuditLog(session.userId, "create", "TaxEntry", entry.id, null, entry);
  revalidatePath("/dashboard");
  return { success: true, entryId: entry.id };
}

export async function updateTaxEntry(
  entryId: string,
  data: {
    entryName?: string;
    country?: Country;
    taxCode?: string;
    status?: string;
    incomeItems?: { type: string; amount: number; description: string }[];
  },
) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const existing = await prisma.taxEntry.findFirst({
    where: { id: entryId, userId: session.userId },
    include: { incomeItems: true },
  });
  if (!existing) return { error: "Entry not found" };

  // Update income items if provided
  if (data.incomeItems) {
    await prisma.incomeItem.deleteMany({ where: { entryId } });
    await prisma.incomeItem.createMany({
      data: data.incomeItems.filter((i) => i.amount > 0).map((i) => ({ ...i, entryId })),
    });
  }
  const shouldNormalizeCountryTax = data.country !== undefined || data.taxCode !== undefined;
  const normalizedCountryTax = shouldNormalizeCountryTax
    ? normalizeCountryAndTaxCode(
        data.country ?? (existing.country as Country),
        data.taxCode ?? existing.taxCode ?? "",
      )
    : null;

  const updated = await prisma.taxEntry.update({
    where: { id: entryId },
    data: {
      entryName: data.entryName,
      country: normalizedCountryTax?.country,
      taxCode: normalizedCountryTax ? normalizedCountryTax.taxCode || null : undefined,
      status: data.status,
    },
    include: { incomeItems: true },
  });

  await createAuditLog(session.userId, "update", "TaxEntry", entryId, existing, updated);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTaxEntry(entryId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const existing = await prisma.taxEntry.findFirst({
    where: { id: entryId, userId: session.userId },
  });
  if (!existing) return { error: "Entry not found" };

  await prisma.taxEntry.delete({ where: { id: entryId } });
  await createAuditLog(session.userId, "delete", "TaxEntry", entryId, existing, null);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getUserEntries() {
  const session = await getSession();
  if (!session) return [];

  return prisma.taxEntry.findMany({
    where: { userId: session.userId },
    include: { incomeItems: true, capitalGains: true, deductions: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getUserAuditLogs() {
  const session = await getSession();
  if (!session) return [];

  return prisma.auditLog.findMany({
    where: { userId: session.userId },
    orderBy: { timestamp: "desc" },
    take: 100,
  });
}

// GDPR: Data Export
export async function exportUserData() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      settings: true,
      taxEntries: {
        include: { incomeItems: true, deductions: true, capitalGains: true },
      },
      auditLogs: true,
    },
  });

  if (!user) return { error: "User not found" };

  // Remove sensitive fields
  const { passwordHash, totpSecret, ...safeUser } = user;
  void passwordHash;
  void totpSecret;

  return {
    success: true,
    data: {
      exportedAt: new Date().toISOString(),
      user: safeUser,
    },
  };
}

// GDPR: Account Deletion
export async function deleteUserAccount() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  // Cascade deletes all related data
  await prisma.user.delete({ where: { id: session.userId } });

  // Clear session
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("session");

  return { success: true };
}

// Settings
export async function updateUserSettings(data: {
  country?: Country;
  defaultTaxCode?: string;
  studentLoanPlans?: string[];
  pensionEmployeeRate?: number;
  pensionEmployerRate?: number;
  useSalarySacrifice?: boolean;
}) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const shouldNormalizeCountryTax = data.country !== undefined || data.defaultTaxCode !== undefined;
  const existingSettings = shouldNormalizeCountryTax
    ? await prisma.userSettings.findUnique({
        where: { userId: session.userId },
        select: { country: true, defaultTaxCode: true },
      })
    : null;
  const normalizedCountryTax = shouldNormalizeCountryTax
    ? normalizeCountryAndTaxCode(
        data.country ?? (existingSettings?.country as Country) ?? "england",
        data.defaultTaxCode ?? existingSettings?.defaultTaxCode ?? "1257L",
      )
    : null;

  await prisma.userSettings.upsert({
    where: { userId: session.userId },
    update: {
      ...data,
      country: normalizedCountryTax?.country ?? data.country,
      defaultTaxCode: normalizedCountryTax?.taxCode ?? data.defaultTaxCode,
      studentLoanPlans: data.studentLoanPlans ? JSON.stringify(data.studentLoanPlans) : undefined,
    },
    create: {
      userId: session.userId,
      ...data,
      country: normalizedCountryTax?.country ?? data.country ?? "england",
      defaultTaxCode: normalizedCountryTax?.taxCode ?? data.defaultTaxCode ?? "1257L",
      studentLoanPlans: data.studentLoanPlans ? JSON.stringify(data.studentLoanPlans) : "[]",
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
