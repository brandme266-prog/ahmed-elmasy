DO $$ 
DECLARE
  flour_id uuid := gen_random_uuid();
  sugar_id uuid := gen_random_uuid();
  pasta_id uuid := gen_random_uuid();
  spices_id uuid := gen_random_uuid();
  rice_id uuid := gen_random_uuid();
BEGIN
  -- 1. مسح جميع البيانات القديمة (السمارت هوم)
  DELETE FROM products;
  DELETE FROM categories;
  DELETE FROM articles;

  -- 2. إدخال الأقسام الجديدة للمنتجات الغذائية
  INSERT INTO categories (id, name, slug, icon) VALUES 
    (flour_id, 'دقيق', 'flour', '🌾'),
    (sugar_id, 'سكر', 'sugar', '🧂'),
    (pasta_id, 'مكرونات', 'pasta', '🍝'),
    (spices_id, 'توابل وبهارات', 'spices', '🌶️'),
    (rice_id, 'أرز', 'rice', '🍚');

  -- 3. إدخال منتجات الدقيق
  INSERT INTO products (name, description, price, category_id, image_url, is_active) VALUES
  ('دقيق قمح استخراج 72%', 'دقيق فاخر متعدد الاستخدامات للمخبوزات والحلويات.', 35, flour_id, 'https://images.unsplash.com/photo-1627485937980-221c88ce04ea', true),
  ('دقيق بيتزا مخصص', 'دقيق بنسبة بروتين عالية مخصص للبيتزا الإيطالية.', 42, flour_id, 'https://images.unsplash.com/photo-1509440159596-0249088772ff', true),
  ('دقيق أسمر بلدي', 'دقيق قمح كامل غني بالألياف لخبز صحي.', 30, flour_id, 'https://images.unsplash.com/photo-1596791993467-bc18b06cbaa2', true),
  ('دقيق حلويات اسفنجي', 'دقيق خفيف مخصص للكيك الإسفنجي.', 45, flour_id, 'https://images.unsplash.com/photo-1589178972403-12826ea145ea', true);

  -- 4. إدخال منتجات السكر
  INSERT INTO products (name, description, price, category_id, image_url, is_active) VALUES
  ('سكر أبيض نقي 1 كجم', 'سكر ناعم محلي 100٪ بدون تكتلات.', 40, sugar_id, 'https://images.unsplash.com/photo-1581428982868-e410dd127a90', true),
  ('سكر بودرة 500 جم', 'سكر بودرة مطحون جاهز لاستخدامات الحلويات والمخبوزات.', 25, sugar_id, 'https://images.unsplash.com/photo-1621323386616-6ece5bef4d3c', true),
  ('سكر بني 1 كجم', 'سكر بني غني بدبس السكر الطبيعي.', 65, sugar_id, 'https://images.unsplash.com/photo-1610484734796-03fcb305fc6a', true);

  -- 5. إدخال منتجات المكرونة
  INSERT INTO products (name, description, price, category_id, image_url, is_active) VALUES
  ('مكرونة بيني 400 جم', 'مكرونة عالية الجودة لطبق باسطا تقليدي رائع.', 18, pasta_id, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141', true),
  ('مكرونة اسباجيتي 400 جم', 'مكرونة اسباجيتي طويلة لا تتعجن أثناء الطهي.', 18, pasta_id, 'https://images.unsplash.com/photo-1589227365533-cee630bd59bd', true),
  ('مكرونة حلزونية 400 جم', 'مكرونة سريعة التحضير مثالية مع الصوص.', 19, pasta_id, 'https://images.unsplash.com/photo-1612800155099-04bb7fa3ad14', true);

  -- 6. إدخال منتجات التوابل
  INSERT INTO products (name, description, price, category_id, image_url, is_active) VALUES
  ('فلفل أسود مطحون 100 جم', 'فلفل أسود ذو رائحة نفاذة وطعم قوي.', 50, spices_id, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', true),
  ('كمون بلدي ناعم 100 جم', 'كمون ناعم وممتاز لا غنى عنه.', 40, spices_id, 'https://images.unsplash.com/photo-1536993139886-53d9e4876baf', true),
  ('كزبرة ناشفة 100 جم', 'كزبرة بلدي أصلية لرفع مستوى المذاق.', 30, spices_id, 'https://images.unsplash.com/photo-1506459346610-d0232490b6ef', true);

  -- 7. إدخال منتجات الأرز
  INSERT INTO products (name, description, price, category_id, image_url, is_active) VALUES
  ('أرز مصري قفص الذهبي 5 كجم', 'أرز مصري عريض الحبة، ناصع البياض ومنقى بعناية.', 175, rice_id, 'https://images.unsplash.com/photo-1586201327105-045763071b7f', true),
  ('أرز بسمتي هندي طويل الحبة 1 كجم', 'أرز بسمتي فاخر للكبسة والأطباق الخليجية.', 95, rice_id, 'https://images.unsplash.com/photo-1591814441614-7cf7382d939b', true);

  -- 8. إدخال مقالات وهمية (غذائية)
  INSERT INTO articles (title, slug, excerpt, content, image_url, is_published, author) VALUES
  ('فوائد مذهلة للسكر البني الطبيعي', 'brown-sugar-benefits', 'تعرف على الفوائد المذهلة للسكر البني وكيف يحسن من صحتك ويضيف نكهة لا تقاوم لمخبوزاتك.', 'محتوى المقال...', 'https://images.unsplash.com/photo-1610484734796-03fcb305fc6a', true, 'إدارة جنّة'),
  ('دليلك الكامل لاختيار الدقيق المناسب', 'flour-types-guide', 'كل ما تحتاج لمعرفته عن أنواع الدقيق واستخداماته المختلفة للحصول على أفضل النتائج في المطبخ.', 'محتوى المقال...', 'https://images.unsplash.com/photo-1627485937980-221c88ce04ea', true, 'إدارة جنّة');
END $$;
