import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getSiteSettings, settingsToBrand } from "@/lib/data/content";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Mini Cow Farm",
  description:
    "Contact Mini Cow Farm about available mini Highland cows, donkeys, transport quotes, or care questions. We aim to respond within 24 hours.",
  alternates: { canonical: "/contact-us" },
  openGraph: {
    title: "Contact Mini Cow Farm",
    url: "/contact-us",
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const site = settingsToBrand(settings);

  return (
    <div className="bg-cream py-12 md:py-16">
      <div className="container-site grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-forest-bright">
            Always here to help you
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-forest md:text-5xl">
            Write a Message
          </h1>
          <p className="mt-4 max-w-md text-ink/80">
            Tell us about your property and what you&apos;re looking for. We aim to respond within
            24 hours. No account required.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-forest-bright" aria-hidden />
              <a href={`mailto:${site.email}`} className="hover:underline">
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-forest-bright" aria-hidden />
              <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                {site.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-forest-bright" aria-hidden />
              <span>
                {site.location}
                {site.addressLine ? (
                  <>
                    <br />
                    <span className="text-muted">{site.addressLine}</span>
                  </>
                ) : null}
              </span>
            </li>
          </ul>
        </div>

        <div className="border border-forest/15 bg-white p-6 md:p-8">
          <InquiryForm source="contact" />
        </div>
      </div>
    </div>
  );
}
