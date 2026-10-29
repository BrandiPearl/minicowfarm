import { createClient } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";
import {
  demoBlogPosts,
  demoPolicies,
  demoSettings,
  demoTestimonials,
} from "@/lib/data/demo";
import type { BlogPost, PolicyPage, SiteSettings, Testimonial } from "@/types/database";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return demoSettings;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return (data as SiteSettings) ?? demoSettings;
  } catch (error) {
    console.error("getSiteSettings failed:", error);
    return demoSettings;
  }
}

export async function getTestimonials(options?: {
  featuredOnly?: boolean;
}): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) {
    return demoTestimonials
      .filter((t) => t.published)
      .filter((t) => (options?.featuredOnly ? t.featured : true))
      .sort((a, b) => a.display_order - b.display_order);
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true });

    if (options?.featuredOnly) query = query.eq("featured", true);

    const { data, error } = await query;
    if (error) throw error;
    return (data as Testimonial[]) ?? [];
  } catch (error) {
    console.error("getTestimonials failed:", error);
    return demoTestimonials.filter((t) => t.published);
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) {
    return demoBlogPosts
      .filter((p) => p.status === "published")
      .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data as BlogPost[]) ?? [];
  } catch (error) {
    console.error("getBlogPosts failed:", error);
    return demoBlogPosts.filter((p) => p.status === "published");
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) {
    return demoBlogPosts.find((p) => p.slug === slug && p.status === "published") ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data as BlogPost | null;
  } catch (error) {
    console.error("getBlogPostBySlug failed:", error);
    return demoBlogPosts.find((p) => p.slug === slug && p.status === "published") ?? null;
  }
}

export async function getPolicyPage(slug: string): Promise<PolicyPage | null> {
  if (!isSupabaseConfigured()) {
    return demoPolicies.find((p) => p.slug === slug) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("policy_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data as PolicyPage | null;
  } catch (error) {
    console.error("getPolicyPage failed:", error);
    return demoPolicies.find((p) => p.slug === slug) ?? null;
  }
}

export function settingsToBrand(settings: SiteSettings) {
  return {
    ...brand,
    name: settings.business_name || brand.name,
    email: settings.email || brand.email,
    phone: settings.phone || brand.phone,
    whatsapp: settings.whatsapp || brand.whatsapp,
    location: settings.location || brand.location,
    addressLine: settings.address_line || brand.addressLine,
    tagline: settings.tagline || brand.tagline,
    social: {
      tiktok: settings.social_tiktok || brand.social.tiktok,
      facebook: settings.social_facebook || brand.social.facebook,
      instagram: settings.social_instagram || brand.social.instagram,
    },
  };
}
