-- =========================================================================
-- Part 1: Database Schema (Tables, Enums, RLS Policies)
-- =========================================================================

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
  site_name text DEFAULT 'أريج للعطور',
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


-- =========================================================================
-- Part 2: Seed Data (Categories, Products, Articles)
-- =========================================================================

DO $$ 
DECLARE
  men_id uuid := gen_random_uuid();
  women_id uuid := gen_random_uuid();
  unisex_id uuid := gen_random_uuid();
  oud_id uuid := gen_random_uuid();
  gift_id uuid := gen_random_uuid();
BEGIN
  -- 1. مسح جميع البيانات القديمة
  DELETE FROM products;
  DELETE FROM categories;
  DELETE FROM articles;

  -- 2. إدخال الأقسام الجديدة للعطور
  INSERT INTO categories (id, name, slug, icon) VALUES 
    (men_id, 'عطور رجالية', 'men', '👔'),
    (women_id, 'عطور نسائية', 'women', '👗'),
    (unisex_id, 'عطور للجنسين', 'unisex', '✨'),
    (oud_id, 'عطور العود', 'oud', '🪵'),
    (gift_id, 'باقات الهدايا', 'gifts', '🎁');

  -- 3. إدخال عطور رجالية
  INSERT INTO products (name, description, price, category_id, image_url, is_active, unit) VALUES
  ('عطر أورورا بلاك', 'عطر رجالي فخم يجمع بين الأخشاب الداكنة والتوابل الحارة لجاذبية لا تقاوم.', 450, men_id, 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75', true, '50 مل'),
  ('عطر بلو أوشن', 'عطر منعش برائحة نسيم البحر والحمضيات المنعشة، مثالي للاستخدام اليومي.', 320, men_id, 'https://images.unsplash.com/photo-1523293115678-d2900f52f5a2', true, '100 مل'),
  ('عطر ليدر كلاسيك', 'رائحة الجلود الكلاسيكية مع لمسة من العنبر تعبر عن الأناقة والقوة.', 520, men_id, 'https://images.unsplash.com/photo-1594035910387-fea47794261f', true, '75 مل');

  -- 4. إدخال عطور نسائية
  INSERT INTO products (name, description, price, category_id, image_url, is_active, unit) VALUES
  ('عطر روز جولد', 'عطر نسائي رقيق بنفحات الورود والياسمين ليعطيكِ إحساساً بالأنوثة الطاغية.', 380, women_id, 'https://images.unsplash.com/photo-1590736969955-71cc94801759', true, '50 مل'),
  ('عطر فلورا', 'مزيج ساحر من الزهور الاستوائية والفانيليا الدافئة.', 410, women_id, 'https://images.unsplash.com/photo-1541643600914-78b084683601', true, '100 مل'),
  ('عطر ليالي الشرق', 'عطر سهرة فاخر بنكهة العنبر والمسك الساحر.', 490, women_id, 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc', true, '50 مل');

  -- 5. إدخال عطور العود
  INSERT INTO products (name, description, price, category_id, image_url, is_active, unit) VALUES
  ('عود ملكي فاخر', 'دهن عود نقي معتق لسنوات ليمنحك رائحة فخمة تدوم طويلاً.', 1200, oud_id, 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f', true, 'تولة'),
  ('عطر عود الصندل', 'مزيج رائع بين خشب الصندل والعود لأصحاب الذوق الرفيع.', 650, oud_id, 'https://images.unsplash.com/photo-1595425970377-c9703c48657a', true, '100 مل');

  -- 6. إدخال مقالات
  INSERT INTO articles (title, slug, excerpt, content, image_url, is_published, author) VALUES
  ('كيف تختار العطر المناسب لشخصيتك؟', 'how-to-choose-perfume', 'العطر هو البصمة غير المرئية التي تتركها خلفك. تعرف على كيفية اختيار العطر الذي يعبر عنك.', 'اختيار العطر ليس مجرد اختيار رائحة جميلة، بل هو تعبير عن شخصيتك وحالتك المزاجية.\n\nالخطوة الأولى هي فهم العائلات العطرية: الزهرية، الشرقية، الخشبية، والحمضية. إذا كنت شخصية كلاسيكية هادئة، فالعطور الزهرية والخشبية تناسبك. أما إذا كنت تبحث عن الحضور القوي والجاذبية، فالعطور الشرقية التي تحتوي على العود والعنبر هي الخيار الأمثل.\n\nالخطوة الثانية: جرب العطر دائماً على بشرتك ولا تعتمد فقط على شريط الاختبار، وانتظر بضع دقائق حتى تظهر النوتات الأساسية للعطر وتتفاعل مع كيمياء جسمك.\n\nأخيراً، اجعل عطرك توقيعك الشخصي الذي يتذكره الناس بمجرد حضورك.', 'https://images.unsplash.com/photo-1594035910387-fea47794261f', true, 'خبراء العطور'),
  ('الفرق بين العطور الصيفية والشتوية', 'summer-vs-winter-perfumes', 'تعرف على النوتات العطرية المناسبة لكل فصل لتتألق برائحة مميزة طوال العام.', 'اختيار العطر المناسب للفصل المناسب يعزز من حضورك ويزيد من جاذبيتك.\n\nفي فصل الصيف، ترتفع درجات الحرارة وتزداد نسبة الرطوبة، مما يجعل العطور الثقيلة مزعجة. لذلك، يُفضل استخدام العطور الصيفية التي تعتمد على النوتات المنعشة مثل الحمضيات (الليمون، البرغموت، والبرتقال)، النوتات المائية، والزهور الخفيفة. هذه النوتات تمنحك شعوراً بالانتعاش والنظافة طوال اليوم.\n\nأما في فصل الشتاء، فالأجواء الباردة تسمح للعطور بالتطور ببطء على البشرة. هنا تتألق العطور الشتوية التي تعتمد على النوتات الدافئة والعميقة مثل الأخشاب، التوابل (القرفة والهيل)، والعنبر والعود. هذه المكونات تمنحك إحساساً بالدفء والفخامة، وتدوم لفترات طويلة.\n\nنصيحة: لا تتردد في تغيير عطرك مع تغير الفصول، فالعطر هو انعكاس لمزاجك وحالة الطقس من حولك.', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75', true, 'خبراء العطور');
END $$;
