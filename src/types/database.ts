export type AnimalSpecies = "mini_cow" | "donkey";
export type AnimalStatus = "available" | "reserved" | "sold" | "draft";
export type AnimalGender = "male" | "female" | "unknown";
export type InquiryStatus = "new" | "in_progress" | "responded" | "closed" | "spam";
export type PublishStatus = "draft" | "published";

export interface Animal {
  id: string;
  slug: string;
  name: string;
  species: AnimalSpecies;
  price: number | null;
  compare_at_price: number | null;
  currency: string;
  status: AnimalStatus;
  gender: AnimalGender;
  age_description: string | null;
  color: string | null;
  description: string;
  health_notes: string | null;
  featured: boolean;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnimalImage {
  id: string;
  animal_id: string;
  object_key: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface AnimalWithImages extends Animal {
  animal_images: AnimalImage[];
}

export interface Inquiry {
  id: string;
  animal_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  source: string;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  location: string | null;
  body: string;
  photo_url: string | null;
  display_order: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  cover_image_key: string | null;
  status: PublishStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  business_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  address_line: string | null;
  tagline: string | null;
  social_tiktok: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin";
  created_at: string;
}
