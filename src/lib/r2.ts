import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getR2Client() {
  const accountId = requireEnv("CLOUDFLARE_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export function publicMediaUrl(objectKey: string): string {
  const base = process.env.R2_PUBLIC_MEDIA_URL;
  if (!base) {
    throw new Error("Missing R2_PUBLIC_MEDIA_URL");
  }
  return `${base.replace(/\/$/, "")}/${objectKey}`;
}

export function buildObjectKey(folder: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
  const ext = safe.includes(".") ? safe.slice(safe.lastIndexOf(".")) : "";
  return `${folder}/${randomUUID()}${ext}`;
}

export async function createPresignedUploadUrl(params: {
  folder: string;
  filename: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  if (!ALLOWED_IMAGE_TYPES.includes(params.contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Unsupported file type");
  }

  const objectKey = buildObjectKey(params.folder, params.filename);
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: params.expiresInSeconds ?? 60,
  });

  return {
    uploadUrl,
    objectKey,
    publicUrl: publicMediaUrl(objectKey),
  };
}

export async function deleteObject(objectKey: string) {
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME");
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  );
}
