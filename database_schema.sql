-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  excerpt text,
  image_url text,
  is_published boolean DEFAULT false NOT NULL,
  published_at timestamp with time zone,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS article_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  email text,
  is_approved boolean DEFAULT false NOT NULL,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  image_url text,
  is_active boolean DEFAULT true NOT NULL,
  link text,
  sort_order integer DEFAULT 0 NOT NULL,
  subtitle text,
  title text NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  icon text,
  name text NOT NULL,
  slug text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  description text,
  image_url text,
  image_urls text[] DEFAULT '{}',
  is_active boolean DEFAULT true NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL,
  unit text DEFAULT 'كجم',
  stock_quantity integer DEFAULT 100,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  email text,
  is_read boolean DEFAULT false NOT NULL,
  message text NOT NULL,
  name text NOT NULL,
  phone text
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  link text,
  message text NOT NULL,
  title text NOT NULL,
  type text NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_email text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  notes text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  status text NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  description text NOT NULL,
  icon text,
  image_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  title text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  user_id uuid NOT NULL -- Assuming referencing auth.users(id) manually if needed
);

CREATE TABLE IF NOT EXISTS site_settings (
  id boolean PRIMARY KEY DEFAULT TRUE,
  whatsapp text,
  email text,
  facebook text,
  instagram text,
  tiktok text,
  google_site_verification text,
  site_name text DEFAULT ''
  site_description text,
  logo_url text,
  favicon_url text,
  hero_image text,
  about_image text,
  features_image text,
  footer_image text,
  header_scripts text,
  footer_scripts text,
  features_title text,
  features_bottom_text text,
  features_list jsonb DEFAULT '[]',
  home_stats jsonb DEFAULT '[{"icon": "Users", "value": "", "label": ""}, {"icon": "Award", "value": "", "label": ""}, {"icon": "Shield", "value": "", "label": ""}, {"icon": "Leaf", "value": "", "label": ""}]',
  CONSTRAINT single_row CHECK (id)
);

-- Initialize with the user's whatsapp number
INSERT INTO site_settings (id, whatsapp) VALUES (true, '01000592469') ON CONFLICT (id) DO UPDATE SET whatsapp = EXCLUDED.whatsapp;

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  role text,
  text text NOT NULL,
  rating integer DEFAULT 5,
  image_url text
);

CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  path text,
  user_agent text,
  ip_hash text,
  referrer text
);

-- 3. Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies
DO $$ BEGIN
    CREATE POLICY "Public can view published articles" ON articles FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public can view active banners" ON banners FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read settings" ON site_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public can view testimonials" ON testimonials FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public can insert page views" ON page_views FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. Helper Function for Admin Roles
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

-- Admin manage policies
DO $$ BEGIN
    CREATE POLICY "Admins can manage articles" ON articles FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage banners" ON banners FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage products" ON products FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage contact messages" ON contact_messages FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage services" ON services FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view page views" ON page_views FOR SELECT USING (public.has_role('admin', auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;
