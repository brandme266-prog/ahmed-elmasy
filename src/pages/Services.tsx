import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Services = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl md:text-5xl font-cairo font-extrabold text-foreground mb-4">
              <span className="text-gradient">منتجاتنا المميزة</span>
            </h1>
            <p className="text-muted-foreground font-cairo max-w-2xl mx-auto">
              تشكيلة متنوعة من المنتجات الغذائية الطبيعية بأعلى جودة وأفضل الأسعار
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  className="bg-card rounded-2xl p-6 text-center border border-border hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
                  style={{ boxShadow: "var(--card-shadow)" }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
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
                  {service.icon && !service.image_url && (
                    <div className="text-5xl mb-4 relative z-10">{service.icon}</div>
                  )}
                  <h2 className="text-xl font-cairo font-bold text-foreground mb-2 relative z-10">
                    {service.title}
                  </h2>
                  <p className="text-muted-foreground font-cairo text-sm relative z-10">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground font-cairo py-20">لا توجد منتجات حالياً</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Services;
