import type { Testimonial } from "@/types/database";

type TestimonialGridProps = {
  testimonials: Testimonial[];
};

export function TestimonialGrid({ testimonials }: TestimonialGridProps) {
  if (testimonials.length === 0) {
    return (
      <p className="text-center text-muted">
        Customer stories will appear here once authentic testimonials are published.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((t) => (
        <blockquote
          key={t.id}
          className="flex h-full flex-col border-l-4 border-l-forest-bright bg-cream px-5 py-5"
        >
          <p className="flex-1 text-sm leading-relaxed text-ink/85">&ldquo;{t.body}&rdquo;</p>
          <footer className="mt-5">
            <cite className="not-italic">
              <span className="block font-semibold text-forest">{t.customer_name}</span>
              {t.location ? <span className="text-sm text-muted">{t.location}</span> : null}
            </cite>
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
