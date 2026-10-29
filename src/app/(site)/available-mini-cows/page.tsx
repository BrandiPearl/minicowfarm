import type { Metadata } from "next";
import { AnimalGrid } from "@/components/animals/AnimalGrid";
import { getAnimals } from "@/lib/data/animals";

export const metadata: Metadata = {
  title: "Available Mini Highland Calves for Sale",
  description:
    "See currently available miniature Highland calves with prices, ages, and colors. Filter by available, reserved, or sold and inquire directly.",
  alternates: { canonical: "/available-mini-cows" },
  openGraph: {
    title: "Available Mini Highland Calves for Sale",
    description:
      "Current mini Highland calf listings from Mini Cow Farm. Inquire for pricing and transport.",
    url: "/available-mini-cows",
  },
};

export default async function AvailableMiniCowsPage() {
  const animals = await getAnimals({ species: "mini_cow" });

  return (
    <div className="bg-cream py-12 md:py-16">
      <div className="container-site">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-forest md:text-5xl">
            Mini Highland Calves For Sale
          </h1>
          <p className="mt-4 text-ink/80">
            Each calf listed below is from our farm inventory. Availability can change quickly as
            reservations are placed, so inquire early if you see one you want. Heifers and bull
            calves are priced individually; transport is quoted separately.
          </p>
        </header>

        <div className="mt-12">
          <AnimalGrid
            animals={animals}
            emptyMessage="No mini cows are listed right now. Please check back soon or contact us."
          />
        </div>
      </div>
    </div>
  );
}
