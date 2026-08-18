import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TestimonialsSection = () => {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const fallbackTestimonials = [
    { name: "أحمد محمد", role: "عميل دائم", text: "عطور أريج لا غنى عنها! الثبات ممتاز والروائح رائعة جداً. أنصح الجميع بتجربتهم.", rating: 5 },
    { name: "سارة عبدالله", role: "خبيرة تجميل", text: "أفضل عطور جربتها. فخمة ورائحتها قوية. والتوصيل سريع جداً. شكراً أحمد الماسي!", rating: 5 },
    { name: "محمد حسن", role: "رجل أعمال", text: "كرجل أعمال، العطر هو أهم شيء بالنسبة لي. عطور أريج تلبي أعلى المعايير. الفخامة وجودة الزيوت لا مثيل لها.", rating: 5 },
  ];

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;
  return (
    <section className="py-20 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/3 rounded-full blur-[80px]" />
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
            <span className="text-gradient">آراء عملائنا</span>
          </h2>
          <p className="text-muted-foreground font-cairo max-w-2xl mx-auto">ماذا يقول عملاؤنا عن تجربتهم مع عطور أريج</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {displayTestimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-card rounded-2xl p-8 border border-border relative group hover:border-primary/30 transition-all duration-300 overflow-hidden"
              style={{ boxShadow: "var(--card-shadow)" }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Quote className="w-8 h-8 text-primary/20 mb-4 relative z-10" />
              <div className="flex gap-0.5 mb-4 relative z-10">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground font-cairo mb-6 leading-relaxed relative z-10">"{t.text}"</p>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-cairo font-bold text-sm" style={{ background: "var(--premium-gradient)" }}>
                  {t.name[0]}
                </div>
                <p className="font-cairo font-bold text-foreground mt-2">{t.name}</p>
                <p className="font-cairo text-sm text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
