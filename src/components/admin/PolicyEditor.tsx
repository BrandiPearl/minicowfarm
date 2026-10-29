"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { PolicyPage } from "@/types/database";

export function PolicyEditor({ page }: { page: PolicyPage }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("policy_pages")
      .update({
        title: String(formData.get("title") || ""),
        body: String(formData.get("body") || ""),
        seo_title: String(formData.get("seo_title") || "") || null,
        seo_description: String(formData.get("seo_description") || "") || null,
      })
      .eq("id", page.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Saved.");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-3 border border-border bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{page.slug}</p>
      <input
        name="title"
        defaultValue={page.title}
        className="w-full rounded border border-black/25 px-3 py-2 font-semibold"
      />
      <textarea
        name="body"
        rows={14}
        defaultValue={page.body}
        className="w-full rounded border border-black/25 px-3 py-2 font-mono text-sm"
      />
      <input
        name="seo_title"
        defaultValue={page.seo_title ?? ""}
        placeholder="SEO title"
        className="w-full rounded border border-black/25 px-3 py-2 text-sm"
      />
      <input
        name="seo_description"
        defaultValue={page.seo_description ?? ""}
        placeholder="SEO description"
        className="w-full rounded border border-black/25 px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-forest">{message}</p> : null}
      <Button type="submit">Save policy</Button>
    </form>
  );
}
