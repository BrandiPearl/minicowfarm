import { brand } from "@/lib/brand";
import { runtimeEnv } from "@/lib/runtime-env";

export type InquiryEmailPayload = {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  animalId?: string | null;
  animalName?: string | null;
};

export type NotifyResult = {
  sent: boolean;
  error?: string;
  via?: string;
  resendConfigured?: boolean;
};

function inquiryRecipient() {
  return (
    runtimeEnv("EMAIL_TO").trim() ||
    runtimeEnv("INQUIRY_EMAIL").trim() ||
    brand.email
  );
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
  const apiKey = runtimeEnv("EMAIL_API_KEY").trim();
  if (!apiKey) return { sent: false, error: "no api key" };

  const from =
    runtimeEnv("EMAIL_FROM").trim() || "Mini Cow Farm <onboarding@resend.dev>";

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

  const body = await res.text();
  if (!res.ok) {
    console.error("[email] Resend failed:", res.status, body);
    let message = `Resend ${res.status}`;
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      /* keep status message */
    }
    return { sent: false, error: message };
  }

  console.info("[email] inquiry emailed via Resend to", to);
  return { sent: true };
}

/**
 * Notify the farm inbox about a new inquiry via Resend (HTTPS — works on Cloudflare Workers).
 */
export async function sendInquiryNotification(
  payload: InquiryEmailPayload,
): Promise<NotifyResult> {
  const to = inquiryRecipient();
  const subject = payload.animalName
    ? `Inquiry about ${payload.animalName} from ${payload.name}`
    : `New website inquiry from ${payload.name}`;
  const text = buildBody(payload);
  const apiKey = runtimeEnv("EMAIL_API_KEY");
  const resendConfigured = apiKey.length > 0;

  try {
    if (!resendConfigured) {
      console.warn("[email] EMAIL_API_KEY is not set");
      return {
        sent: false,
        error: "EMAIL_API_KEY is not set",
        via: "none",
        resendConfigured,
      };
    }

    const result = await sendWithResend(to, subject, text, payload.email);
    return { ...result, via: "resend", resendConfigured };
  } catch (error) {
    console.error("[email] send failed:", error);
    console.info("[email] inquiry preview:\n", text);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "network error",
      via: "resend",
      resendConfigured,
    };
  }
}
