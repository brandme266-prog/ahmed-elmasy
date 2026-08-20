-- 1. تفعيل إضافة pg_net (المسؤولة عن إرسال طلبات الإنترنت من قاعدة البيانات)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. إنشاء دالة (Function) لإرسال الإيميل
CREATE OR REPLACE FUNCTION send_order_email_to_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- إرسال البيانات عبر خدمة FormSubmit المجانية للإيميل الأول
  PERFORM net.http_post(
    url := 'https://formsubmit.co/ajax/Ahmedalmassy17@gmail.com',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'اسم العميل', NEW.customer_name,
      'رقم الهاتف', NEW.customer_phone,
      'اسم المنتج', NEW.product_name,
      'الكمية', NEW.quantity,
      'العنوان', COALESCE(NEW.customer_address, 'غير متوفر'),
      'ملاحظات', COALESCE(NEW.notes, 'لا يوجد'),
      '_subject', '🛍️ طلب جديد من متجر أحمد الماسي'
    )
  );

  -- إرسال نفس البيانات للإيميل الثاني
  PERFORM net.http_post(
    url := 'https://formsubmit.co/ajax/ugihd32@gmail.com',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'اسم العميل', NEW.customer_name,
      'رقم الهاتف', NEW.customer_phone,
      'اسم المنتج', NEW.product_name,
      'الكمية', NEW.quantity,
      'العنوان', COALESCE(NEW.customer_address, 'غير متوفر'),
      'ملاحظات', COALESCE(NEW.notes, 'لا يوجد'),
      '_subject', '🛍️ طلب جديد من متجر أحمد الماسي'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. إنشاء الزناد (Trigger) الذي يعمل تلقائياً عند إضافة أي طلب جديد
DROP TRIGGER IF EXISTS trigger_send_order_email ON orders;
CREATE TRIGGER trigger_send_order_email
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION send_order_email_to_admin();
