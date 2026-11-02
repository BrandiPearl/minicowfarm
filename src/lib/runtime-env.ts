import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read env vars at runtime (Worker secrets / .env.local).
 *
 * Next.js webpack inlines static `process.env.FOO` at build time. On Cloudflare
 * Workers Builds that means secrets set only as runtime vars become "" forever.
 * Dynamic access + Cloudflare context avoids that.
 */
export function runtimeEnv(name: string): string {
  try {
    const value = getCloudflareContext().env?.[name as keyof CloudflareEnv];
    if (value != null && String(value).length > 0) {
      return String(value);
    }
  } catch {
    // Not running inside a Cloudflare request context (e.g. local scripts).
  }

  const value = process.env[name];
  return value == null ? "" : String(value);
}
