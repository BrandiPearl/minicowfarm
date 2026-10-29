import { brand } from "@/lib/brand";
import type {
  AnimalWithImages,
  BlogPost,
  PolicyPage,
  SiteSettings,
  Testimonial,
} from "@/types/database";

/** Clearly labeled local-development seed dataset, not real inventory. */
const now = new Date().toISOString();

function img(animalId: string, n: number, url: string) {
  return {
    id: `${animalId}-img-${n}`,
    animal_id: animalId,
    object_key: `demo/${animalId}-${n}.jpg`,
    url,
    alt_text: null as string | null,
    display_order: n,
    is_primary: n === 0,
    created_at: now,
  };
}

/** Placeholder photography, replace with licensed farm photos via admin/R2 */
const PLACEHOLDER = {
  cow1: "https://images.unsplash.com/photo-1570042226335-4c8c7e9f3f0b?w=800&q=80",
  cow2: "https://images.unsplash.com/photo-1546445317-132b5545f4fb?w=800&q=80",
  cow3: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80",
  cow4: "https://images.unsplash.com/photo-1527156231393-7023794f363c?w=800&q=80",
  donkey1: "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=800&q=80",
  donkey2: "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=800&q=80",
  blog: "https://images.unsplash.com/photo-1500595046743-cd271d973d8b?w=1200&q=80",
};

export const demoSettings: SiteSettings = {
  id: "00000000-0000-4000-8000-000000000001",
  business_name: brand.name,
  email: brand.email,
  phone: brand.phone,
  whatsapp: brand.whatsapp,
  location: brand.location,
  address_line: brand.addressLine,
  tagline: brand.tagline,
  social_tiktok: null,
  social_facebook: null,
  social_instagram: null,
  updated_at: now,
};

export const demoAnimals: AnimalWithImages[] = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    slug: "maple",
    name: "Maple",
    species: "mini_cow",
    price: 2000,
    compare_at_price: 2500,
    currency: "USD",
    status: "available",
    gender: "female",
    age_description: "3 Months",
    color: "Red & White",
    description:
      "Maple is a gentle 3-month-old mini heifer with a soft, fluffy coat and a calm temperament. She is a seed listing for local development only, replace with your real inventory.",
    health_notes: "Seed animal, no veterinary claims apply.",
    featured: true,
    display_order: 1,
    published: true,
    created_at: now,
    updated_at: now,
    animal_images: [img("a1000000-0000-4000-8000-000000000001", 0, PLACEHOLDER.cow1)],
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    slug: "cedar",
    name: "Cedar",
    species: "mini_cow",
    price: 1800,
    compare_at_price: 2200,
    currency: "USD",
    status: "available",
    gender: "male",
    age_description: "2 Months",
    color: "Silver Dun",
    description:
      "Cedar is a compact mini bull calf with classic Highland fluff. Demo listing for layout and catalog testing.",
    health_notes: null,
    featured: true,
    display_order: 2,
    published: true,
    created_at: now,
    updated_at: now,
    animal_images: [img("a1000000-0000-4000-8000-000000000002", 0, PLACEHOLDER.cow2)],
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    slug: "clover",
    name: "Clover",
    species: "mini_cow",
    price: 2000,
    compare_at_price: null,
    currency: "USD",
    status: "available",
    gender: "female",
    age_description: "4 Months",
    color: "Cream White",
    description:
      "Clover is a cream-white mini heifer demo animal used to verify featured cards and detail pages.",
    health_notes: null,
    featured: true,
    display_order: 3,
    published: true,
    created_at: now,
    updated_at: now,
    animal_images: [img("a1000000-0000-4000-8000-000000000003", 0, PLACEHOLDER.cow3)],
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    slug: "biscuit",
    name: "Biscuit",
    species: "mini_cow",
    price: 1500,
    compare_at_price: 2000,
    currency: "USD",
    status: "reserved",
    gender: "male",
    age_description: "5 Months",
    color: "Light Dun",
    description: "Reserved demo listing to show status badges in the catalog.",
    health_notes: null,
    featured: false,
    display_order: 4,
    published: true,
    created_at: now,
    updated_at: now,
    animal_images: [img("a1000000-0000-4000-8000-000000000004", 0, PLACEHOLDER.cow4)],
  },
  {
    id: "a1000000-0000-4000-8000-000000000005",
    slug: "bella-jenny",
    name: "Bella",
    species: "donkey",
    price: 1500,
    compare_at_price: null,
    currency: "USD",
    status: "available",
    gender: "female",
    age_description: "4 Months",
    color: "Brown & White",
    description:
      "Bella is a demo miniature jenny for catalog layout testing. Replace with your own donkey listings.",
    health_notes: null,
    featured: false,
    display_order: 1,
    published: true,
    created_at: now,
    updated_at: now,
    animal_images: [img("a1000000-0000-4000-8000-000000000005", 0, PLACEHOLDER.donkey1)],
  },
  {
    id: "a1000000-0000-4000-8000-000000000006",
    slug: "otto-jack",
    name: "Otto",
    species: "donkey",
    price: 1500,
    compare_at_price: null,
    currency: "USD",
    status: "available",
    gender: "male",
    age_description: "5 Months",
    color: "Gray",
    description: "Otto is a demo miniature jack used for Available Donkeys page verification.",
    health_notes: null,
    featured: false,
    display_order: 2,
    published: true,
    created_at: now,
    updated_at: now,
    animal_images: [img("a1000000-0000-4000-8000-000000000006", 0, PLACEHOLDER.donkey2)],
  },
];

/** Placeholder copy for UI testing, replace with authentic customer testimonials only. */
export const demoTestimonials: Testimonial[] = [
  {
    id: "t1000000-0000-4000-8000-000000000001",
    customer_name: "Sample Customer A",
    location: "Example State",
    body: "This is placeholder testimonial text for local development. Replace with authentic, approved customer stories before publishing.",
    photo_url: null,
    display_order: 1,
    published: true,
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "t1000000-0000-4000-8000-000000000002",
    customer_name: "Sample Customer B",
    location: "Example State",
    body: "Another demo testimonial used to verify the homepage and testimonials page layout. Do not present as a real review.",
    photo_url: null,
    display_order: 2,
    published: true,
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "t1000000-0000-4000-8000-000000000003",
    customer_name: "Sample Customer C",
    location: "Example State",
    body: "Third placeholder review for grid density testing. Publish only business-approved testimonials.",
    photo_url: null,
    display_order: 3,
    published: true,
    featured: true,
    created_at: now,
    updated_at: now,
  },
];

export const demoBlogPosts: BlogPost[] = [
  {
    id: "b1000000-0000-4000-8000-000000000001",
    slug: "mini-highland-cow-care-basics",
    title: "Mini Highland Cow Care Basics: Feeding, Shelter & Daily Routines",
    excerpt:
      "A practical starter overview of pasture, hay, minerals, water, and simple shelter for miniature Highland cattle on small acreage.",
    body: `## Getting started

Miniature Highland cattle are hardy, but “low maintenance” still means consistent routines.

### Feeding

- Quality pasture as the primary diet when available
- Grass hay in winter or drought
- Free-choice loose minerals formulated for cattle
- Fresh water every day

### Shelter

Provide a dry place out of driving wind and wet weather. A three-sided shed is often enough in many climates.

### Handling

Short, calm daily handling helps calves stay friendly and easy to move.

*This article is educational sample content for the Mini Cow Farm demo blog.*`,
    cover_image_url: PLACEHOLDER.blog,
    cover_image_key: null,
    status: "published",
    seo_title: "Mini Highland Cow Care Basics | Mini Cow Farm",
    seo_description:
      "Learn the basics of feeding, shelter, and daily care for miniature Highland cattle.",
    published_at: "2026-05-08T12:00:00.000Z",
    created_at: now,
    updated_at: now,
  },
  {
    id: "b1000000-0000-4000-8000-000000000002",
    slug: "how-much-land-for-a-mini-highland",
    title: "How Much Land Do You Need for a Mini Highland Cow?",
    excerpt:
      "Acreage guidelines for mini Highlands, plus fencing and pasture rotation notes for hobby farms.",
    body: `## Acreage guidelines

Many owners start with about 1 acre per animal for basic grazing, with 2-3 acres preferred for healthier pasture when rotating.

Exact needs depend on rainfall, forage quality, and whether you supplement with hay.

*Sample educational post for local development.*`,
    cover_image_url: PLACEHOLDER.cow2,
    cover_image_key: null,
    status: "published",
    seo_title: "Land Requirements for Mini Highlands | Mini Cow Farm",
    seo_description: "Practical acreage guidance for miniature Highland cattle on small farms.",
    published_at: "2026-05-09T12:00:00.000Z",
    created_at: now,
    updated_at: now,
  },
];

export const demoPolicies: PolicyPage[] = [
  {
    id: "p1000000-0000-4000-8000-000000000001",
    slug: "health-guarantee",
    title: "Our Mini Highland Cattle Health Guarantee",
    seo_title: "Health Guarantee | Mini Cow Farm",
    seo_description:
      "Configurable health policy overview for Mini Cow Farm purchases. Edit this content in the admin dashboard.",
    updated_at: now,
    body: `When you purchase an animal from us, you are making a long-term investment. Below is a **template policy structure** you can edit in Admin → Policies. Do not treat this demo text as a binding veterinary or legal guarantee until you finalize your own terms.

## Two layers of protection (template)

### Arrival health window

Valid for a short window after departure (configure in admin). Have the animal examined by a licensed large-animal veterinarian. Remedies and exclusions must be defined by your business.

### Longer-term congenital coverage (template)

Describe which genetic or congenital conditions you cover, claim documentation requirements, and what is excluded (injuries after delivery, inadequate care, etc.).

## Buyer responsibilities

- Schedule a veterinary exam within your stated window
- Provide proper nutrition, water, and shelter
- Maintain vaccinations as directed by your veterinarian
- Keep sale and health records
- Contact us promptly with health concerns

## How to make a claim

1. Contact us immediately
2. Obtain a written veterinary diagnosis
3. Submit documentation in writing
4. We review and respond
5. Resolution per your published terms

## Contact

Email: ${brand.email}
Phone: ${brand.phone}`,
  },
  {
    id: "p1000000-0000-4000-8000-000000000002",
    slug: "shipping-and-delivery-policy",
    title: "Shipping & Delivery Policy, Nationwide Livestock Transport",
    seo_title: "Shipping & Delivery Policy | Mini Cow Farm",
    seo_description:
      "Editable delivery coverage, pickup rules, and transport process for Mini Cow Farm.",
    updated_at: now,
    body: `Arranging safe transport for a live animal is a critical part of the buying process. This page is a **configurable template**, update service areas, fees, and timelines in Admin → Policies.

## 1. Delivery coverage area

Describe the states or regions you serve. Confirm remote locations before reservation.

## 2. Local farm pickup

Pickup by appointment. Buyers should bring appropriate livestock transport, bedding, and paid-in-full confirmation.

## 3. Nationwide shipping, process

1. Reserve and pay deposit
2. Receive transport quote
3. Pre-shipment health check / certificates as required
4. Schedule with a professional livestock hauler
5. Loading notification and driver contact
6. Delivery to farm or agreed location

## 4. Transport costs

Fees are separate from animal price and typically depend on distance, number of animals, route, and fuel. Quotes should be agreed before booking. State your refund rules for booked transport.

## 5. Delivery timeframes

Provide realistic transit estimates by distance band. Note weather and route delays.

## 6. Animal welfare during transport

Describe space, water/feed stops, ventilation, and weather holds.

## 7. Interstate health certificates

Explain CVI/health certificate handling and buyer responsibility for state entry rules.

## 8. Ownership & liability

Define when risk transfers (often at loading) and insurance recommendations.

## 9. Receiving your animal

Inspect on arrival, document concerns promptly, and schedule the veterinary exam required by your health policy.

## 10. Missed or rescheduled deliveries

State buyer responsibility for missed receives and reschedule notice windows.

## 11. Contact

${brand.legalName}
Email: ${brand.email}
Phone: ${brand.phone}`,
  },
];
