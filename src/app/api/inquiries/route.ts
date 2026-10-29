import { NextResponse } from "next/server";
import { z } from "zod";
import { inquirySchema } from "@/lib/validations/inquiry";
import { createClient } from "@/lib/supabase/server";
import { hashIp, rateLimit } from "@/lib/rate-limit";
import { demoAnimals } from "@/lib/data/demo";

const bodySchema = inquirySchema.extend({
  source: z.string().trim().max(60).optional(),
  message: z.string().trim().max(4000).optional(),
  website: z.string().optional(),
});

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limited = rateLimit(`inquiry:${ip}`, 6, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Honeypot tripped
  if (data.website && data.website.length > 0) {
    return NextResponse.json({
      ok: true,
      message: "Thanks, we received your inquiry and will respond soon.",
    });
  }

  const ipHash = await hashIp(ip);
  const payload = {
    animal_id: data.animalId || null,
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message || "",
    source: data.source || "website",
    ip_hash: ipHash,
    status: "new" as const,
  };

  if (!isSupabaseConfigured()) {
    // Local/demo mode: accept without persistence so UI can be tested.
    const animalOk =
      !payload.animal_id ||
      demoAnimals.some((a) => a.id === payload.animal_id);
    if (!animalOk) {
      return NextResponse.json({ ok: false, error: "Unknown animal." }, { status: 400 });
    }
    console.info("[demo] inquiry accepted (not persisted, configure Supabase):", {
      name: payload.name,
      email: payload.email,
      animal_id: payload.animal_id,
    });
    return NextResponse.json({
      ok: true,
      message:
        "Thanks, we received your inquiry. (Demo mode: not saved to a database until Supabase is configured.)",
    });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert(payload);
    if (error) {
      console.error("inquiry insert failed:", error);
      return NextResponse.json(
        { ok: false, error: "Unable to save your inquiry. Please try again or email us directly." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Thanks, we received your inquiry and will respond soon.",
    });
  } catch (error) {
    console.error("inquiry route error:", error);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 },
    );
  }
}
