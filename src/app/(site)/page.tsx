import Image from "next/image";
import Link from "next/link";
import { Check, Heart, Shield, Truck, Leaf, Users } from "lucide-react";
import { AnimalCard } from "@/components/animals/AnimalCard";
import { FaqSection } from "@/components/home/FaqSection";
import { TestimonialGrid } from "@/components/home/TestimonialGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { getAnimals } from "@/lib/data/animals";
import { getSiteSettings, getTestimonials, settingsToBrand } from "@/lib/data/content";
import { homeFaqs } from "@/lib/seo/faqs";
import { faqPageSchema } from "@/lib/seo/schema";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Mini Highland Cows for Sale | Halter-Trained Calves | Mini Cow Farm",
  },
  description:
    "Browse miniature Highland cows for sale. Halter-trained calves raised for homestead life, with published health policy and transport quotes by location.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Mini Highland Cows for Sale | Mini Cow Farm",
    description:
      "Available miniature Highland calves for small farms and homesteads. Inquire for pricing and delivery.",
    url: "/",
  },
};

const breedFeatures = [
  {
    title: "Perfect Size for Small Acreage",
    body: "Mini Highlands stand roughly 36-42 inches at the shoulder and require far less land than standard cattle, ideal for 1-5 acre homesteads and small farms.",
    icon: Leaf,
  },
  {
    title: "Exceptionally Gentle Temperament",
    body: "Known for their calm, friendly nature, mini Highlands are easier to handle for first-time owners, families, and solo farmers.",
    icon: Heart,
  },
  {
    title: "Hardy in Any Climate",
    body: "Their thick double coat makes them cold-hardy and adaptable. They thrive in a wide range of climates with sensible shelter.",
    icon: Shield,
  },
  {
    title: "Low-Input, High-Reward",
    body: "Efficient grazers that do well on pasture. They’re practical on fencing, relatively low-maintenance, and popular on small acreage.",
    icon: Users,
  },
];

const whyUs = [
  {
    title: "Premium Genetics",
    body: "We select for temperament, conformation, and true miniature size. Bloodline notes and breeding priorities are documented per animal when available.",
  },
  {
    title: "Health Documentation",
    body: "Animals leave with the health records and paperwork we can provide for that listing. Review our Health Guarantee page for published coverage terms.",
  },
  {
    title: "Safe Nationwide Transport",
    body: "We coordinate with professional livestock haulers when routes allow. You’ll receive a transport quote and timeline before booking.",
  },
  {
    title: "Ongoing Breeder Support",
    body: "Questions after purchase? We’re available by phone or email to help with care, nutrition, and practical herd management.",
  },
];

const steps = [
  {
    title: "Browse & Inquire",
    body: "Browse available animals and submit an inquiry. We aim to respond within 24 hours with honest answers and current availability.",
  },
  {
    title: "Reserve Your Animal",
    body: "A deposit holds your selection while we finalize health records, paperwork, and a clear sales agreement before remaining balances are due.",
  },
  {
    title: "We Arrange Transport",
    body: "We coordinate logistics with vetted livestock haulers. You’ll receive a delivery timeline and updates while in transit.",
  },
  {
    title: "Welcome to the Herd",
    body: "Your animal arrives ready to settle in. We follow up after delivery and remain available when questions come up.",
  },
];

export default async function HomePage() {
  const [featured, testimonials, settings] = await Promise.all([
    getAnimals({ species: "mini_cow", featured: true, status: ["available", "reserved"] }),
    getTestimonials({ featuredOnly: true }),
    getSiteSettings(),
  ]);
  const site = settingsToBrand(settings);
  const featuredList = featured.slice(0, 6);

  return (
    <>
      <JsonLd data={faqPageSchema(homeFaqs)} />
      {/* Hero, full-bleed centered, matching reference structure */}
      <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden text-cream md:min-h-[600px]">
        <Image
          src="/hero-cow.avif"
          alt="Miniature Scottish Highland cow in a grassy pasture"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#172E18]/[0.87]" aria-hidden />
        <div className="container-site relative z-10 py-10 text-center md:py-16">
          <h1 className="mx-auto max-w-5xl font-display text-[2.6rem] font-bold leading-[1.1] tracking-wide text-white md:text-[4.1rem]">
            Miniature Highland Cows for Sale: Halter-Trained, Vet-Certified &amp; Ready to Ship
          </h1>
          <p className="mx-auto mt-0 max-w-3xl px-1 pt-7 font-sans text-base leading-relaxed text-white md:pt-8 md:text-[1.2rem]">
            We raise heritage-quality miniature Scottish Highland cattle, handled from an early
            age, prepared for homestead life, and backed by our published health policy. Every calf
            leaves our farm healthy, socialized, and ready for life on your homestead.
          </p>
          <div className="mt-8 flex flex-row flex-wrap items-center justify-center gap-3 md:mt-10 md:gap-6">
            <Button
              href="/available-mini-cows"
              variant="primary"
              className="min-w-0 flex-1 px-3 py-3 text-xs sm:flex-none sm:min-w-[160px] sm:text-sm"
            >
              Available Mini Cows
            </Button>
            <Button
              href="/available-donkeys"
              variant="secondary"
              className="min-w-0 flex-1 px-3 py-3 text-xs sm:flex-none sm:min-w-[160px] sm:text-sm"
            >
              Available Donkeys
            </Button>
            <Button
              href="/contact-us"
              variant="outlineLight"
              className="min-w-0 flex-1 px-3 py-3 text-xs sm:flex-none sm:min-w-[160px] sm:text-sm"
            >
              Talk To A Breeder
            </Button>
          </div>
        </div>
      </section>

      {/* Featured animals */}
      <section className="bg-white py-8 md:py-10">
        <div className="container-site">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-[2.2rem] font-bold leading-tight text-forest md:text-[48px] md:leading-[1.15]">
              Available Miniature Highland Calves For Sale
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base text-muted">
              Whether you’re a first-time buyer or adding to an established herd, our mini Highlands
              are selected for calm temperament and practical size. Transport is quoted separately
              based on your location.
            </p>
          </div>

          {featuredList.length === 0 ? (
            <p className="mt-10 text-center text-muted">
              No featured calves right now.{" "}
              <Link href="/available-mini-cows" className="underline">
                Browse the full catalog
              </Link>
              .
            </p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredList.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-forest">
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-forest-bright" /> Health records when available
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-forest-bright" /> Published health policy
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-forest-bright" /> Professional transport coordination
            </span>
          </div>

          <div className="mt-8 text-center">
            <Button href="/available-mini-cows" variant="primary">
              See All Available Mini Cows
            </Button>
          </div>
        </div>
      </section>

      {/* Breed info */}
      <section className="border-t border-border/60 bg-cream py-16 md:py-20">
        <div className="container-site">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-bold text-forest md:text-5xl">
              What Are Miniature Highland Cows?
            </h2>
            <p className="mt-4 text-ink/80">
              Miniature Highland cattle are a selectively bred, smaller version of the ancient
              Scottish Highland breed, purpose-built for small acreage, hobby farms, and
              homestead life. They carry the iconic long coat and gentle temperament of their
              full-size counterparts in a more manageable frame.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {breedFeatures.map((item) => (
              <div key={item.title}>
                <item.icon className="mb-3 h-7 w-7 text-forest-bright" aria-hidden />
                <h3 className="text-lg font-semibold text-forest">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why buyers choose us */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-site">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-bold text-forest md:text-5xl">
              Why Buyers Choose {site.name}
            </h2>
            <p className="mt-4 text-ink/80">
              We raise and stand behind every animal we sell. From selection to post-delivery
              support, our process is built around a healthy, well-adjusted animal that thrives
              on your property.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item) => (
              <div key={item.title}>
                <h3 className="text-lg font-semibold text-forest">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-forest py-16 text-cream md:py-20">
        <div className="container-site">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              How It Works: From Our Farm to Yours
            </h2>
            <p className="mt-4 text-cream/85">
              We handle paperwork and transport coordination so you don’t have to guess the next
              step.
            </p>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="border border-white/15 bg-white/5 p-6">
                <span className="font-display text-4xl font-bold text-gold">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/85">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FaqSection />

      {/* Testimonials */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-site">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-bold text-forest md:text-5xl">
              What Buyers Are Saying
            </h2>
            <p className="mt-4 text-sm text-muted">
              Real feedback from buyers who brought a mini Highland home.
            </p>
          </div>
          <div className="mt-12">
            <TestimonialGrid testimonials={testimonials.slice(0, 3)} />
          </div>
          <div className="mt-8 text-center">
            <Button href="/testimonials" variant="outline">
              Read More Testimonials
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-cream py-16 md:py-20">
        <div className="container-site max-w-3xl text-center">
          <Truck className="mx-auto mb-4 h-10 w-10 text-forest-bright" aria-hidden />
          <h2 className="font-display text-4xl font-bold text-forest md:text-5xl">
            Ready to Bring a Mini Highland Home?
          </h2>
          <p className="mt-4 text-ink/80">
            Getting started is simple. Tell us a little about your property and what you’re
            looking for. We aim to respond within 24 hours with current availability and honest
            answers. Zero pressure.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/contact-us" variant="primary">
              Contact Us
            </Button>
            <Button href="/available-mini-cows" variant="secondary">
              Browse Calves
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted">
            {site.email} · {site.phone}
          </p>
        </div>
      </section>
    </>
  );
}
