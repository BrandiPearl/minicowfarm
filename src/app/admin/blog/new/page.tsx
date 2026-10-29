import { requireAdminUser } from "@/lib/auth/admin";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default async function NewBlogPostPage() {
  await requireAdminUser();
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl font-bold text-forest">New blog post</h1>
      <BlogPostForm />
    </div>
  );
}
