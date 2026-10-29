import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/data/content";
import { formatDate } from "@/lib/format";
import { simpleMarkdownToHtml } from "@/lib/markdown";
import { brand } from "@/lib/brand";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
      type: "article",
      siteName: brand.name,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="bg-cream py-12 md:py-16">
      <div className="container-site max-w-3xl">
        <nav className="mb-6 text-sm text-muted">
          <Link href="/blog" className="hover:text-forest">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-forest">{post.title}</span>
        </nav>

        <p className="text-sm text-muted">{formatDate(post.published_at)}</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-forest md:text-5xl">
          {post.title}
        </h1>
        {post.excerpt ? <p className="mt-4 text-lg text-ink/80">{post.excerpt}</p> : null}

        {post.cover_image_url ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden border border-border">
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        ) : null}

        <div
          className="prose-blog mt-10"
          dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(post.body) }}
        />
      </div>
    </article>
  );
}
