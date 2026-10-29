import { createClient } from "@/lib/supabase/server";
import type { AnimalSpecies, AnimalStatus, AnimalWithImages } from "@/types/database";
import { demoAnimals } from "@/lib/data/demo";

export { primaryImage } from "@/lib/animals/helpers";

export type AnimalFilters = {
  species?: AnimalSpecies;
  status?: AnimalStatus | AnimalStatus[];
  featured?: boolean;
  publishedOnly?: boolean;
};

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function filterDemo(
  animals: AnimalWithImages[],
  filters: AnimalFilters = {},
): AnimalWithImages[] {
  return animals
    .filter((a) => (filters.publishedOnly === false ? true : a.published))
    .filter((a) => (filters.species ? a.species === filters.species : true))
    .filter((a) => {
      if (!filters.status) return true;
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      return statuses.includes(a.status);
    })
    .filter((a) => (filters.featured ? a.featured : true))
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getAnimals(filters: AnimalFilters = {}): Promise<AnimalWithImages[]> {
  if (!isSupabaseConfigured()) {
    return filterDemo(demoAnimals, { publishedOnly: true, ...filters });
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("animals")
      .select("*, animal_images(*)")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (filters.publishedOnly !== false) {
      query = query.eq("published", true);
    }
    if (filters.species) query = query.eq("species", filters.species);
    if (filters.featured) query = query.eq("featured", true);
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      query = query.in("status", statuses);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data as AnimalWithImages[]).map((animal) => ({
      ...animal,
      animal_images: [...(animal.animal_images ?? [])].sort(
        (a, b) => a.display_order - b.display_order,
      ),
    }));
  } catch (error) {
    console.error("getAnimals failed, falling back to demo data:", error);
    return filterDemo(demoAnimals, { publishedOnly: true, ...filters });
  }
}

export async function getAnimalBySlug(slug: string): Promise<AnimalWithImages | null> {
  if (!isSupabaseConfigured()) {
    return demoAnimals.find((a) => a.slug === slug && a.published) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("animals")
      .select("*, animal_images(*)")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const animal = data as AnimalWithImages;
    return {
      ...animal,
      animal_images: [...(animal.animal_images ?? [])].sort(
        (a, b) => a.display_order - b.display_order,
      ),
    };
  } catch (error) {
    console.error("getAnimalBySlug failed:", error);
    return demoAnimals.find((a) => a.slug === slug && a.published) ?? null;
  }
}
