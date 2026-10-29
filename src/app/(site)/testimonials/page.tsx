import type { Metadata } from "next";
import { TestimonialGrid } from "@/components/home/TestimonialGrid";
import { getTestimonials } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Buyer Testimonials",
  description:
    "Read buyer testimonials about Mini Cow Farm miniature Highland cattle and donkeys. Only authentic, approved stories are published.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="bg-cream py-12 md:py-16">
      <div className="container-site">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-forest md:text-5xl">Testimonials</h1>
          <p className="mt-4 text-ink/80">
            Stories from buyers who worked with Mini Cow Farm. Placeholder/sample entries used for
            local development are clearly generic until replaced with authentic approved reviews.
          </p>
        </header>
        <div className="mt-12">
          <TestimonialGrid testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}
