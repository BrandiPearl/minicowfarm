"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/format";
import type { BlogPost } from "@/types/database";

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const title = String(formData.get("title") || "");
    const slug = String(formData.get("slug") || slugify(title));
    const status = String(formData.get("status") || "draft");
    const payload = {
      title,
      slug,
      excerpt: String(formData.get("excerpt") || "") || null,
      body: String(formData.get("body") || ""),
      cover_image_url: String(formData.get("cover_image_url") || "") || null,
      status,
      seo_title: String(formData.get("seo_title") || "") || null,
      seo_description: String(formData.get("seo_description") || "") || null,
      published_at:
        status === "published"
          ? post?.published_at ?? new Date().toISOString()
          : post?.published_at ?? null,
    };

    const supabase = createClient();
    if (post) {
      const { error: updateError } = await supabase.from("blog_posts").update(payload).eq("id", post.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("blog_posts").insert(payload);
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }
    router.push("/admin/blog");
    router.refresh();
  }

  async function onDelete() {
    if (!post || !confirm("Delete this post?")) return;
    const supabase = createClient();
    await supabase.from("blog_posts").delete().eq("id", post.id);
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="max-w-3xl space-y-4">
      <input
        name="title"
        required
        defaultValue={post?.title}
        placeholder="Title"
        className="w-full rounded border border-black/25 px-3 py-2"
      />
      <input
        name="slug"
        defaultValue={post?.slug}
        placeholder="slug"
        className="w-full rounded border border-black/25 px-3 py-2"
      />
      <textarea
        name="excerpt"
        rows={2}
        defaultValue={post?.excerpt ?? ""}
        placeholder="Excerpt"
        className="w-full rounded border border-black/25 px-3 py-2"
      />
      <textarea
        name="body"
        required
        rows={12}
        defaultValue={post?.body}
        placeholder="Body (markdown-ish: ## headings, - lists, **bold**)"
        className="w-full rounded border border-black/25 px-3 py-2 font-mono text-sm"
      />
      <input
        name="cover_image_url"
        defaultValue={post?.cover_image_url ?? ""}
        placeholder="Cover image URL"
        className="w-full rounded border border-black/25 px-3 py-2"
      />
      <select
        name="status"
        defaultValue={post?.status ?? "draft"}
        className="w-full rounded border border-black/25 px-3 py-2"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <input
        name="seo_title"
        defaultValue={post?.seo_title ?? ""}
        placeholder="SEO title"
        className="w-full rounded border border-black/25 px-3 py-2"
      />
      <input
        name="seo_description"
        defaultValue={post?.seo_description ?? ""}
        placeholder="SEO description"
        className="w-full rounded border border-black/25 px-3 py-2"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        {post ? (
          <Button type="button" variant="outline" onClick={onDelete}>
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
