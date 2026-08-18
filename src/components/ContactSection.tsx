import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const ContactSection = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const { data: settings } = useSiteSettings();

  const contactInfo = [
    { icon: Phone, title: "اتصل بنا", value: settings?.whatsapp || "+20 123 456 7890", dir: "ltr" as const },
    { icon: Mail, title: "البريد الإلكتروني", value: settings?.email || "info.ganna1@gmail.com" },
    { icon: MapPin, title: "العنوان", value: settings?.address || "مصر - القاهرة" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name, phone: form.phone || null, email: form.email || null, message: form.message,
    });
    setLoading(false);
    if (error) { toast.error("حدث خطأ، حاول مرة أخرى"); } else {
      toast.success("تم إرسال رسالتك بنجاح!");
      setForm({ name: "", phone: "", email: "", message: "" });
    }
  };

  return (
    <section id="contact" className="py-20 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/3 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/3 rounded-full blur-[80px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground mb-4">
            <span className="text-gradient">تواصل معنا</span>
          </h2>
          <p className="text-muted-foreground font-cairo max-w-2xl mx-auto">
            نحن هنا لخدمتك! تواصل معنا للاستفسار عن منتجاتنا أو تقديم طلبك الآن
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-6">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-card rounded-2xl p-8 text-center border border-border group hover:border-primary/30 transition-all duration-300"
                style={{ boxShadow: "var(--card-shadow)" }}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110" style={{ background: "var(--premium-gradient)" }}>
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-cairo font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground font-cairo" dir={item.dir}>{item.value}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="bg-card rounded-2xl p-8 border border-border"
            style={{ boxShadow: "var(--card-shadow)" }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-cairo font-bold text-foreground text-xl mb-6">أرسل لنا رسالة</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="الاسم *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="font-cairo" />
              <Input placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-cairo" dir="ltr" />
              <Input placeholder="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-cairo" dir="ltr" />
              <Textarea placeholder="رسالتك *" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="font-cairo min-h-[120px]" />
              <Button type="submit" className="w-full font-cairo gap-2 text-lg py-6" disabled={loading} style={{ background: "var(--premium-gradient)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> إرسال الرسالة</>}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
