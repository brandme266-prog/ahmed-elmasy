-- 1. إضافة عمود slug إلى جدول المنتجات
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. تحديث المنتجات القديمة ليكون لها slug تلقائياً بناءً على اسمها (استبدال المسافات بالشرطات)
UPDATE products 
SET slug = REPLACE(name, ' ', '-');
