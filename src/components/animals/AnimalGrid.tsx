"use client";

import { useMemo, useState } from "react";
import { AnimalCard } from "@/components/animals/AnimalCard";
import type { AnimalStatus, AnimalWithImages } from "@/types/database";

type AnimalGridProps = {
  animals: AnimalWithImages[];
  emptyMessage?: string;
};

const FILTERS: { label: string; value: "all" | AnimalStatus }[] = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "Reserved", value: "reserved" },
  { label: "Sold", value: "sold" },
];

export function AnimalGrid({
  animals,
  emptyMessage = "No animals match this filter right now.",
}: AnimalGridProps) {
  const [status, setStatus] = useState<"all" | AnimalStatus>("all");

  const filtered = useMemo(() => {
    if (status === "all") return animals;
    return animals.filter((a) => a.status === status);
  }, [animals, status]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by availability">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-[2px] border px-4 py-2 text-sm font-medium transition-colors ${
              status === f.value
                ? "border-forest bg-forest text-white"
                : "border-border bg-white text-forest hover:border-forest hover:bg-cream"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted">{emptyMessage}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}
    </div>
  );
}
