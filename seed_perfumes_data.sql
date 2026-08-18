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
  ('كيف تختار العطر المناسب لشخصيتك؟', 'how-to-choose-perfume', 'العطر هو البصمة غير المرئية التي تتركها خلفك. تعرف على كيفية اختيار العطر الذي يعبر عنك.', 'العطور ليست مجرد رائحة زكية... محتوى المقال...', 'https://images.unsplash.com/photo-1594035910387-fea47794261f', true, 'خبراء العطور'),
  ('الفرق بين العطور الصيفية والشتوية', 'summer-vs-winter-perfumes', 'تعرف على النوتات العطرية المناسبة لكل فصل لتتألق برائحة مميزة طوال العام.', 'في الصيف نحتاج إلى عطور منعشة... محتوى المقال...', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75', true, 'خبراء العطور');
END $$;
