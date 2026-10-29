import type { Metadata } from "next";
import Link from "next/link";
import { getPolicyPage, getSiteSettings, settingsToBrand } from "@/lib/data/content";
import { simpleMarkdownToHtml } from "@/lib/markdown";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPolicyPage("health-guarantee");
  return {
    title: page?.seo_title ?? "Health Guarantee",
    description:
      page?.seo_description ??
      "Health coverage terms, exclusions, and claim process for Mini Cow Farm purchases.",
    alternates: { canonical: "/health-guarantee" },
  };
}

export default async function HealthGuaranteePage() {
  const [page, settings] = await Promise.all([
    getPolicyPage("health-guarantee"),
    getSiteSettings(),
  ]);
  const site = settingsToBrand(settings);

  if (!page) {
    return (
      <div className="container-site py-16">
        <h1 className="font-display text-4xl font-bold text-forest">Health Guarantee</h1>
        <p className="mt-4">Content is not configured yet. Please contact {site.email}.</p>
      </div>
    );
  }

  return (
    <div className="bg-cream py-12 md:py-16">
      <article className="container-site max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-forest md:text-5xl">{page.title}</h1>
        <p className="mt-4 text-sm text-muted">
          Configurable policy content. Edit in Admin → Policies. This is not a substitute for your
          finalized written sales agreement.
        </p>
        <div
          className="prose-policy mt-10"
          dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(page.body) }}
        />
        <p className="mt-10 text-sm">
          Questions?{" "}
          <Link href="/contact-us" className="underline">
            Contact us
          </Link>{" "}
          or email{" "}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>
          .
        </p>
      </article>
    </div>
  );
}
