import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const FreshProductsSection = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["fresh-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const displayProducts = useMemo(() => {
    return products || [];
  }, [products]);

  return (
    <section className="py-20 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-[80px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground">
              <span className="text-gradient">منتجاتنا الحقيقية</span>
              <Sparkles className="inline w-8 h-8 ml-2 text-primary" />
            </h2>
            <p className="text-muted-foreground font-cairo mt-2">استعرض المنتجات الطازجة والحقيقية لدينا اليوم</p>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-2 font-cairo font-bold text-primary hover:text-primary/80 transition-colors">
            عرض الكل <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-16">
            <span className="text-sm text-muted-foreground font-cairo">جاري تحميل المنتجات...</span>
          </div>
        ) : displayProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-lg font-cairo font-bold text-foreground mb-2">لا توجد منتجات مميزة متاحة حالياً</p>
            <p className="text-sm text-muted-foreground font-cairo">تأكد من إضافة منتجات مميزة عبر لوحة الإدارة ثم أعد تحميل الصفحة.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          className="text-center mt-12 md:hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/products" className="inline-flex items-center gap-2 font-cairo font-bold text-primary hover:text-primary/80 transition-colors">
            عرض جميع المنتجات <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FreshProductsSection;