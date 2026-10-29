/**
 * Import animal listings from highlandminicows.com into Mini Cow Farm
 * (Supabase + Cloudflare R2).
 *
 * Usage: node --env-file=.env.local scripts/import-from-reference.mjs
 *
 * NOTE: Uses publicly available listing content/photos from the reference
 * site for rebuild/demo purposes. Replace with your own inventory before launch
 * if you do not own those assets.
 */
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "crypto";
import { extname } from "path";

const REF = {
  cows: "https://highlandminicows.com/available-cattle/",
  donkeys: "https://highlandminicows.com/available-donkeys/",
};

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_MEDIA_URL",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing env: ${key}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function parseMoney(text) {
  if (!text) return null;
  const matches = [...text.matchAll(/\$\s*([\d,]+(?:\.\d{2})?)/g)].map((m) =>
    Number(m[1].replace(/,/g, "")),
  );
  if (!matches.length) return null;
  // Prefer the lower/current price when sale + struck prices appear
  return Math.min(...matches);
}

function parseComparePrice(text) {
  if (!text) return null;
  const matches = [...text.matchAll(/\$\s*([\d,]+(?:\.\d{2})?)/g)].map((m) =>
    Number(m[1].replace(/,/g, "")),
  );
  if (matches.length < 2) return null;
  const current = Math.min(...matches);
  const higher = Math.max(...matches);
  return higher > current ? higher : null;
}

const FACT_LABELS = "Price|Status|Gender|Age|Color";

function field(text, label) {
  // Cheerio often flattens block text without newlines, so stop at the next
  // known label instead of reading to end-of-line.
  const re = new RegExp(
    `${label}\\s*:\\s*(.+?)(?=\\s*(?:${FACT_LABELS})\\s*:|$)`,
    "is",
  );
  const m = text.match(re);
  if (!m) return null;
  return m[1].trim().replace(/\s+/g, " ").slice(0, 500);
}

/** Color is followed by freeform description with no label, cut at the name. */
function parseColor(text, name) {
  let color = field(text, "Color");
  if (!color) return null;
  if (name) {
    const idx = color.indexOf(name);
    if (idx > 0) color = color.slice(0, idx).trim();
  }
  // Fallback: "...Markings Herman is an adorable..."
  const prose = color.search(/\s+[A-Z][\w'&]*(?:\s(?:&|and)\s[A-Z][\w']*)*\s+is\s+(?:an?\s+)?(?:adorable|beautiful|fluffy|charming|handsome|stunning|true|bold|ready|\d)/i);
  if (prose > 0) color = color.slice(0, prose).trim();
  return color.slice(0, 120) || null;
}

function parseStatus(raw) {
  const s = (raw || "").toLowerCase();
  if (s.includes("sold")) return "sold";
  if (s.includes("reserved") || s.includes("placed")) return "reserved";
  if (s.includes("available")) return "available";
  return "available";
}

function parseGender(raw, species) {
  const s = (raw || "").toLowerCase();
  if (species === "donkey") {
    if (s.includes("jenny") || s.includes("female")) return "female";
    if (s.includes("jack") || s.includes("male")) return "male";
  }
  if (s.includes("female") || s.includes("heifer")) return "female";
  if (s.includes("male") || s.includes("bull")) return "male";
  return "unknown";
}

function largestUploadUrl(src, srcset) {
  if (srcset) {
    const parts = srcset.split(",").map((p) => p.trim().split(/\s+/));
    const sorted = parts
      .map(([url, size]) => ({ url, w: Number((size || "0w").replace("w", "")) || 0 }))
      .sort((a, b) => b.w - a.w);
    if (sorted[0]?.url) return sorted[0].url;
  }
  // Prefer full-size by stripping -NNNxNNN before extension when possible
  return src.replace(/-\d+x\d+(?=\.(jpe?g|png|webp|gif)$)/i, "");
}

function isAnimalImage(src) {
  if (!src.includes("/wp-content/uploads/")) return false;
  if (/\/w-\d+x\d+\./.test(src)) return false;
  if (src.includes("cropped-w")) return false;
  if (src.includes("submit-spin")) return false;
  return true;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "MiniCowFarmImporter/1.0 (+local rebuild; contact hello@minicowfarm.com)",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function parseListings(html, species) {
  const $ = cheerio.load(html);
  const animals = [];

  $("h4").each((_, el) => {
    const name = $(el).text().replace(/\s+/g, " ").trim();
    if (!name || name.length > 60) return;
    if (/quick links|testimonials|contact/i.test(name)) return;

    // Climb to a container that also holds an image + price text
    let node = $(el);
    let container = null;
    for (let i = 0; i < 8; i++) {
      node = node.parent();
      if (!node.length) break;
      const text = node.text();
      const hasPrice = /Price\s*:/i.test(text) || /\$\s*\d/.test(text);
      const hasImg = node.find("img").toArray().some((img) => {
        const src = $(img).attr("src") || "";
        return isAnimalImage(src);
      });
      if (hasPrice && hasImg) {
        container = node;
        break;
      }
    }
    if (!container) return;

    const text = container
      .text()
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n+/g, "\n")
      .trim();

    // Description: after Color/Age block or after name
    let description = "";
    const afterColor = text.split(/Color\s*:[^\n]*/i)[1];
    if (afterColor) {
      description = afterColor.replace(/^\s*/, "").trim();
    } else {
      description = text
        .replace(name, "")
        .replace(/Price\s*:[^\n]*/gi, "")
        .replace(/Status\s*:[^\n]*/gi, "")
        .replace(/Gender\s*:[^\n]*/gi, "")
        .replace(/Age\s*:[^\n]*/gi, "")
        .replace(/Color\s*:[^\n]*/gi, "")
        .trim();
    }
    // Strip noisy AI/chat artifacts if present
    description = description
      .split(/\n/)
      .filter((line) => !/chatgpt|conversation-turn|message-timestamp/i.test(line))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);

    // Prefer the first nearby animal photo only (Elementor nesting can otherwise
    // pull dozens of sibling listing images into one card).
    const images = [];
    container.find("img").each((__, img) => {
      if (images.length >= 1) return;
      const src = $(img).attr("src") || "";
      const srcset = $(img).attr("srcset") || "";
      if (!isAnimalImage(src)) return;
      images.push({
        url: largestUploadUrl(src, srcset),
        alt: ($(img).attr("alt") || name).trim(),
      });
    });

    const statusRaw = field(text, "Status");
    const genderRaw = field(text, "Gender");
    const age = field(text, "Age");
    const color = parseColor(text, name);
    const priceText = field(text, "Price") || text;

    animals.push({
      name,
      slug: `${slugify(name)}-${species === "donkey" ? "donkey" : "mini-cow"}`,
      species,
      price: parseMoney(priceText) ?? parseMoney(text),
      compare_at_price: parseComparePrice(text),
      status: parseStatus(statusRaw || text),
      gender: parseGender(genderRaw || text, species),
      age_description: age,
      color,
      description: description || `${name} listing imported from reference catalog.`,
      images,
    });
  });

  // Dedupe by slug
  const seen = new Set();
  return animals.filter((a) => {
    if (seen.has(a.slug)) return false;
    seen.add(a.slug);
    return true;
  });
}

async function uploadImage(imageUrl, folder, slug) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": "MiniCowFarmImporter/1.0" },
  });
  if (!res.ok) throw new Error(`Download failed ${imageUrl}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  let ext = extname(new URL(imageUrl).pathname).toLowerCase();
  if (!ext || ext.length > 5) {
    if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("webp")) ext = ".webp";
    else ext = ".jpg";
  }
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 10);
  const objectKey = `${folder}/${slug}-${hash}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
      Body: buf,
      ContentType: contentType.split(";")[0],
    }),
  );

  return {
    objectKey,
    publicUrl: `${process.env.R2_PUBLIC_MEDIA_URL.replace(/\/$/, "")}/${objectKey}`,
  };
}

const TEXT_ONLY = process.argv.includes("--text-only");

async function upsertAnimal(animal, index, featuredLimit) {
  const featured = animal.species === "mini_cow" && animal.status === "available" && index < featuredLimit;

  const row = {
    slug: animal.slug,
    name: animal.name,
    species: animal.species,
    price: animal.price,
    compare_at_price: animal.compare_at_price,
    currency: "USD",
    status: animal.status,
    gender: animal.gender,
    age_description: animal.age_description,
    color: animal.color,
    description: animal.description,
    health_notes: null,
    featured,
    display_order: index + 1,
    published: true,
  };

  const { data: existing } = await supabase
    .from("animals")
    .select("id")
    .eq("slug", animal.slug)
    .maybeSingle();

  let animalId;
  if (existing?.id) {
    const { error } = await supabase.from("animals").update(row).eq("id", existing.id);
    if (error) throw error;
    animalId = existing.id;
    if (!TEXT_ONLY) {
      await supabase.from("animal_images").delete().eq("animal_id", animalId);
    }
  } else {
    const { data, error } = await supabase.from("animals").insert(row).select("id").single();
    if (error) throw error;
    animalId = data.id;
  }

  if (TEXT_ONLY) {
    return { animalId, images: 0 };
  }

  const imageRows = [];
  for (let i = 0; i < animal.images.length; i++) {
    const img = animal.images[i];
    try {
      const uploaded = await uploadImage(img.url, "animals", animal.slug);
      imageRows.push({
        animal_id: animalId,
        object_key: uploaded.objectKey,
        url: uploaded.publicUrl,
        alt_text: img.alt || animal.name,
        display_order: i,
        is_primary: i === 0,
      });
      process.stdout.write(".");
    } catch (err) {
      console.warn(`\n  image failed for ${animal.name}: ${err.message}`);
    }
  }

  if (imageRows.length) {
    const { error } = await supabase.from("animal_images").insert(imageRows);
    if (error) throw error;
  }

  return { animalId, images: imageRows.length };
}

async function ensureSiteBasics() {
  const { count } = await supabase
    .from("site_settings")
    .select("*", { count: "exact", head: true });
  if (!count) {
    await supabase.from("site_settings").insert({
      business_name: "Mini Cow Farm",
      email: "hello@minicowfarm.com",
      phone: "+1 (555) 010-2000",
      whatsapp: "+15550102000",
      location: "United States",
      address_line: "By appointment. Contact us for farm location details",
      tagline: "Miniature Highland Cattle for Homesteads & Small Farms",
    });
  }

  const policies = [
    {
      slug: "health-guarantee",
      title: "Our Mini Highland Cattle Health Guarantee",
      seo_title: "Health Guarantee | Mini Cow Farm",
      seo_description: "Health coverage terms for Mini Cow Farm purchases.",
      body: `Template health policy imported as a starting point. Edit in Admin → Policies before treating as binding.

## Contact
hello@minicowfarm.com`,
    },
    {
      slug: "shipping-and-delivery-policy",
      title: "Shipping & Delivery Policy: Nationwide Livestock Transport",
      seo_title: "Shipping & Delivery Policy | Mini Cow Farm",
      seo_description: "Delivery coverage and transport process for Mini Cow Farm.",
      body: `Template shipping policy. Edit service areas, fees, and timelines in Admin → Policies.

## Contact
hello@minicowfarm.com`,
    },
  ];

  for (const p of policies) {
    const { data } = await supabase.from("policy_pages").select("id").eq("slug", p.slug).maybeSingle();
    if (data) await supabase.from("policy_pages").update(p).eq("id", data.id);
    else await supabase.from("policy_pages").insert(p);
  }
}

async function main() {
  console.log("Fetching reference catalogs…");
  const [cowsHtml, donkeysHtml] = await Promise.all([
    fetchHtml(REF.cows),
    fetchHtml(REF.donkeys),
  ]);

  const cows = parseListings(cowsHtml, "mini_cow");
  const donkeys = parseListings(donkeysHtml, "donkey");
  console.log(`Parsed ${cows.length} cows, ${donkeys.length} donkeys`);

  if (!cows.length && !donkeys.length) {
    console.error("No animals parsed, aborting.");
    process.exit(1);
  }

  await ensureSiteBasics();

  let ok = 0;
  let fail = 0;

  console.log("\nImporting mini cows");
  for (let i = 0; i < cows.length; i++) {
    const a = cows[i];
    process.stdout.write(`\n[${i + 1}/${cows.length}] ${a.name} `);
    try {
      const result = await upsertAnimal(a, i, 6);
      process.stdout.write(` ok (${result.images} imgs)`);
      ok += 1;
    } catch (err) {
      process.stdout.write(` FAIL ${err.message}`);
      fail += 1;
    }
  }

  console.log("\n\nImporting donkeys");
  for (let i = 0; i < donkeys.length; i++) {
    const a = donkeys[i];
    process.stdout.write(`\n[${i + 1}/${donkeys.length}] ${a.name} `);
    try {
      const result = await upsertAnimal(a, i, 0);
      process.stdout.write(` ok (${result.images} imgs)`);
      ok += 1;
    } catch (err) {
      process.stdout.write(` FAIL ${err.message}`);
      fail += 1;
    }
  }

  const { count: animalCount } = await supabase
    .from("animals")
    .select("*", { count: "exact", head: true });
  const { count: imageCount } = await supabase
    .from("animal_images")
    .select("*", { count: "exact", head: true });

  console.log(`\n\nDone. imported_ok=${ok} failed=${fail} db_animals=${animalCount} db_images=${imageCount}`);
  console.log("Idempotent: re-run updates by slug and replaces images.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
