import type { Metadata } from "next";
import { AnimalGrid } from "@/components/animals/AnimalGrid";
import { getAnimals } from "@/lib/data/animals";

export const metadata: Metadata = {
  title: "Available Miniature Donkeys for Sale",
  description:
    "Browse miniature donkeys for sale from Mini Cow Farm. Filter by availability and inquire for responsible placement and transport options.",
  alternates: { canonical: "/available-donkeys" },
  openGraph: {
    title: "Available Miniature Donkeys for Sale",
    url: "/available-donkeys",
  },
};

export default async function AvailableDonkeysPage() {
  const animals = await getAnimals({ species: "donkey" });

  return (
    <div className="bg-cream py-12 md:py-16">
      <div className="container-site">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-forest md:text-5xl">
            Available Miniature Donkeys for Sale
          </h1>
          <p className="mt-4 text-ink/80">
            Each donkey listed below is available for responsible placement and has been raised
            with regular handling and attention to overall health. Availability can change quickly,
            so reach out early if you see one you would like to reserve. Transportation assistance
            may be available depending on location.
          </p>
        </header>

        <div className="mt-12">
          <AnimalGrid
            animals={animals}
            emptyMessage="No donkeys are listed right now. Please check back soon or contact us."
          />
        </div>
      </div>
    </div>
  );
}
