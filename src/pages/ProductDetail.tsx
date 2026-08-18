import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, ShoppingCart, Star, Shield, Truck, ChevronLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("id", id!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: similarProducts } = useQuery({
    queryKey: ["similar-products", product?.category_id, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .eq("category_id", product!.category_id!)
        .neq("id", id!)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id,
  });

  // Define interfaces for better typing
  interface Category {
    name: string;
    slug: string;
  }

  interface Product {
    id: string;
    name: string;
    price: number;
    discount_percentage?: number | null;
    description: string | null;
    image_url: string | null;
    image_urls: string[] | null;
    category_id: string | null;
    is_featured: boolean;
    unit: string | null;
    stock_quantity: number | null;
    categories: Category | null;
  }

  const p = product as unknown as Product;
  const mainImage = selectedImage || p?.image_url;
  const gallery = p?.image_urls && Array.isArray(p.image_urls) 
    ? [p.image_url, ...p.image_urls].filter((url): url is string => !!url) 
    : [p?.image_url].filter((url): url is string => !!url);
    
  const discount = p?.discount_percentage || 0;
  const finalPrice = discount > 0 ? p.price - (p.price * discount / 100) : p.price;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: finalPrice, image_url: mainImage });
    toast.success(`تمت إضافة "${product.name}" للسلة`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-xl font-cairo text-muted-foreground">المنتج غير موجود</p>
          <Link to="/products">
            <Button className="font-cairo gap-2">
              <ArrowRight className="w-4 h-4" />
              العودة للمنتجات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm font-cairo text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronLeft className="w-3.5 h-3.5" />
            <Link to="/products" className="hover:text-primary transition-colors">المنتجات</Link>
            {p.categories && (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-primary">{p.categories.name}</span>
              </>
            )}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="bg-secondary/20 rounded-3xl overflow-hidden border border-border aspect-square flex items-center justify-center relative">
                {mainImage ? (
                  <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-muted-foreground font-cairo">لا توجد صورة</div>
                )}
                
                {product.is_featured && (
                  <Badge className="absolute top-4 right-4 font-cairo text-sm px-3 py-1" style={{ background: "var(--premium-gradient)" }}>
                    ⭐ منتج مميز
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 font-cairo text-sm px-3 py-1 bg-red-600 text-white hover:bg-red-700">
                    خصم {discount}%
                  </Badge>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img || (!selectedImage && i === 0) ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              {p.categories && (
                <Badge variant="secondary" className="font-cairo text-xs w-fit mb-3">
                  {p.categories.name}
                </Badge>
              )}

              <h1 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-sm font-cairo text-muted-foreground">(تقييم العملاء)</span>
              </div>

              <div className="flex flex-col gap-1 mb-6">
                {discount > 0 && (
                  <p className="text-xl font-cairo text-muted-foreground line-through opacity-70">
                    {Number(p.price).toLocaleString("ar-EG")} <span className="text-sm mr-1">ج.م</span>
                  </p>
                )}
                <p className="text-3xl font-cairo font-extrabold text-gradient">
                  {Number(finalPrice).toLocaleString("ar-EG")} <span className="text-lg font-bold text-muted-foreground mr-1">ج.م</span>
                </p>
                {p.unit && (
                  <span className="text-sm md:text-lg font-cairo text-muted-foreground/70">لكل {p.unit}</span>
                )}
                {p.stock_quantity <= 5 && p.stock_quantity > 0 && (
                  <span className="text-xs font-cairo text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 w-fit mt-1">
                    متبقي {p.stock_quantity} {p.unit} فقط!
                  </span>
                )}
                {p.stock_quantity === 0 && (
                  <span className="text-xs font-cairo text-destructive bg-destructive/5 px-2 py-0.5 rounded-full border border-destructive/20 w-fit mt-1">
                    نفذت الكمية حالياً
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-base text-muted-foreground font-cairo leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-sm font-cairo font-semibold">شحن سريع</span>
                </div>
                <div className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-sm font-cairo font-semibold">جودة عالية</span>
                </div>
              </div>

              <Button
                size="lg"
                className="font-cairo text-lg gap-2 py-6 rounded-xl w-full sm:w-auto"
                style={{ background: "var(--premium-gradient)" }}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                أضف للسلة
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {similarProducts && similarProducts.length > 0 && (
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-cairo font-extrabold text-foreground text-center mb-10">
              منتجات مشابهة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  linkTo={`/products/${p.id}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
