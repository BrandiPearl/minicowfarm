"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAnimalForm } from "@/lib/validations/animal";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/format";
import type { Animal, AnimalImage } from "@/types/database";

type AnimalFormProps = {
  animal?: Animal;
  images?: AnimalImage[];
};

export function AnimalForm({ animal, images = [] }: AnimalFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localImages, setLocalImages] = useState(images);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const raw = {
      name: String(form.get("name") || ""),
      slug: String(form.get("slug") || ""),
      species: String(form.get("species") || "mini_cow"),
      price: form.get("price"),
      compare_at_price: form.get("compare_at_price"),
      currency: String(form.get("currency") || "USD"),
      status: String(form.get("status") || "draft"),
      gender: String(form.get("gender") || "unknown"),
      age_description: String(form.get("age_description") || ""),
      color: String(form.get("color") || ""),
      description: String(form.get("description") || ""),
      health_notes: String(form.get("health_notes") || ""),
      featured: form.get("featured") === "on",
      display_order: form.get("display_order"),
      published: form.get("published") === "on",
    };

    const parsed = parseAnimalForm(raw);
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? "Invalid form");
      setSaving(false);
      return;
    }

    const values = parsed.data;
    const payload = {
      ...values,
      age_description: values.age_description || null,
      color: values.color || null,
      health_notes: values.health_notes || null,
      price: values.price ?? null,
      compare_at_price: values.compare_at_price ?? null,
    };

    const supabase = createClient();
    if (animal) {
      const { error } = await supabase.from("animals").update(payload).eq("id", animal.id);
      if (error) {
        setServerError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("animals").insert(payload).select("id").single();
      if (error) {
        setServerError(error.message);
        setSaving(false);
        return;
      }
      router.push(`/admin/animals/${data.id}`);
      router.refresh();
      return;
    }

    router.push("/admin/animals");
    router.refresh();
  }

  async function onDelete() {
    if (!animal || !confirm("Delete this animal and its images?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("animals").delete().eq("id", animal.id);
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push("/admin/animals");
    router.refresh();
  }

  async function onUpload(file: File) {
    if (!animal) {
      setServerError("Save the animal first, then upload images.");
      return;
    }
    setUploading(true);
    setServerError(null);
    try {
      const metaRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "animals",
          size: file.size,
        }),
      });
      const meta = (await metaRes.json()) as {
        ok?: boolean;
        error?: string;
        uploadUrl?: string;
        objectKey?: string;
        publicUrl?: string;
      };
      if (!metaRes.ok || !meta.ok || !meta.uploadUrl || !meta.objectKey || !meta.publicUrl) {
        throw new Error(meta.error ?? "Upload URL failed");
      }

      const put = await fetch(meta.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("Upload to R2 failed");

      const supabase = createClient();
      const { data, error } = await supabase
        .from("animal_images")
        .insert({
          animal_id: animal.id,
          object_key: meta.objectKey,
          url: meta.publicUrl,
          alt_text: animal.name,
          display_order: localImages.length,
          is_primary: localImages.length === 0,
        })
        .select("*")
        .single();
      if (error) throw error;
      setLocalImages((prev) => [...prev, data as AnimalImage]);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(image: AnimalImage) {
    if (!confirm("Remove this image?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("animal_images").delete().eq("id", image.id);
    if (error) {
      setServerError(error.message);
      return;
    }
    setLocalImages((prev) => prev.filter((i) => i.id !== image.id));
  }

  function autoSlug(e: FormEvent<HTMLInputElement>) {
    if (animal) return;
    const form = e.currentTarget.form;
    if (!form) return;
    const slug = form.elements.namedItem("slug") as HTMLInputElement | null;
    if (slug && !slug.value) slug.value = slugify(e.currentTarget.value);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            name="name"
            required
            defaultValue={animal?.name}
            onBlur={autoSlug}
            className="w-full rounded border border-black/25 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            name="slug"
            required
            defaultValue={animal?.slug}
            className="w-full rounded border border-black/25 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Species</label>
          <select name="species" defaultValue={animal?.species ?? "mini_cow"} className="w-full rounded border border-black/25 px-3 py-2">
            <option value="mini_cow">Mini cow</option>
            <option value="donkey">Donkey</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select name="status" defaultValue={animal?.status ?? "draft"} className="w-full rounded border border-black/25 px-3 py-2">
            <option value="draft">Draft</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Gender</label>
          <select name="gender" defaultValue={animal?.gender ?? "unknown"} className="w-full rounded border border-black/25 px-3 py-2">
            <option value="unknown">Unknown</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Price</label>
          <input name="price" type="number" step="0.01" defaultValue={animal?.price ?? ""} className="w-full rounded border border-black/25 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Compare-at price</label>
          <input name="compare_at_price" type="number" step="0.01" defaultValue={animal?.compare_at_price ?? ""} className="w-full rounded border border-black/25 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Display order</label>
          <input name="display_order" type="number" defaultValue={animal?.display_order ?? 0} className="w-full rounded border border-black/25 px-3 py-2" />
        </div>
      </div>

      <input type="hidden" name="currency" value="USD" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Age description</label>
          <input name="age_description" defaultValue={animal?.age_description ?? ""} className="w-full rounded border border-black/25 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Color</label>
          <input name="color" defaultValue={animal?.color ?? ""} className="w-full rounded border border-black/25 px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea name="description" required rows={6} defaultValue={animal?.description} className="w-full rounded border border-black/25 px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Health notes</label>
        <textarea name="health_notes" rows={3} defaultValue={animal?.health_notes ?? ""} className="w-full rounded border border-black/25 px-3 py-2" />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm">
          <input name="featured" type="checkbox" defaultChecked={animal?.featured} /> Featured on homepage
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input name="published" type="checkbox" defaultChecked={animal?.published} /> Published
        </label>
      </div>

      {animal ? (
        <div className="border border-border bg-white p-4">
          <h2 className="font-semibold text-forest">Images</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {localImages.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="aspect-square w-full object-cover" />
                <button type="button" className="mt-1 text-xs text-red-600 underline" onClick={() => deleteImage(img)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-3 block text-sm"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
              e.target.value = "";
            }}
          />
          {uploading ? <p className="mt-2 text-sm text-muted">Uploading…</p> : null}
        </div>
      ) : null}

      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        {animal ? (
          <Button type="button" variant="outline" onClick={onDelete}>
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
