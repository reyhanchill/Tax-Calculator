"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import { normalizeCountryAndTaxCode } from "@/lib/tax/countryTaxCode";
import { Country } from "@/lib/tax/types";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const countrySchema = z.enum(["england", "scotland", "wales", "northern-ireland"]);
const taxYearSchema = z.enum([
  "2018-19", "2019-20", "2020-21", "2021-22", "2022-23",
  "2023-24", "2024-25", "2025-26", "2026-27",
]);
const moneySchema = z.number().finite().min(0).max(1_000_000_000);
const incomeItemSchema = z.object({
  type: z.enum(["employment", "self-employment", "dividend", "savings", "rental", "pension", "other"]),
  amount: moneySchema,
  description: z.string().trim().max(250),
});
const capitalGainSchema = z.object({
  assetType: z.enum(["residential", "shares", "other", "business-asset"]),
  purchasePrice: moneySchema,
  salePrice: moneySchema,
  costs: moneySchema,
  description: z.string().trim().max(250),
});
const saveEntrySchema = z.object({
  taxYear: taxYearSchema,
  entryName: z.string().trim().min(1).max(100),
  country: countrySchema,
  taxCode: z.string().trim().max(20).optional(),
  incomeItems: z.array(incomeItemSchema).max(50),
  capitalGains: z.array(capitalGainSchema).max(50).optional(),
});

// Audit Logger
async function createAuditLog(
  db: Prisma.TransactionClient | typeof prisma,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  before: unknown,
  after: unknown,
) {
  await db.auditLog.create({
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
  const parsed = saveEntrySchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid tax entry data." };
  data = parsed.data;
  const normalizedCountryTax = normalizeCountryAndTaxCode(data.country, data.taxCode ?? "");

  try {
    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.taxEntry.create({
        data: {
          userId: session.userId,
          taxYear: data.taxYear,
          entryName: data.entryName || "Tax Calculation",
          country: normalizedCountryTax.country,
          taxCode: normalizedCountryTax.taxCode || null,
          incomeItems: { create: data.incomeItems.filter((i) => i.amount > 0) },
          capitalGains: data.capitalGains
            ? { create: data.capitalGains.filter((g) => g.salePrice > 0) }
            : undefined,
        },
        include: { incomeItems: true, capitalGains: true },
      });
      await createAuditLog(tx, session.userId, "create", "TaxEntry", created.id, null, created);
      return created;
    });
    revalidatePath("/dashboard");
    return { success: true, entryId: entry.id };
  } catch (error) {
    console.error("Failed to save tax entry:", error);
    return { error: "Could not save this tax entry. Please try again." };
  }
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

  const updateSchema = z.object({
    entryName: z.string().trim().min(1).max(100).optional(),
    country: countrySchema.optional(),
    taxCode: z.string().trim().max(20).optional(),
    status: z.enum(["draft", "final"]).optional(),
    incomeItems: z.array(incomeItemSchema).max(50).optional(),
  });
  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid tax entry data." };
  data = parsed.data;
  const shouldNormalizeCountryTax = data.country !== undefined || data.taxCode !== undefined;
  const normalizedCountryTax = shouldNormalizeCountryTax
    ? normalizeCountryAndTaxCode(
        data.country ?? (existing.country as Country),
        data.taxCode ?? existing.taxCode ?? "",
      )
    : null;

  try {
    await prisma.$transaction(async (tx) => {
      if (data.incomeItems) {
        await tx.incomeItem.deleteMany({ where: { entryId } });
        await tx.incomeItem.createMany({
          data: data.incomeItems.filter((i) => i.amount > 0).map((i) => ({ ...i, entryId })),
        });
      }
      const updated = await tx.taxEntry.update({
        where: { id: entryId, userId: session.userId },
        data: {
          entryName: data.entryName,
          country: normalizedCountryTax?.country,
          taxCode: normalizedCountryTax ? normalizedCountryTax.taxCode || null : undefined,
          status: data.status,
        },
        include: { incomeItems: true },
      });
      await createAuditLog(tx, session.userId, "update", "TaxEntry", entryId, existing, updated);
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update tax entry:", error);
    return { error: "Could not update this tax entry. Please try again." };
  }
}

export async function deleteTaxEntry(entryId: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const existing = await prisma.taxEntry.findFirst({
    where: { id: entryId, userId: session.userId },
  });
  if (!existing) return { error: "Entry not found" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.taxEntry.delete({ where: { id: entryId, userId: session.userId } });
      await createAuditLog(tx, session.userId, "delete", "TaxEntry", entryId, existing, null);
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tax entry:", error);
    return { error: "Could not delete this tax entry. Please try again." };
  }
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

  try {
    // Cascade deletes all related data
    await prisma.user.delete({ where: { id: session.userId } });
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return { error: "Could not delete your account. Please try again." };
  }

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
  const settingsSchema = z.object({
    country: countrySchema.optional(),
    defaultTaxCode: z.string().trim().max(20).optional(),
    studentLoanPlans: z.array(z.enum(["plan1", "plan2", "plan4", "plan5", "postgraduate"])).max(5).optional(),
    pensionEmployeeRate: z.number().finite().min(0).max(1).optional(),
    pensionEmployerRate: z.number().finite().min(0).max(1).optional(),
    useSalarySacrifice: z.boolean().optional(),
  });
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid settings data." };
  data = parsed.data;
  const existingSettings = await prisma.userSettings.findUnique({
    where: { userId: session.userId },
  });
  const shouldNormalizeCountryTax = data.country !== undefined || data.defaultTaxCode !== undefined;
  const normalizedCountryTax = shouldNormalizeCountryTax
    ? normalizeCountryAndTaxCode(
        data.country ?? (existingSettings?.country as Country) ?? "england",
        data.defaultTaxCode ?? existingSettings?.defaultTaxCode ?? "1257L",
      )
    : null;

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.userSettings.upsert({
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
      await createAuditLog(
        tx,
        session.userId,
        existingSettings ? "update" : "create",
        "UserSettings",
        updated.id,
        existingSettings,
        updated,
      );
    });
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return { error: "Could not save your settings. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
