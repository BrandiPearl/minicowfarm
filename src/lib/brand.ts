/**
 * Central brand & contact configuration.
 * Override via site_settings in Supabase when available; these are defaults.
 */
export const brand = {
  name: "Mini Cow Farm",
  legalName: "Mini Cow Farm",
  tagline: "Miniature Highland Cattle for Homesteads & Small Farms",
  email: "hello@minicowfarm.com",
  phone: "+1 (555) 010-2000",
  whatsapp: "+15550102000",
  location: "United States",
  addressLine: "By appointment. Contact us for farm location details",
  social: {
    tiktok: "",
    facebook: "",
    instagram: "",
  },
  urls: {
    site: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  },
} as const;

/** Palette derived from the reference Highland Mini Cows visual system */
export const colors = {
  forest: "#0E2207",
  forestDeep: "#071103",
  forestMid: "#1A5803",
  forestBright: "#23690A",
  forestSoft: "#1F6306",
  sage: "#9DBE91",
  sageMuted: "#869780",
  cream: "#F8F6F1",
  creamDark: "#ECE9E0",
  gold: "#DBB41B",
  goldBright: "#FBCA1E",
  goldSoft: "#FFBC7D",
  ink: "#172E18",
  muted: "#757873",
  white: "#FFFFFF",
  border: "#E2E2E2",
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/available-mini-cows", label: "Available Mini Cows" },
  { href: "/available-donkeys", label: "Available Donkeys" },
  { href: "/health-guarantee", label: "Health Guarantee" },
  { href: "/shipping-and-delivery-policy", label: "Shipping & Delivery Policy" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

export type NavLink = (typeof navLinks)[number];
