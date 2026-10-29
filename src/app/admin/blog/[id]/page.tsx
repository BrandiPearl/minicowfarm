import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/auth/admin";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import type { BlogPost } from "@/types/database";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl font-bold text-forest">Edit post</h1>
      <BlogPostForm post={data as BlogPost} />
    </div>
  );
}
