import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    discount_percentage?: number | null;
    unit?: string | null;
    stock_quantity?: number | null;
    image_url: string | null;
    categories: { name: string; slug: string } | null;
  };
  onOrder?: () => void;
  linkTo?: string;
}

const ProductCard = ({ product, onOrder, linkTo }: ProductCardProps) => {
  const href = linkTo || `/products/${product.id}`;
  const { addItem } = useCart();
  
  const discount = product.discount_percentage || 0;
  const finalPrice = discount > 0 ? product.price - (product.price * discount / 100) : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: finalPrice, image_url: product.image_url });
    toast.success(`تمت إضافة "${product.name}" للسلة`);
  };

  return (
    <motion.div
      className="glass-card rounded-[1.2rem] overflow-hidden group relative flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Link to={href} className="block relative w-full h-full flex flex-col p-3">
        <div className="aspect-square w-full bg-black/40 rounded-xl relative overflow-hidden group">
          {product.image_url ? (
            <img
              src={optimizeImageUrl(product.image_url)}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs md:text-sm bg-muted/5">
              لا توجد صورة
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            {product.categories && (
              <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-medium bg-black/60 backdrop-blur-md text-primary px-3 py-1.5 rounded-full shadow-sm border border-primary/20">
                {product.categories.name}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-bold bg-red-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-sm">
                خصم {discount}%
              </span>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            className="absolute bottom-3 left-3 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-primary/90 backdrop-blur-md text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-95 hover:bg-primary transition-all translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            aria-label="أضف للسلة"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-5 pb-2 px-2 relative z-10 flex flex-col flex-1 text-right">
          <div className="flex-1">
            <h3 className="text-sm md:text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-[11px] md:text-xs text-muted-foreground/80 font-light mb-4 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              {discount > 0 && (
                <span className="text-xs text-muted-foreground line-through font-en opacity-70">
                  {product.price.toLocaleString("en-US")} ج.م
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-lg md:text-xl font-bold text-foreground tracking-wide font-en">
                  {finalPrice.toLocaleString("en-US")}
                </span>
                <span className="text-[10px] text-primary font-medium">ج.م</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
