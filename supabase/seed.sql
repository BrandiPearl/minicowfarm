-- LOCAL DEVELOPMENT SEED ONLY
-- Not real inventory, testimonials, or business guarantees.
-- Run after 001_initial_schema.sql

insert into public.site_settings (
  id, business_name, email, phone, whatsapp, location, address_line, tagline
) values (
  '00000000-0000-4000-8000-000000000001',
  'Mini Cow Farm',
  'hello@minicowfarm.com',
  '+1 (555) 010-2000',
  '+15550102000',
  'United States',
  'By appointment. Contact us for farm location details',
  'Miniature Highland Cattle for Homesteads & Small Farms'
) on conflict (id) do nothing;

insert into public.animals (
  id, slug, name, species, price, compare_at_price, currency, status, gender,
  age_description, color, description, featured, display_order, published
) values
(
  'a1000000-0000-4000-8000-000000000001',
  'maple', 'Maple', 'mini_cow', 2000, 2500, 'USD', 'available', 'female',
  '3 Months', 'Red & White',
  'Seed listing for local development. Replace with real inventory.',
  true, 1, true
),
(
  'a1000000-0000-4000-8000-000000000002',
  'cedar', 'Cedar', 'mini_cow', 1800, 2200, 'USD', 'available', 'male',
  '2 Months', 'Silver Dun',
  'Demo mini bull calf for catalog testing.',
  true, 2, true
),
(
  'a1000000-0000-4000-8000-000000000005',
  'bella-jenny', 'Bella', 'donkey', 1500, null, 'USD', 'available', 'female',
  '4 Months', 'Brown & White',
  'Demo miniature jenny for Available Donkeys.',
  false, 1, true
)
on conflict (id) do nothing;

insert into public.animal_images (animal_id, object_key, url, display_order, is_primary)
values
('a1000000-0000-4000-8000-000000000001', 'demo/maple.jpg', 'https://images.unsplash.com/photo-1570042226335-4c8c7e9f3f0b?w=800&q=80', 0, true),
('a1000000-0000-4000-8000-000000000002', 'demo/cedar.jpg', 'https://images.unsplash.com/photo-1546445317-132b5545f4fb?w=800&q=80', 0, true),
('a1000000-0000-4000-8000-000000000005', 'demo/bella.jpg', 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=800&q=80', 0, true);

insert into public.testimonials (customer_name, location, body, display_order, published, featured)
values
('Sample Customer A', 'Example State', 'Placeholder testimonial for UI testing. Replace with authentic approved stories.', 1, true, true),
('Sample Customer B', 'Example State', 'Second placeholder testimonial. Do not publish as a real review.', 2, true, true);

insert into public.blog_posts (
  slug, title, excerpt, body, cover_image_url, status, seo_title, seo_description, published_at
) values (
  'mini-highland-cow-care-basics',
  'Mini Highland Cow Care Basics: Feeding, Shelter & Daily Routines',
  'A practical starter overview for miniature Highland cattle on small acreage.',
  E'## Getting started\n\nEducational sample content for local development.',
  'https://images.unsplash.com/photo-1500595046743-cd271d973d8b?w=1200&q=80',
  'published',
  'Mini Highland Cow Care Basics | Mini Cow Farm',
  'Learn the basics of feeding, shelter, and daily care for miniature Highland cattle.',
  now()
) on conflict (slug) do nothing;

insert into public.policy_pages (slug, title, body, seo_title, seo_description)
values
(
  'health-guarantee',
  'Our Mini Highland Cattle Health Guarantee',
  E'Template health policy. Edit in Admin before publishing as binding terms.\n\n## Contact\nhello@minicowfarm.com',
  'Health Guarantee | Mini Cow Farm',
  'Configurable health policy for Mini Cow Farm.'
),
(
  'shipping-and-delivery-policy',
  'Shipping & Delivery Policy: Nationwide Livestock Transport',
  E'Template shipping policy. Edit coverage areas, fees, and timelines in Admin.',
  'Shipping & Delivery Policy | Mini Cow Farm',
  'Editable delivery policy for Mini Cow Farm.'
)
on conflict (slug) do nothing;

-- After creating the first Auth user in Supabase Dashboard, promote them:
-- insert into public.admin_profiles (id, email, full_name)
-- values ('<auth-user-uuid>', 'admin@minicowfarm.com', 'Site Admin');
