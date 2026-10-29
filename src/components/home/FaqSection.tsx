import { Accordion } from "@/components/ui/Accordion";
import { homeFaqs } from "@/lib/seo/faqs";

export function FaqSection() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="container-site max-w-3xl">
        <h2 className="text-center font-display text-[2.2rem] font-bold text-forest md:text-[32px]">
          Everything You Need to Know Before Buying Mini Highland Cows
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          Whether you&apos;re a first-time buyer or an experienced farmer, these are the
          questions we hear most. If yours isn&apos;t listed, reach out and we&apos;re happy to help.
        </p>
        <div className="mt-10">
          <Accordion items={homeFaqs} />
        </div>
      </div>
    </section>
  );
}
