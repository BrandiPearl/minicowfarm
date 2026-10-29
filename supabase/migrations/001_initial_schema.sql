-- Mini Cow Farm initial schema
-- Apply with: supabase db push  OR  run in Supabase SQL editor

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.animal_species as enum ('mini_cow', 'donkey');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.animal_status as enum ('available', 'reserved', 'sold', 'draft');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.animal_gender as enum ('male', 'female', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.inquiry_status as enum ('new', 'in_progress', 'responded', 'closed', 'spam');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.publish_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- Admin profiles (1:1 with auth.users)
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

-- Animals
create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  species public.animal_species not null,
  price numeric(12, 2),
  compare_at_price numeric(12, 2),
  currency text not null default 'USD',
  status public.animal_status not null default 'draft',
  gender public.animal_gender not null default 'unknown',
  age_description text,
  color text,
  description text not null default '',
  health_notes text,
  featured boolean not null default false,
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint animals_price_nonnegative check (price is null or price >= 0),
  constraint animals_compare_nonnegative check (compare_at_price is null or compare_at_price >= 0)
);

create index if not exists animals_species_idx on public.animals (species);
create index if not exists animals_status_idx on public.animals (status);
create index if not exists animals_featured_idx on public.animals (featured) where featured = true;
create index if not exists animals_published_idx on public.animals (published) where published = true;

-- Animal images (R2 object keys + public URLs)
create table if not exists public.animal_images (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals (id) on delete cascade,
  object_key text not null,
  url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists animal_images_animal_id_idx on public.animal_images (animal_id);

-- Inquiries / contact
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references public.animals (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null default '',
  status public.inquiry_status not null default 'new',
  source text not null default 'website',
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- Testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  location text,
  body text not null,
  photo_url text,
  display_order integer not null default 0,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Blog
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null,
  cover_image_url text,
  cover_image_key text,
  status public.publish_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_idx on public.blog_posts (status);

-- Policy pages
create table if not exists public.policy_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

-- Site settings (single-row style)
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  location text,
  address_line text,
  tagline text,
  social_tiktok text,
  social_facebook text,
  social_instagram text,
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists animals_set_updated_at on public.animals;
create trigger animals_set_updated_at before update on public.animals
for each row execute function public.set_updated_at();

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at before update on public.inquiries
for each row execute function public.set_updated_at();

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at before update on public.testimonials
for each row execute function public.set_updated_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

-- Auth helper: is current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles p where p.id = auth.uid()
  );
$$;

-- RLS
alter table public.admin_profiles enable row level security;
alter table public.animals enable row level security;
alter table public.animal_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.testimonials enable row level security;
alter table public.blog_posts enable row level security;
alter table public.policy_pages enable row level security;
alter table public.site_settings enable row level security;

-- admin_profiles
drop policy if exists "Admins read own profile" on public.admin_profiles;
create policy "Admins read own profile" on public.admin_profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "Admins update own profile" on public.admin_profiles;
create policy "Admins update own profile" on public.admin_profiles
  for update to authenticated using (id = auth.uid());

-- animals
drop policy if exists "Public read published animals" on public.animals;
create policy "Public read published animals" on public.animals
  for select to anon, authenticated
  using (published = true);

drop policy if exists "Admins manage animals" on public.animals;
create policy "Admins manage animals" on public.animals
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- animal_images
drop policy if exists "Public read images of published animals" on public.animal_images;
create policy "Public read images of published animals" on public.animal_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.animals a
      where a.id = animal_id and a.published = true
    )
  );

drop policy if exists "Admins manage animal images" on public.animal_images;
create policy "Admins manage animal images" on public.animal_images
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- inquiries: public insert only; admins read/update
drop policy if exists "Anyone can submit inquiries" on public.inquiries;
create policy "Anyone can submit inquiries" on public.inquiries
  for insert to anon, authenticated
  with check (true);

drop policy if exists "Admins read inquiries" on public.inquiries;
create policy "Admins read inquiries" on public.inquiries
  for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins update inquiries" on public.inquiries;
create policy "Admins update inquiries" on public.inquiries
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete inquiries" on public.inquiries;
create policy "Admins delete inquiries" on public.inquiries
  for delete to authenticated
  using (public.is_admin());

-- testimonials
drop policy if exists "Public read published testimonials" on public.testimonials;
create policy "Public read published testimonials" on public.testimonials
  for select to anon, authenticated
  using (published = true);

drop policy if exists "Admins manage testimonials" on public.testimonials;
create policy "Admins manage testimonials" on public.testimonials
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- blog
drop policy if exists "Public read published posts" on public.blog_posts;
create policy "Public read published posts" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "Admins manage blog posts" on public.blog_posts;
create policy "Admins manage blog posts" on public.blog_posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- policies
drop policy if exists "Public read policy pages" on public.policy_pages;
create policy "Public read policy pages" on public.policy_pages
  for select to anon, authenticated
  using (true);

drop policy if exists "Admins manage policy pages" on public.policy_pages;
create policy "Admins manage policy pages" on public.policy_pages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- site settings
drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings" on public.site_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
