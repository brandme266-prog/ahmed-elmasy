import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      // Filter out legacy categories
      return data.filter(c => !c.name.includes("دقيق") && !c.name.includes("سكر") && !c.name.includes("عدس"));
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
        
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      
      const { data, error } = await query.limit(20);
      if (error) throw error;
      
      // Filter out legacy food products
      const filtered = data.filter(p => {
        const catName = p.categories?.name?.toLowerCase() || "";
        const pName = p.name.toLowerCase();
        const isLegacy = catName.includes("دقيق") || catName.includes("سكر") || catName.includes("عدس") || pName.includes("دقيق") || pName.includes("سكر") || pName.includes("عدس");
        return !isLegacy;
      });
      
      return filtered.slice(0, 8);
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Duplicate products for infinite scrolling
  const marqueeProducts = [...products, ...products, ...products, ...products];

  return (
    <section className="py-20 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4 mb-6 flex flex-col md:flex-row items-end md:items-center justify-between gap-4 relative z-10">
        <div>
          <span className="inline-block text-primary tracking-widest uppercase font-cairo font-semibold text-sm mb-2">
            أحدث الإصدارات
          </span>
          <h2 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground">
            عطور مختارة لك
          </h2>
        </div>
        <Link to="/products" className="hidden md:flex items-center gap-2 font-cairo text-muted-foreground hover:text-primary transition-colors">
          عرض الكل
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Category Tabs / Cards */}
      {categories.length > 0 && (
        <div className="container mx-auto px-4 mb-10 relative z-10">
          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            
            {/* All Category Card */}
            <button
              onClick={() => navigate('/products')}
              className={`snap-center shrink-0 flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group border-border bg-card shadow-sm hover:border-primary/50`}
            >
              <div className="absolute inset-0 bg-transparent group-hover:bg-primary/5 transition-opacity duration-300" />
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-primary/10 mb-2 border border-primary/20 text-primary">
                <span className="text-xl md:text-2xl font-black">الكل</span>
              </div>
              <span className="font-cairo font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                جميع العطور
              </span>
            </button>

            {/* Dynamic Category Cards */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/products?category=${category.id}`)}
                className={`snap-center shrink-0 flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group border-border bg-card shadow-sm hover:border-primary/50`}
              >
                {category.image_url ? (
                  <div className="absolute inset-0">
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-transparent group-hover:bg-primary/5 transition-opacity duration-300" />
                )}
                
                <div className={`relative z-10 flex flex-col items-center ${category.image_url ? 'text-white mt-auto pb-4' : ''}`}>
                  {!category.image_url && (
                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-muted mb-2 border border-border/50 text-2xl">
                      {category.icon || "✨"}
                    </div>
                  )}
                  <span className={`font-cairo font-semibold text-sm text-center px-2 transition-colors ${
                    category.image_url 
                      ? 'text-white' 
                      : 'text-foreground group-hover:text-primary'
                  }`}>
                    {category.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full relative group">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(50%); }
            }
            .animate-marquee {
              animation: marquee 40s linear infinite;
              display: flex;
              width: fit-content;
            }
            .group:hover .animate-marquee {
              animation-play-state: paused;
            }
          `}
        </style>
        
        {/* We use dir="ltr" internally for the animation predictability, but items stay rtl */}
        <div className="overflow-hidden w-full" dir="ltr">
          <div className="animate-marquee gap-4 md:gap-6 pl-4 md:pl-6">
            {marqueeProducts.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="w-[260px] md:w-[300px] flex-none"
                dir="rtl"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Fading edges */}
        <div className="absolute top-0 right-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 left-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      </div>
      
      <div className="flex justify-center mt-8 md:hidden relative z-10">
        <Link to="/products" className="flex items-center gap-2 font-cairo text-sm font-semibold text-primary">
          عرض كل المنتجات
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
