import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  createPresignedUploadUrl,
} from "@/lib/r2";

const requestSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  folder: z.enum(["animals", "blog", "testimonials", "misc"]).default("animals"),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  return profile ? user : null;
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET_NAME ||
    !process.env.R2_PUBLIC_MEDIA_URL
  ) {
    return NextResponse.json(
      { ok: false, error: "R2 is not configured on the server." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid upload request" },
      { status: 400 },
    );
  }

  try {
    const result = await createPresignedUploadUrl({
      folder: parsed.data.folder,
      filename: parsed.data.filename,
      contentType: parsed.data.contentType,
      expiresInSeconds: 60,
    });

    return NextResponse.json({
      ok: true,
      uploadUrl: result.uploadUrl,
      objectKey: result.objectKey,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    console.error("presign failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not create upload URL." },
      { status: 500 },
    );
  }
}
