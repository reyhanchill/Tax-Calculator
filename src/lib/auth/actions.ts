"use server";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { z } from "zod";

// Simple JWT-like session using signed cookies
const SESSION_SECRET: string = process.env.AUTH_SECRET ?? "";
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
}
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30; // 30 minutes
type EmailDeliveryStatus = "sent" | "skipped" | "error";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Dummy hash so a login attempt for a nonexistent email spends roughly the
// same time as one for a real account, avoiding a bcrypt-timing oracle.
const DUMMY_PASSWORD_HASH =
  "$2b$12$kqkI.V8jjFNLBmEw2Wxk5.Ez./nMtB4/jHNAxODVjrv.lJuPoU6H2";

function hashEmailVerificationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
function normalizeBaseUrl(baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  return normalizedBaseUrl.replace(/\/$/, "");
}

async function resolveEmailBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost || headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");

  if (host) {
    const protocol =
      forwardedProto ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return normalizeBaseUrl(`${protocol}://${host}`);
  }

  const fallbackBaseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "http://localhost:3000";
  return normalizeBaseUrl(fallbackBaseUrl);
}

function createEmailVerificationLink(token: string, baseUrl: string): string {
  return `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
}
function createPasswordResetLink(token: string, baseUrl: string): string {
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

async function sendVerificationEmail(input: {
  userId: string;
  email: string;
  name: string | null;
}): Promise<EmailDeliveryStatus> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashEmailVerificationToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
  const baseUrl = await resolveEmailBaseUrl();
  const firstName = input.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const greetingHtml = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  const verificationLink = createEmailVerificationLink(token, baseUrl);

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: input.userId },
  });
  await prisma.emailVerificationToken.create({
    data: {
      userId: input.userId,
      tokenHash,
      expiresAt,
    },
  });

  const text = `${greeting}

Thanks for creating your TaxFlow account.
Please verify your email by clicking the link below:
${verificationLink}

This link expires in 24 hours.`;

  const html = `
    <p>${greetingHtml}</p>
    <p>Thanks for creating your TaxFlow account.</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verificationLink}">Verify your email</a></p>
    <p>This link expires in 24 hours.</p>
  `;

  try {
    const delivery = await sendEmail({
      to: input.email,
      subject: "Verify your TaxFlow email",
      text,
      html,
    });

    return delivery.status;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return "error";
  }
}

async function sendPasswordResetEmail(input: {
  userId: string;
  email: string;
  name: string | null;
}): Promise<EmailDeliveryStatus> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  const baseUrl = await resolveEmailBaseUrl();
  const firstName = input.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const greetingHtml = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  const resetLink = createPasswordResetLink(token, baseUrl);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: input.userId },
  });
  await prisma.passwordResetToken.create({
    data: {
      userId: input.userId,
      tokenHash,
      expiresAt,
    },
  });

  const text = `${greeting}

We received a request to reset your TaxFlow password.
Use the link below to choose a new password:
${resetLink}

This link expires in 30 minutes. If you did not request this, you can safely ignore this email.`;

  const html = `
    <p>${greetingHtml}</p>
    <p>We received a request to reset your TaxFlow password.</p>
    <p>Use the link below to choose a new password:</p>
    <p><a href="${resetLink}">Reset your password</a></p>
    <p>This link expires in 30 minutes. If you did not request this, you can safely ignore this email.</p>
  `;

  try {
    const delivery = await sendEmail({
      to: input.email,
      subject: "Reset your TaxFlow password",
      text,
      html,
    });

    return delivery.status;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return "error";
  }
}

type SessionPayload = { userId: string; email: string; expiresAt: number };

function signToken(payload: Omit<SessionPayload, "expiresAt">): string {
  const data = JSON.stringify({
    ...payload,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
  return Buffer.from(data).toString("base64") + "." + signature;
}

function verifyToken(token: string): SessionPayload | null {
  try {
    const [dataB64, signature] = token.split(".");
    const data = Buffer.from(dataB64, "base64").toString();
    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
    if (!signature || signature.length !== expectedSignature.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;
    const payload = JSON.parse(data) as SessionPayload;
    if (
      !payload.userId ||
      !payload.email ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function register(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  const gdprConsent = formData.get("gdprConsent") === "on";

  if (!email || !isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!password || password.length < 8 || password.length > 128) {
    return { error: "Password must be between 8 and 128 characters long." };
  }
  if (name.length > 100) return { error: "Name must be 100 characters or fewer." };
  if (!gdprConsent) {
    return { error: "You must consent to data processing to create an account." };
  }

  const accountTypeResult = z.enum(["individual", "self-employed", "business"]).safeParse(
    formData.get("accountType") || "individual",
  );
  if (!accountTypeResult.success) return { error: "Please select a valid account type." };
  const accountType = accountTypeResult.data;
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing?.emailVerified) {
    return { error: "An account with this email already exists." };
  }

  let userId = existing?.id;
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: name || null,
        passwordHash,
        gdprConsent,
        accountType,
      },
    });
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        gdprConsent,
        accountType,
        settings: {
          create: {},
        },
      },
    });
    userId = user.id;
  }

  let deliveryStatus: EmailDeliveryStatus = "sent";
  try {
    deliveryStatus = await sendVerificationEmail({
      userId: userId!,
      email,
      name: name || null,
    });
  } catch (error) {
    console.error("Failed to prepare verification token:", error);
    return {
      error: "We could not complete sign up right now. Please try again in a moment.",
    };
  }
  const deliveryQuery = deliveryStatus === "sent" ? "" : `&delivery=${deliveryStatus}`;
  redirect(`/verify-email?email=${encodeURIComponent(email)}${deliveryQuery}`);
}

export async function login(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !valid) {
    return { error: "Invalid email or password." };
  }
  if (!user.emailVerified) {
    return {
      error: "Please verify your email first using the verification email sent at sign up.",
    };
  }

  // Create session
  const token = signToken({ userId: user.id, email: user.email });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  redirect("/dashboard");
}

export async function verifyEmailToken(token: string) {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return { error: "This verification link is invalid." };
  }

  const tokenHash = hashEmailVerificationToken(normalizedToken);
  const verification = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          emailVerified: true,
        },
      },
    },
  });

  if (!verification) {
    return { error: "This verification link is invalid or has already been used." };
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: verification.userId },
    });
    return { error: "This verification link has expired. Please request a new one." };
  }

  if (verification.user.emailVerified) {
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: verification.userId },
    });
    return { success: true, alreadyVerified: true, email: verification.user.email };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: verification.user.id },
    }),
  ]);

  return { success: true, alreadyVerified: false, email: verification.user.email };
}

export async function resendVerificationEmail(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") || ""));

  if (!email || !isValidEmail(email)) {
    redirect("/verify-email?resent=invalid");
  }

  let status: EmailDeliveryStatus = "sent";
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user && !user.emailVerified) {
      const deliveryStatus = await sendVerificationEmail({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      status = deliveryStatus;
    }
  } catch {
    status = "error";
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}&resent=${status}`);
}

export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") || ""));

  if (!email || !isValidEmail(email)) {
    redirect("/forgot-password?status=invalid");
  }

  let status: EmailDeliveryStatus = "sent";
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      status = await sendPasswordResetEmail({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    }
  } catch (error) {
    console.error("Failed to process password reset request:", error);
    status = "error";
  }

  redirect(`/forgot-password?status=${status}`);
}

export async function resetPasswordWithToken(formData: FormData) {
  const token = String(formData.get("token") || "").trim();
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) {
    redirect("/reset-password?status=invalid");
  }

  const encodedToken = encodeURIComponent(token);
  if (!newPassword || !confirmPassword) {
    redirect(`/reset-password?token=${encodedToken}&status=missing`);
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    redirect(`/reset-password?token=${encodedToken}&status=short`);
  }
  if (newPassword !== confirmPassword) {
    redirect(`/reset-password?token=${encodedToken}&status=mismatch`);
  }

  const tokenHash = hashPasswordResetToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: { id: true },
      },
    },
  });

  if (!resetToken) {
    redirect("/reset-password?status=invalid");
  }

  if (resetToken.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });
    redirect("/reset-password?status=expired");
  }

  try {
    const nextHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user.id },
        data: { passwordHash: nextHash },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.user.id },
      }),
    ]);
  } catch (error) {
    console.error("Failed to reset password:", error);
    redirect(`/reset-password?token=${encodedToken}&status=error`);
  }

  redirect("/reset-password?status=success");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}

export async function updateUserProfileDetails(data: { name: string }) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const nextName = data.name.trim();
  if (nextName.length > 100) return { error: "Name must be 100 characters or fewer." };
  await prisma.user.update({
    where: { id: session.userId },
    data: { name: nextName || null },
  });

  revalidatePath("/dashboard");
  return { success: true, name: nextName };
}

export async function changeUserPassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const currentPassword = data.currentPassword;
  const newPassword = data.newPassword;
  const confirmPassword = data.confirmPassword;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required." };
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return { error: "New password must be between 8 and 128 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation do not match." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "User not found." };

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) return { error: "Current password is incorrect." };

  const nextHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: nextHash },
  });

  return { success: true };
}

export async function getSession(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { settings: true },
  });
  if (!user?.emailVerified) return null;
  return user;
}
