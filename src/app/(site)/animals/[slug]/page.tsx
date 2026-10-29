import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { AnimalCard } from "@/components/animals/AnimalCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAnimalBySlug, getAnimals } from "@/lib/data/animals";
import { cleanAgeDescription, cleanColor } from "@/lib/animals/display";
import { primaryImage } from "@/lib/animals/helpers";
import { formatPrice, genderLabel, statusLabel } from "@/lib/format";
import { brand } from "@/lib/brand";
import { animalProductSchema, breadcrumbSchema } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const animal = await getAnimalBySlug(slug);
  if (!animal) return { title: "Animal Not Found" };

  const image = primaryImage(animal);
  const kind = animal.species === "donkey" ? "miniature donkey" : "mini Highland cow";
  const price = formatPrice(animal.price, animal.currency);
  const description =
    animal.description.replace(/\s+/g, " ").trim().slice(0, 155) ||
    `${animal.name} is a ${kind} listed by ${brand.name}.`;

  return {
    title: `${animal.name} ${kind} for sale${price !== "Contact for price" ? ` (${price})` : ""}`,
    description,
    alternates: { canonical: `/animals/${animal.slug}` },
    openGraph: {
      title: `${animal.name} | ${brand.name}`,
      description,
      images: image ? [{ url: image.url, alt: image.alt_text || animal.name }] : undefined,
      type: "website",
      url: `/animals/${animal.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${animal.name} | ${brand.name}`,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

export default async function AnimalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const animal = await getAnimalBySlug(slug);
  if (!animal) notFound();

  const related = (await getAnimals({ species: animal.species }))
    .filter((a) => a.id !== animal.id && a.status === "available")
    .slice(0, 3);

  const images = animal.animal_images.length
    ? animal.animal_images
    : [];
  const main = primaryImage(animal);
  const catalogHref =
    animal.species === "donkey" ? "/available-donkeys" : "/available-mini-cows";
  const catalogLabel =
    animal.species === "donkey" ? "Available Donkeys" : "Available Mini Cows";
  const age = cleanAgeDescription(animal.age_description, animal.name);
  const color = cleanColor(animal.color, animal.name);

  return (
    <div className="bg-cream py-12 md:py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            animalProductSchema(animal),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: catalogLabel, path: catalogHref },
              { name: animal.name, path: `/animals/${animal.slug}` },
            ]),
          ],
        }}
      />
      <div className="container-site">
        <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-forest">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href={catalogHref} className="hover:text-forest">
            {catalogLabel}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-forest">{animal.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden border border-border bg-cream-dark">
              {main ? (
                <Image
                  src={main.url}
                  alt={main.alt_text || animal.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted">
                  Photo coming soon
                </div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden border border-border">
                    <Image
                      src={img.url}
                      alt={img.alt_text || `${animal.name} photo`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-forest-bright">
              {statusLabel(animal.status)}
            </p>
            <h1 className="mt-2 font-display text-5xl font-bold text-forest">{animal.name}</h1>
            <p className="mt-3 text-2xl font-semibold text-forest">
              {formatPrice(animal.price, animal.currency)}
              {animal.compare_at_price != null && animal.price != null ? (
                <span className="ml-3 text-lg font-normal text-muted line-through">
                  {formatPrice(animal.compare_at_price, animal.currency)}
                </span>
              ) : null}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3 border border-border bg-white p-5 text-sm">
              <div>
                <dt className="text-muted">Gender</dt>
                <dd className="font-medium">{genderLabel(animal.gender, animal.species)}</dd>
              </div>
              {age ? (
                <div>
                  <dt className="text-muted">Age</dt>
                  <dd className="font-medium">{age}</dd>
                </div>
              ) : null}
              {color ? (
                <div className="col-span-2">
                  <dt className="text-muted">Color</dt>
                  <dd className="font-medium">{color}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-6 space-y-4 text-ink/85">
              <p className="leading-relaxed whitespace-pre-line">{animal.description}</p>
              {animal.health_notes ? (
                <div className="border border-border bg-white p-4 text-sm">
                  <h2 className="font-semibold text-forest">Health notes</h2>
                  <p className="mt-2 whitespace-pre-line">{animal.health_notes}</p>
                </div>
              ) : null}
              <p className="text-sm">
                See our{" "}
                <Link href="/health-guarantee" className="underline">
                  Health Guarantee
                </Link>{" "}
                and{" "}
                <Link href="/shipping-and-delivery-policy" className="underline">
                  Shipping & Delivery Policy
                </Link>{" "}
                for current terms.
              </p>
            </div>

            {animal.status === "available" ? (
              <div id="inquire" className="mt-10 scroll-mt-24 border border-border bg-white p-6">
                <h2 className="font-display text-3xl font-bold text-forest">
                  Inquire about {animal.name}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  No account required. We’ll follow up by email or phone.
                </p>
                <div className="mt-6">
                  <InquiryForm animalId={animal.id} animalName={animal.name} source="animal-detail" />
                </div>
              </div>
            ) : (
              <p className="mt-8 rounded border border-border bg-white p-4 text-sm">
                This animal is marked as {statusLabel(animal.status).toLowerCase()}.{" "}
                <Link href="/contact-us" className="underline">
                  Contact us
                </Link>{" "}
                about similar listings.
              </p>
            )}
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold text-forest">You may also like</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <AnimalCard key={a.id} animal={a} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
