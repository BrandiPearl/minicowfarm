import { brand } from "@/lib/brand";

export type FaqItem = {
  question: string;
  answer: string;
};

export const homeFaqs: FaqItem[] = [
  {
    question: "How much does a mini Highland cow cost?",
    answer:
      "Mini Highland cattle typically range from $1,200 to $5,000 depending on age, sex, color, and bloodline. Younger calves and starter animals are generally priced lower, while micro-miniature animals and registered breeding stock command a premium. Transport is quoted separately based on your location. Browse our current listings to see exact pricing on available calves.",
  },
  {
    question: "How much land do I need for a mini Highland cow?",
    answer:
      "Mini Highlands thrive on as little as 1 acre per animal, making them one of the most practical cattle breeds for small properties. For healthier pasture and rotational grazing, 2-3 acres per animal is ideal. They're a natural fit for hobby farms, rural homesteads, and any property too small for standard cattle.",
  },
  {
    question: "What's the difference between mini and micro-mini Highland cattle?",
    answer:
      'A standard mini Highland stands 36-42" at the hip as an adult, compact enough for small acreage while still carrying the full Highland look. A micro-mini stands under 36" and is significantly smaller, making them popular as companion animals and for very limited acreage. Micro-minis are typically priced higher due to additional selectivity in breeding. Not sure which size is right? Reach out and we\'ll help you decide.',
  },
  {
    question: "Can you deliver to my state?",
    answer: `We arrange professional livestock transport for buyers across the contiguous United States when routes allow. Delivery goes directly to your farm or a nearby pickup point when available. Contact us at ${brand.email} for a transport quote based on your location.`,
  },
  {
    question: "Are mini Highland cows good for first-time cattle owners?",
    answer:
      "Yes. Mini Highlands are widely regarded as one of the best starter breeds for first-time cattle owners. Their calm temperament, manageable size, and relatively low daily care requirements make them forgiving for beginners. We prioritize regular handling, and our team remains available after purchase to help with feeding, seasonal care, and practical questions.",
  },
  {
    question: "What do mini Highland cows eat?",
    answer:
      "Mini Highlands do well on quality pasture grass as their primary diet, supplemented with hay during winter months or when grazing isn't available. A loose mineral supplement supports overall health, and most owners offer a small amount of grain as a treat or handling reward. Fresh water and access to shade year-round are essential.",
  },
  {
    question: "What health guarantees do you offer?",
    answer:
      "Our published Health Guarantee page describes the coverage windows, buyer responsibilities, and claim process that apply to purchases from Mini Cow Farm. Review that page for the current terms. We do not invent veterinary certifications beyond what we can document for each animal.",
  },
  {
    question: "Can mini Highlands be used for an agricultural tax exemption?",
    answer:
      "In many jurisdictions, owning cattle on a qualifying property can support an agricultural land-use exemption. Requirements vary by state and county. Confirm eligibility with a local tax professional or your county assessor's office before relying on any tax benefit.",
  },
];
