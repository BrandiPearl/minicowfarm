import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";
import { getAnimals } from "@/lib/data/animals";
import { getBlogPosts } from "@/lib/data/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = brand.urls.site;
  const staticRoutes = [
    "",
    "/available-mini-cows",
    "/available-donkeys",
    "/health-guarantee",
    "/shipping-and-delivery-policy",
    "/testimonials",
    "/blog",
    "/contact-us",
  ];

  const [animals, posts] = await Promise.all([getAnimals(), getBlogPosts()]);

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...animals.map((a) => ({
      url: `${base}/animals/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
