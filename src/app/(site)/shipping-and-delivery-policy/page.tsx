import type { Metadata } from "next";
import Link from "next/link";
import { getPolicyPage, getSiteSettings, settingsToBrand } from "@/lib/data/content";
import { simpleMarkdownToHtml } from "@/lib/markdown";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPolicyPage("shipping-and-delivery-policy");
  return {
    title: page?.seo_title ?? "Shipping & Delivery Policy",
    description:
      page?.seo_description ??
      "Delivery coverage, farm pickup, transport process, and receiving instructions for Mini Cow Farm.",
    alternates: { canonical: "/shipping-and-delivery-policy" },
  };
}

export default async function ShippingPolicyPage() {
  const [page, settings] = await Promise.all([
    getPolicyPage("shipping-and-delivery-policy"),
    getSiteSettings(),
  ]);
  const site = settingsToBrand(settings);

  if (!page) {
    return (
      <div className="container-site py-16">
        <h1 className="font-display text-4xl font-bold text-forest">Shipping & Delivery Policy</h1>
        <p className="mt-4">Content is not configured yet. Please contact {site.email}.</p>
      </div>
    );
  }

  return (
    <div className="bg-cream py-12 md:py-16">
      <article className="container-site max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-forest md:text-5xl">{page.title}</h1>
        <p className="mt-4 text-sm text-muted">
          Configurable delivery terms. Update service areas, fees, and timelines in Admin → Policies.
        </p>
        <div
          className="prose-policy mt-10"
          dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(page.body) }}
        />
        <p className="mt-10 text-sm">
          Need a transport quote?{" "}
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
