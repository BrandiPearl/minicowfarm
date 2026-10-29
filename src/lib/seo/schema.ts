import { brand } from "@/lib/brand";
import type { FaqItem } from "@/lib/seo/faqs";
import type { AnimalWithImages } from "@/types/database";
import { primaryImage } from "@/lib/animals/helpers";
import { cleanAgeDescription, cleanColor } from "@/lib/animals/display";

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${brand.urls.site}/#organization`,
    name: brand.name,
    legalName: brand.legalName,
    url: brand.urls.site,
    email: brand.email,
    telephone: brand.phone,
    logo: `${brand.urls.site}/logo.png`,
    image: `${brand.urls.site}/logo.png`,
    description: brand.tagline,
    areaServed: "US",
    sameAs: [brand.social.facebook, brand.social.instagram, brand.social.tiktok].filter(Boolean),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${brand.urls.site}/#website`,
    name: brand.name,
    url: brand.urls.site,
    description: brand.tagline,
    publisher: { "@id": `${brand.urls.site}/#organization` },
  };
}

export function siteGraphSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema()],
  };
}

export function faqPageSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function animalProductSchema(animal: AnimalWithImages) {
  const image = primaryImage(animal);
  const url = `${brand.urls.site}/animals/${animal.slug}`;
  const age = cleanAgeDescription(animal.age_description, animal.name);
  const color = cleanColor(animal.color, animal.name);
  const availability =
    animal.status === "available"
      ? "https://schema.org/InStock"
      : animal.status === "reserved"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/OutOfStock";

  return {
    "@type": "Product",
    name: `${animal.name} miniature ${animal.species === "donkey" ? "donkey" : "Highland cow"}`,
    description: animal.description.slice(0, 5000),
    sku: animal.slug,
    url,
    image: image ? [image.url] : undefined,
    brand: { "@type": "Brand", name: brand.name },
    category:
      animal.species === "donkey" ? "Miniature Donkeys" : "Miniature Highland Cattle",
    color: color ?? undefined,
    additionalProperty: [
      age
        ? { "@type": "PropertyValue", name: "Age", value: age }
        : null,
      animal.gender
        ? { "@type": "PropertyValue", name: "Gender", value: animal.gender }
        : null,
    ].filter(Boolean),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: animal.currency || "USD",
      price: animal.price != null ? Number(animal.price).toFixed(2) : undefined,
      availability,
      seller: { "@type": "Organization", name: brand.name },
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${brand.urls.site}${item.path}`,
    })),
  };
}
