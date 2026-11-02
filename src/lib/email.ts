import nodemailer from "nodemailer";
import { brand } from "@/lib/brand";

export type InquiryEmailPayload = {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  animalId?: string | null;
  animalName?: string | null;
};

function inquiryRecipient() {
  return (
    process.env.EMAIL_TO?.trim() ||
    process.env.INQUIRY_EMAIL?.trim() ||
    brand.email
  );
}

function smtpUser() {
  return (
    process.env.SMTP_USER?.trim() ||
    process.env.EMAIL_TO?.trim() ||
    brand.email
  );
}

function smtpPass() {
  // Gmail app passwords are often pasted with spaces; strip them.
  return (process.env.SMTP_PASS || "").replace(/\s+/g, "").trim();
}

function buildBody(payload: InquiryEmailPayload) {
  return [
    `New inquiry from the Mini Cow Farm website`,
    ``,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "(not provided)"}`,
    `Source: ${payload.source || "website"}`,
    payload.animalName ? `Animal: ${payload.animalName}` : null,
    payload.animalId ? `Animal ID: ${payload.animalId}` : null,
    ``,
    `Message:`,
    payload.message || "(no message)",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

async function sendWithResend(
  to: string,
  subject: string,
  text: string,
  replyTo: string,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  if (!apiKey) return { sent: false, error: "no api key" };

  const from =
    process.env.EMAIL_FROM?.trim() || "Mini Cow Farm <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend failed:", res.status, body);
    return { sent: false, error: `Resend ${res.status}` };
  }

  return { sent: true };
}

/** Gmail SMTP via app password (nodemailer; externalized from the webpack bundle). */
async function sendWithSmtp(
  to: string,
  subject: string,
  text: string,
  replyTo: string,
): Promise<{ sent: boolean; error?: string }> {
  const user = smtpUser();
  const pass = smtpPass();
  if (!pass) return { sent: false, error: "no smtp pass" };

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const from = process.env.EMAIL_FROM?.trim() || `Mini Cow Farm <${user}>`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
    });

    await transporter.sendMail({
      from,
      to,
      replyTo,
      subject,
      text,
    });
    console.info("[email] inquiry emailed via SMTP to", to);
    return { sent: true };
  } catch (error) {
    console.error("[email] SMTP failed:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "smtp error",
    };
  }
}

/**
 * FormSubmit fallback (origin-pinned). Prefer SMTP when SMTP_PASS is set.
 */
const FORMSUBMIT_ACTIVATED_ORIGIN = "http://localhost:3000";

async function sendWithFormSubmit(
  to: string,
  subject: string,
  payload: InquiryEmailPayload,
  text: string,
): Promise<{ sent: boolean; error?: string }> {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: FORMSUBMIT_ACTIVATED_ORIGIN,
      Referer: `${FORMSUBMIT_ACTIVATED_ORIGIN}/contact-us`,
      "User-Agent": "Mozilla/5.0 MiniCowFarmNotifier/1.0",
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "",
      message: text,
      _subject: subject,
      _template: "table",
      _captcha: "false",
      _replyto: payload.email,
    }),
  });

  const body = await res.text();
  let parsed: { success?: string | boolean; message?: string } = {};
  try {
    parsed = JSON.parse(body) as typeof parsed;
  } catch {
    parsed = {};
  }

  if (String(parsed.success) === "false" && /activation/i.test(parsed.message || "")) {
    console.warn("[email] FormSubmit activation required for", to, parsed.message);
    return { sent: false, error: "FormSubmit activation required" };
  }

  if (!res.ok || String(parsed.success) !== "true") {
    console.error("[email] FormSubmit failed:", res.status, body);
    return { sent: false, error: parsed.message || `FormSubmit ${res.status}` };
  }

  return { sent: true };
}

/**
 * Notify the farm inbox about a new inquiry.
 * Order: Gmail SMTP → Resend → FormSubmit.
 */
export async function sendInquiryNotification(
  payload: InquiryEmailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const to = inquiryRecipient();
  const subject = payload.animalName
    ? `Inquiry about ${payload.animalName} from ${payload.name}`
    : `New website inquiry from ${payload.name}`;
  const text = buildBody(payload);

  try {
    if (smtpPass()) {
      const result = await sendWithSmtp(to, subject, text, payload.email);
      if (result.sent) return result;
      console.warn("[email] SMTP failed, trying next provider:", result.error);
    }

    if (process.env.EMAIL_API_KEY?.trim()) {
      const result = await sendWithResend(to, subject, text, payload.email);
      if (result.sent) return result;
      console.warn("[email] Resend failed, falling back to FormSubmit:", result.error);
    }

    const result = await sendWithFormSubmit(to, subject, payload, text);
    if (result.sent) {
      console.info("[email] inquiry emailed via FormSubmit to", to);
    }
    return result;
  } catch (error) {
    console.error("[email] send failed:", error);
    console.info("[email] inquiry preview:\n", text);
    return { sent: false, error: "network error" };
  }
}
