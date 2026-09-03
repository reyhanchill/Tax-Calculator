"use server";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export type EarlyAccessInterest = "general" | "ai";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toInterestValue(interest: EarlyAccessInterest): string {
  return interest === "ai" ? "ai-early-access" : "general-early-access";
}

type NewsletterDeliveryStatus = "sent" | "skipped" | "error";

async function sendEarlyAccessConfirmationEmail(input: {
  email: string;
  interest: string;
}): Promise<NewsletterDeliveryStatus> {
  const isAi = input.interest === "ai-early-access";
  const subject = isAi
    ? "You are on the TaxFlow AI Early Access list"
    : "You are on the TaxFlow Early Access list";
  const heading = isAi ? "AI Early Access" : "Early Access";
  const text = `Thanks for joining the TaxFlow ${heading} list.

You are now signed up with ${input.email}.
We will email you with updates and launch access details.`;
  const html = `
    <p>Thanks for joining the TaxFlow <strong>${heading}</strong> list.</p>
    <p>You are now signed up with <strong>${input.email}</strong>.</p>
    <p>We will email you with updates and launch access details.</p>
  `;

  try {
    const delivery = await sendEmail({
      to: input.email,
      subject,
      text,
      html,
    });
    return delivery.status;
  } catch (error) {
    console.error("Failed to send early access confirmation email:", error);
    return "error";
  }
}

export async function subscribeToEarlyAccess(input: {
  email: string;
  interest: EarlyAccessInterest;
}) {
  const inputResult = z.object({
    email: z.string().trim().max(254),
    interest: z.enum(["general", "ai"]),
  }).safeParse(input);
  if (!inputResult.success) return { error: "Please enter valid signup details." };
  input = inputResult.data;
  const email = input.email.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const interest = toInterestValue(input.interest);
  const existing = await prisma.newsletterSignup.findUnique({
    where: {
      email_interest: {
        email,
        interest,
      },
    },
  });

  if (existing) {
    const deliveryStatus = await sendEarlyAccessConfirmationEmail({ email, interest });

    if (deliveryStatus === "sent") {
      return {
        success: true,
        alreadySubscribed: true,
        message: "You are already on this early access list — we sent another confirmation email.",
      };
    }

    if (deliveryStatus === "error") {
      return {
        success: true,
        alreadySubscribed: true,
        message: "You are already on this early access list, but we could not send a confirmation email right now.",
      };
    }
    return {
      success: true,
      alreadySubscribed: true,
      message: "You are already on this early access list.",
    };
  }

  try {
    await prisma.newsletterSignup.create({
      data: {
        email,
        interest,
      },
    });
  } catch (error) {
    // Two concurrent submissions for the same email+interest can both pass
    // the findUnique check above; treat the resulting unique-constraint
    // violation as "already subscribed" instead of a hard failure.
    const isDuplicate =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    if (!isDuplicate) {
      console.error("Failed to save newsletter signup:", error);
      return { error: "Something went wrong. Please try again." };
    }
    return {
      success: true,
      alreadySubscribed: true,
      message: "You are already on this early access list.",
    };
  }

  const deliveryStatus = await sendEarlyAccessConfirmationEmail({ email, interest });

  if (deliveryStatus === "sent") {
    return {
      success: true,
      alreadySubscribed: false,
      message: "Thanks! You are on the list — we sent a confirmation email.",
    };
  }

  if (deliveryStatus === "error") {
    return {
      success: true,
      alreadySubscribed: false,
      message: "Thanks! You are on the list — we could not send a confirmation email right now.",
    };
  }

  return {
    success: true,
    alreadySubscribed: false,
    message: "Thanks! You are on the list — we will email you at launch.",
  };
}
