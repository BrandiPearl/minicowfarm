import type { AnimalWithImages } from "@/types/database";

export function primaryImage(animal: AnimalWithImages) {
  return (
    animal.animal_images.find((img) => img.is_primary) ??
    animal.animal_images[0] ??
    null
  );
}
