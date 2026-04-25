import nodemailer from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};
type SendEmailResult = {
  status: "sent" | "skipped";
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !portRaw || !user || !pass || !from) {
    throw new Error(
      "Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM."
    );
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port)) {
    throw new Error("SMTP_PORT must be a valid number.");
  }

  return { host, port, user, pass, from, secure };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const hasSmtpConfig =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS) &&
    Boolean(process.env.EMAIL_FROM);

  if (!hasSmtpConfig) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM."
      );
    }

    console.warn("[email] SMTP is not configured. Skipping email send in non-production.");
    console.info(`[email preview] To: ${input.to}\nSubject: ${input.subject}\n\n${input.text}`);
    return { status: "skipped" };
  }

  const smtp = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  await transporter.sendMail({
    from: smtp.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { status: "sent" };
}
