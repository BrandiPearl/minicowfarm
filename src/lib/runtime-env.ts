import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read env vars at runtime (Worker secrets / .env.local).
 *
 * Next.js webpack inlines static `process.env.FOO` at build time. On Cloudflare
 * Workers Builds that means secrets set only as runtime vars become "" forever.
 * Dynamic access + Cloudflare context avoids that.
 *
 * Also: Cloudflare deploys without `--keep-vars` can wipe dashboard secrets.
 */
export function runtimeEnv(name: string): string {
  const seen: unknown[] = [];

  try {
    const env = getCloudflareContext().env as Record<string, unknown> | undefined;
    if (env && Object.prototype.hasOwnProperty.call(env, name)) {
      seen.push(env[name]);
    }
  } catch {
    // Not inside a Cloudflare request context.
  }

  // Dynamic key so Next cannot inline at build time.
  seen.push(process.env[name]);

  for (const value of seen) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text.length > 0) return text;
  }

  return "";
}
