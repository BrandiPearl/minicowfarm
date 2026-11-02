import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read env vars at runtime (Worker secrets / .env.local).
 *
 * Next.js webpack inlines static `process.env.FOO` at build time.
 * Cloudflare's `env` is a binding proxy — do NOT use hasOwnProperty on it.
 */
export function runtimeEnv(name: string): string {
  try {
    const env = getCloudflareContext().env as Record<string, unknown> | undefined;
    // Direct access — Cloudflare env is a proxy; hasOwnProperty is unreliable.
    const fromCf = env?.[name];
    if (fromCf != null) {
      const text = String(fromCf).trim();
      if (text.length > 0) return text;
    }
  } catch {
    // Not inside a Cloudflare request context.
  }

  // Dynamic key so Next cannot inline at build time.
  const fromProcess = process.env[name];
  if (fromProcess != null) {
    const text = String(fromProcess).trim();
    if (text.length > 0) return text;
  }

  return "";
}
