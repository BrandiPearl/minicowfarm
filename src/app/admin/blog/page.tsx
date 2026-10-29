import Link from "next/link";
import { requireAdminUser } from "@/lib/auth/admin";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

export default async function AdminBlogPage() {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Failed to load posts: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-forest">Blog</h1>
        <Button href="/admin/blog/new">New post</Button>
      </div>
      <div className="mt-8 space-y-3">
        {(data ?? []).map((post) => (
          <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 border border-border bg-white p-4">
            <div>
              <p className="font-medium text-forest">{post.title}</p>
              <p className="text-xs text-muted">
                {post.status} · {formatDate(post.published_at ?? post.updated_at)}
              </p>
            </div>
            <Link href={`/admin/blog/${post.id}`} className="text-sm text-forest-bright underline">
              Edit
            </Link>
          </div>
        ))}
        {(data ?? []).length === 0 ? <p className="text-muted">No posts yet.</p> : null}
      </div>
    </div>
  );
}
