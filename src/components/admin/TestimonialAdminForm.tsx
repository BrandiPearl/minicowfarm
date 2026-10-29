"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Testimonial } from "@/types/database";

export function TestimonialAdminForm({ existing }: { existing: Testimonial[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("testimonials").insert({
      customer_name: String(form.get("customer_name") || ""),
      location: String(form.get("location") || "") || null,
      body: String(form.get("body") || ""),
      published: form.get("published") === "on",
      featured: form.get("featured") === "on",
      display_order: Number(form.get("display_order") || 0),
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  async function togglePublished(t: Testimonial) {
    const supabase = createClient();
    await supabase.from("testimonials").update({ published: !t.published }).eq("id", t.id);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    const supabase = createClient();
    await supabase.from("testimonials").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onCreate} className="max-w-2xl space-y-3 border border-border bg-white p-5">
        <h2 className="font-semibold text-forest">Add testimonial</h2>
        <input
          name="customer_name"
          required
          placeholder="Customer name"
          className="w-full rounded border border-black/25 px-3 py-2 text-sm"
        />
        <input
          name="location"
          placeholder="Location (optional)"
          className="w-full rounded border border-black/25 px-3 py-2 text-sm"
        />
        <textarea
          name="body"
          required
          rows={4}
          placeholder="Testimonial text"
          className="w-full rounded border border-black/25 px-3 py-2 text-sm"
        />
        <input
          name="display_order"
          type="number"
          defaultValue={0}
          className="w-full rounded border border-black/25 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input name="published" type="checkbox" /> Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="featured" type="checkbox" /> Featured on homepage
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit">Save</Button>
      </form>

      <div className="space-y-3">
        {existing.map((t) => (
          <div key={t.id} className="border border-border bg-white p-4">
            <p className="font-medium">{t.customer_name}</p>
            <p className="text-sm text-muted">{t.location}</p>
            <p className="mt-2 text-sm">{t.body}</p>
            <div className="mt-3 flex gap-3 text-sm">
              <button type="button" className="underline" onClick={() => void togglePublished(t)}>
                {t.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="text-red-600 underline" onClick={() => void remove(t.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
