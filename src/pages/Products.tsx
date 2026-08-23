import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Search, SlidersHorizontal, LayoutGrid, List, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { staticProducts, staticCategories, Product } from "@/data/products";

// Legacy fallbacks removed since we're entirely static now

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat || null);
  }, [searchParams]);

  const handleCategoryChange = (catSlugOrId: string | null) => {
    setSelectedCategory(catSlugOrId);
    if (catSlugOrId) {
      setSearchParams({ category: catSlugOrId });
    } else {
      setSearchParams({});
    }
  };

  // Using static categories
  const displayCategories = staticCategories;

  // Find actual category ID based on slug or ID in URL
  const selectedCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return displayCategories?.find((c) => c.slug === selectedCategory || c.id === selectedCategory) || null;
  }, [displayCategories, selectedCategory]);

  const activeCategoryId = selectedCategoryObj?.id || selectedCategory;

  const { data: dynamicProducts, isLoading: isQueryLoading } = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: false });
      if (error || !data || data.length === 0) {
        if (error) console.warn("Dynamic products fetch failed", error);
        return staticProducts;
      }
      return data as unknown as Product[];
    },
    staleTime: 1000 * 60, // 1 min
  });

  const isLoading = !dynamicProducts && isQueryLoading;
  
  const displayProducts = useMemo(() => {
    let products = dynamicProducts || staticProducts;
    if (activeCategoryId) {
      products = products.filter(p => p.category_id === activeCategoryId || p.categories?.slug === activeCategoryId);
    }
    return products;
  }, [activeCategoryId, dynamicProducts]);

  // AI-powered smart search: fuzzy match on name, description, category
  const filteredProducts = useMemo(() => {
    if (!displayProducts) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayProducts;

    // Split query into words for smarter matching
    const words = q.split(/\s+/).filter(Boolean);

    return displayProducts
      .map((p) => {
        const fields = [p.name, p.description, p.categories?.name].filter(Boolean).join(" ").toLowerCase();
        let score = 0;
        for (const w of words) {
          if (fields.includes(w)) score += 1;
          if (p.name.toLowerCase().includes(w)) score += 2; // name match has higher weight
        }
        return { ...p, _score: score };
      })
      .filter((p) => p._score > 0)
      .sort((a, b) => b._score - a._score);
  }, [displayProducts, searchQuery]);



  const selectedCatName = displayCategories?.find((c) => c.id === selectedCategory)?.name;
  const activeFiltersCount = (selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-6 md:pt-24 md:pb-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-2xl md:text-5xl font-cairo font-extrabold text-foreground mb-3">
              تسوّق <span className="text-gradient">منتجاتنا</span>
            </h1>
            <p className="text-muted-foreground font-cairo text-sm md:text-lg mb-5 md:mb-8 px-2">
              اكتشف تشكيلتنا المتنوعة من العطور الفاخرة بأعلى جودة وأفضل سعر
            </p>

            {/* Standard Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن عطر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 h-11 md:h-12 rounded-xl bg-card border-border font-cairo text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 md:pb-20">
        <div className="container mx-auto px-3 md:px-4">
          {/* Mobile Filter Toggle + View Mode */}
          <div className="flex items-center justify-between gap-3 mb-4 md:mb-8">
            {/* Filter button on mobile / Category chips on desktop */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="font-cairo rounded-full text-xs h-8 gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                الأقسام
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Desktop category chips */}
            <div className="hidden md:flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => handleCategoryChange(null)}
                className="font-cairo rounded-full text-sm h-9"
                size="sm"
              >
                الكل
              </Button>
              {displayCategories?.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.slug || selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => handleCategoryChange(cat.slug || cat.id)}
                  className="font-cairo rounded-full text-sm h-9"
                  size="sm"
                >
                  {cat.icon && <span className="ml-1">{cat.icon}</span>}
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-muted-foreground font-cairo whitespace-nowrap">
                {filteredProducts?.length ?? 0} منتج
              </span>
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                  aria-label="عرض شبكي"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                  aria-label="عرض قائمة"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filters drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden mb-4"
              >
                <div className="flex flex-wrap gap-2 py-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => { handleCategoryChange(null); setShowFilters(false); }}
                    className="font-cairo rounded-full text-xs h-8"
                    size="sm"
                  >
                    الكل
                  </Button>
                  {displayCategories?.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.slug || selectedCategory === cat.id ? "default" : "outline"}
                      onClick={() => { handleCategoryChange(cat.slug || cat.id); setShowFilters(false); }}
                      className="font-cairo rounded-full text-xs h-8"
                      size="sm"
                    >
                      {cat.icon && <span className="ml-1">{cat.icon}</span>}
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filters */}
          {(selectedCategory || searchQuery) && (
            <div className="flex items-center gap-2 mb-4 md:mb-6 flex-wrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-cairo">الفلاتر:</span>
              {selectedCatName && (
                <span className="bg-primary/10 text-primary text-xs font-cairo px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  {selectedCatName}
                  <button onClick={() => handleCategoryChange(null)} className="hover:text-destructive">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="bg-primary/10 text-primary text-xs font-cairo px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => { setSearchQuery(""); }} className="hover:text-destructive">×</button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground font-cairo">جاري تحميل المنتجات...</span>
            </div>
          ) : filteredProducts?.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-cairo font-bold text-foreground mb-1">لا توجد منتجات</p>
              <p className="text-sm text-muted-foreground font-cairo">جرّب تغيير الفلتر أو البحث بكلمات مختلفة</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${searchQuery}-${viewMode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
                    : "flex flex-col gap-3 md:gap-4"
                }
              >
                {filteredProducts?.map((product, i) =>
                  viewMode === "grid" ? (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    >
                      <ProductListItem product={product} />
                    </motion.div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

const ProductListItem = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    toast.success(`تمت إضافة "${product.name}" للسلة`);
  };

  return (
    <div className="bg-card rounded-2xl md:rounded-3xl border border-border/50 p-3 md:p-5 flex gap-4 md:gap-6 items-stretch hover:border-primary/50 transition-all duration-300 relative group shadow-product-card">
      {/* Overlay Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl md:rounded-3xl" />
      
      <Link to={`/products/${product.slug || product.id}`} className="shrink-0 relative">
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-xl md:rounded-2xl overflow-hidden bg-secondary/30">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] md:text-xs font-cairo">لا صورة</div>
          )}
        </div>
      </Link>
      
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1 relative z-10">
        <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1 sm:gap-2 mb-1 md:mb-2">
            <Link to={`/products/${product.slug || product.id}`}>
              <h3 className="font-cairo font-extrabold text-sm md:text-xl text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">{product.name}</h3>
            </Link>
            {product.categories && (
              <span className="self-start text-[10px] md:text-sm font-cairo font-bold text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full shrink-0 bg-premium-gradient">
                {product.categories.name}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-cairo line-clamp-2 leading-relaxed">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm md:text-2xl font-cairo font-black text-primary whitespace-nowrap">
            {product.price.toLocaleString("ar-EG")} <span className="text-[10px] md:text-sm font-bold text-muted-foreground">ج.م</span>
          </span>
          <Button size="sm" onClick={handleAdd} className="font-cairo gap-1.5 text-xs md:text-sm h-8 md:h-10 px-3 md:px-5 rounded-xl shadow-md transition-all hover:scale-105 bg-premium-gradient">
            <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">إضافة للسلة</span>
            <span className="sm:hidden">أضف</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Products;
