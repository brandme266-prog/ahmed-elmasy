import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
const flourImg = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600";
const sugarImg = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600";
const pastaImg = "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600";
const spicesImg = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600";

const fallbackServices = [
  { id: "1", title: "دقيق للمخبوزات", description: "أجود أنواع الدقيق للمخبوزات والحلويات والمعجنات بجميع أنواعها.", image_url: flourImg },
  { id: "2", title: "سكر نقي", description: "سكر أبيض نقي عالي الجودة للتحلية اليومية والحلويات.", image_url: sugarImg },
  { id: "3", title: "مكرونات فاخرة", description: "تشكيلة متنوعة من المكرونات المصنوعة من أجود أنواع القمح.", image_url: pastaImg },
  { id: "4", title: "التوابل والبهارات", description: "تشكيلة واسعة من التوابل والبهارات الطازجة المطحونة يدوياً بأعلى جودة.", image_url: spicesImg },
];

const ServicesSection = () => {
  const { data: dbServices } = useQuery({
    queryKey: ["services-home"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order").limit(4);
      if (error) throw error;
      return data;
    },
  });

  const services = useMemo(() => {
    if (!dbServices || dbServices.length === 0) return fallbackServices;
    
    // Detect legacy smart home services
    const isLegacy = dbServices.some(s => {
      const title = s.title.toLowerCase();
      const desc = (s.description || "").toLowerCase();
      return title.includes("smart") || title.includes("camera") || title.includes("صيانة") || title.includes("تكييف") || desc.includes("كاميرات");
    });

    if (isLegacy) return fallbackServices;
    return dbServices;
  }, [dbServices]);

  return (
    <section id="services" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[100px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground mb-4">
            <span className="text-gradient">منتجاتنا المميزة</span>
          </h2>
          <p className="text-muted-foreground font-cairo max-w-2xl mx-auto">
            نقدم لك تشكيلة متنوعة من المنتجات الغذائية الطبيعية بأعلى جودة وأفضل الأسعار
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              className="bg-card rounded-2xl p-6 text-center border border-border hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
              style={{ boxShadow: "var(--card-shadow)" }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -8, boxShadow: "var(--card-hover-shadow)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {service.image_url && (
                <div className="h-40 flex items-center justify-center mb-4 relative z-10">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    loading="lazy"
                    className="max-h-36 object-contain group-hover:scale-110 transition-transform duration-500 rounded-xl"
                  />
                </div>
              )}
              <h3 className="text-xl font-cairo font-bold text-foreground mb-2 relative z-10">{service.title}</h3>
              <p className="text-muted-foreground font-cairo text-sm relative z-10">{service.description}</p>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-primary font-cairo font-semibold hover:underline"
          >
            عرض جميع المنتجات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
