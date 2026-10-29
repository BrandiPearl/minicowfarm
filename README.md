# Mini Cow Farm

Reference-driven rebuild of a miniature Highland cattle farm website, branded as **Mini Cow Farm**.

Stack: Next.js App Router, TypeScript, Tailwind CSS, Supabase (Postgres + Auth), Cloudflare R2, Zod, React Hook Form.

## Stage 1 inventory (reference: highlandminicows.com)

### Pages / routes mirrored

| Reference | Our route |
|---|---|
| Home | `/` |
| Available Mini Cows (`/available-cattle/`) | `/available-mini-cows` |
| Available Donkeys | `/available-donkeys` |
| Animal detail (inline cards on reference) | `/animals/[slug]` |
| Health Guarantee | `/health-guarantee` |
| Shipping & Delivery (`/shipping-and-delivery-policy/`) | `/shipping-and-delivery-policy` |
| Testimonials | `/testimonials` |
| Blog + posts | `/blog`, `/blog/[slug]` |
| Contact Us | `/contact-us` |
| Admin (new) | `/admin/*` |

### Reusable components

- Header (logo text mark, email, horizontal nav, mobile burger)
- Footer (Quick Links + contact)
- Animal card / grid + availability filters
- FAQ accordion
- Testimonial grid
- Inquiry / contact form (honeypot + rate limit)
- Policy markdown renderer
- Admin shell + CRUD forms

### Visual system (from reference Elementor kit)

- Fonts: **DM Sans** (body), **Amatic SC** (display)
- Colors: forest greens `#0E2207` / `#1A5803` / `#23690A`, cream `#F8F6F1`, gold `#DBB41B`
- Content width ~1200px; animal cards portrait (~4:5); FAQ accordion; dark CTA/how-it-works bands

### Could not fully verify against reference

- Exact pixel spacing / Elementor container paddings without live browser screenshots
- Popup inquiry modal behavior (reference uses Elementor popup + WPForms) — we use dedicated detail + contact forms instead
- Pixel-perfect mobile breakpoint nuances beyond tablet burger nav
- Original animal photography (intentionally not copied; use your licensed photos via R2)
- Reference testimonials / certifications are **not** claimed as ours

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Without Supabase env vars, the site runs on a **clearly labeled local demo dataset** (`src/lib/data/demo.ts`). Inquiries are accepted in the UI but only logged (not persisted) until Supabase is configured.

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor (or `supabase db push`).
3. Optionally run `supabase/seed.sql` for sample rows.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

### Create the first administrator (secure)

1. In Supabase Auth, create a user (email/password). Do **not** hardcode credentials in the repo.
2. Promote that user:

```sql
insert into public.admin_profiles (id, email, full_name)
values ('<AUTH_USER_UUID>', 'admin@yourdomain.com', 'Site Admin');
```

3. Sign in at `/admin/login`.

RLS: public can read published content and insert inquiries; only `admin_profiles` users can manage protected tables.

## Cloudflare R2 setup

1. Create an R2 bucket (e.g. `minicowfarm-media`).
2. Create an API token with Object Read & Write.
3. Enable a public bucket URL or custom domain; set `R2_PUBLIC_MEDIA_URL`.
4. Set `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.

Upload flow: authenticated admin calls `POST /api/admin/upload` → short-lived presigned PUT URL → browser uploads directly to R2 → metadata saved in `animal_images`. Secrets never ship to the client.

## Branding defaults

Edit `src/lib/brand.ts` or Admin → Settings:

- Name: Mini Cow Farm
- Email / phone / location: placeholders until you update them
- Colors: derived from the reference palette

## Implemented routes

**Public:** `/`, `/available-mini-cows`, `/available-donkeys`, `/animals/[slug]`, `/health-guarantee`, `/shipping-and-delivery-policy`, `/testimonials`, `/blog`, `/blog/[slug]`, `/contact-us`, `/sitemap.xml`, `/robots.txt`

**API:** `POST /api/inquiries`, `POST /api/admin/upload`

**Admin:** `/admin`, `/admin/login`, `/admin/animals`, `/admin/animals/new`, `/admin/animals/[id]`, `/admin/inquiries`, `/admin/testimonials`, `/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]`, `/admin/policies`, `/admin/settings`

## Deployment

1. Deploy to Vercel / Cloudflare / Node host supporting Next.js 15.
2. Set all env vars from `.env.example`.
3. Apply Supabase migration + create admin profile.
4. Configure R2 public media URL and CORS for PUT from your site origin.
5. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
