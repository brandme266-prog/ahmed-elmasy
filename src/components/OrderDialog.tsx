import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useSiteSettings } from "@/hooks/useSiteSettings";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string } | null;
}

const OrderDialog = ({ open, onOpenChange, product }: OrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", quantity: 1 });
  const { data: settings } = useSiteSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    const { error } = await supabase.from("orders").insert({
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email || null,
      product_id: product.id,
      product_name: product.name,
      quantity: form.quantity,
      notes: form.notes || null,
      status: 'pending'
    });
    setLoading(false);
    if (error) {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } else {
      // Construction of WhatsApp message
      const rawwhatsapp = settings?.whatsapp?.replace(/[^0-9]/g, '') || "";
      const whatsappNumber = rawwhatsapp.startsWith('01') ? `20${rawwhatsapp}` : rawwhatsapp;
      if (!whatsappNumber) {
        toast.error("رقم الواتساب غير مهيأ، يرجى التواصل مع الإدارة");
        return;
      }
      const message = `طلب جديد من ${settings?.site_name || "متجر احمد الماسي العطور"}:\n` +
        `الاسم: ${form.name}\n` +
        `الهاتف: ${form.phone}\n` +
        `المنتج: ${product.name}\n` +
        `الكمية: ${form.quantity}\n` +
        (form.notes ? `ملاحظات: ${form.notes}` : "");
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      toast.success("تم إرسال طلبك بنجاح! جاري تحويلك للواتساب...");
      
      // Delay redirection slightly to let the toast show
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        setForm({ name: "", phone: "", email: "", notes: "", quantity: 1 });
        onOpenChange(false);
      }, 1500);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-cairo text-xl">طلب منتج: {product?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="الاسم الكامل *"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="font-cairo"
          />
          <Input
            placeholder="رقم الهاتف *"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="font-cairo"
            dir="ltr"
          />
          <Input
            placeholder="البريد الإلكتروني (اختياري)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="font-cairo"
            dir="ltr"
          />
          <Input
            type="number"
            min={1}
            placeholder="الكمية"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
            className="font-cairo"
          />
          <Textarea
            placeholder="ملاحظات إضافية"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="font-cairo"
          />
          <Button type="submit" className="w-full font-cairo" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد الطلب"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
