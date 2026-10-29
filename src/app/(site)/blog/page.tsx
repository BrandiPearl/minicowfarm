import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/data/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Mini Highland Cattle Care Blog",
  description:
    "Practical guides on mini Highland cattle care, acreage needs, feeding, and homestead livestock basics from Mini Cow Farm.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="bg-cream py-12 md:py-16">
      <div className="container-site">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-forest md:text-5xl">Blog</h1>
          <p className="mt-4 text-ink/80">
            Practical articles for first-time owners and small-acreage farmers.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-12 text-center text-muted">No published posts yet.</p>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden border border-border bg-white">
                {post.cover_image_url ? (
                  <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9]">
                    <Image
                      src={post.cover_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Link>
                ) : null}
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {formatDate(post.published_at)}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-forest">
                    <Link href={`/blog/${post.slug}`} className="hover:text-forest-bright">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-3 text-sm leading-relaxed text-ink/80">{post.excerpt}</p>
                  ) : null}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-forest-bright hover:underline"
                  >
                    Read more
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
