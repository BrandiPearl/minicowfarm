import { z } from "zod";

const optionalMoney = z.union([z.number(), z.null()]).optional();

export const animalSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  species: z.enum(["mini_cow", "donkey"]),
  price: optionalMoney,
  compare_at_price: optionalMoney,
  currency: z.string().min(3).max(3),
  status: z.enum(["available", "reserved", "sold", "draft"]),
  gender: z.enum(["male", "female", "unknown"]),
  age_description: z.string().trim().max(80).optional(),
  color: z.string().trim().max(120).optional(),
  description: z.string().trim().min(1).max(10000),
  health_notes: z.string().trim().max(5000).optional(),
  featured: z.boolean(),
  display_order: z.number().int(),
  published: z.boolean(),
});

export type AnimalInput = z.infer<typeof animalSchema>;

export function parseAnimalForm(raw: Record<string, unknown>) {
  const toMoney = (v: unknown) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  };

  return animalSchema.safeParse({
    ...raw,
    price: toMoney(raw.price),
    compare_at_price: toMoney(raw.compare_at_price),
    display_order: Number(raw.display_order ?? 0),
    featured: Boolean(raw.featured),
    published: Boolean(raw.published),
    age_description: raw.age_description || undefined,
    color: raw.color || undefined,
    health_notes: raw.health_notes || undefined,
  });
}
