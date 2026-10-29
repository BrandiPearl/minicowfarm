import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteSettings, settingsToBrand } from "@/lib/data/content";
import { siteGraphSchema } from "@/lib/seo/schema";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const site = settingsToBrand(settings);

  return (
    <>
      <JsonLd data={siteGraphSchema()} />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header email={site.email} />
      <main id="content">{children}</main>
      <Footer email={site.email} phone={site.phone} location={site.location} />
    </>
  );
}
