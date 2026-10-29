import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatPrice, genderLabel, statusLabel } from "@/lib/format";
import { cleanAgeDescription, cleanColor } from "@/lib/animals/display";
import { primaryImage } from "@/lib/animals/helpers";
import type { AnimalWithImages } from "@/types/database";
import { Button } from "@/components/ui/Button";

type AnimalCardProps = {
  animal: AnimalWithImages;
};

export function AnimalCard({ animal }: AnimalCardProps) {
  const image = primaryImage(animal);
  const soldOrReserved = animal.status === "sold" || animal.status === "reserved";
  const age = cleanAgeDescription(animal.age_description, animal.name);
  const color = cleanColor(animal.color, animal.name);

  const facts: { label: string; value: ReactNode }[] = [
    {
      label: "Price",
      value: (
        <>
          {formatPrice(animal.price, animal.currency)}
          {animal.compare_at_price != null && animal.price != null ? (
            <span className="ml-2 font-normal text-muted line-through">
              {formatPrice(animal.compare_at_price, animal.currency)}
            </span>
          ) : null}
        </>
      ),
    },
    { label: "Status", value: statusLabel(animal.status) },
    { label: "Gender", value: genderLabel(animal.gender, animal.species) },
  ];
  if (age) {
    facts.push({ label: "Age", value: age });
  }
  if (color) {
    facts.push({ label: "Color", value: color });
  }

  return (
    <article className="flex h-full flex-col border border-border bg-white p-3">
      <Link
        href={`/animals/${animal.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-md bg-cream-dark"
      >
        {image ? (
          <Image
            src={image.url}
            alt={
              image.alt_text ||
              `${animal.name} ${animal.species === "donkey" ? "miniature donkey" : "mini Highland cow"}${animal.color ? `, ${animal.color}` : ""}`
            }
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Photo coming soon
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-[2px] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            animal.status === "available"
              ? "bg-forest-bright text-white"
              : animal.status === "reserved"
                ? "bg-gold text-forest-deep"
                : "bg-muted text-white"
          }`}
        >
          {statusLabel(animal.status)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="font-display text-[1.85rem] font-bold leading-none text-forest md:text-[2rem]">
          <Link href={`/animals/${animal.slug}`} className="hover:text-forest-bright">
            {animal.name}
          </Link>
        </h3>

        <ul className="mt-2.5 space-y-1 text-[15px] font-medium leading-snug text-ink">
          {facts.map((fact) => (
            <li key={fact.label}>
              <span className="font-medium">{fact.label}: </span>
              <span>{fact.value}</span>
            </li>
          ))}
        </ul>

        {animal.description ? (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/75">
            {animal.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-4 flex gap-2">
          <Button href={`/animals/${animal.slug}`} variant="outline" className="flex-1 px-3 py-2 text-xs">
            View Details
          </Button>
          {!soldOrReserved ? (
            <Button
              href={`/animals/${animal.slug}#inquire`}
              variant="primary"
              className="flex-1 px-3 py-2 text-xs"
            >
              Inquire
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
