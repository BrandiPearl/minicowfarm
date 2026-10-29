import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/auth/admin";
import { AnimalForm } from "@/components/admin/AnimalForm";
import type { Animal, AnimalImage } from "@/types/database";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditAnimalPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("animals")
    .select("*, animal_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const animal = data as Animal & { animal_images: AnimalImage[] };
  const images = [...(animal.animal_images ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );

  return (
    <div>
      <h1 className="mb-6 font-display text-4xl font-bold text-forest">Edit {animal.name}</h1>
      <AnimalForm animal={animal} images={images} />
    </div>
  );
}
