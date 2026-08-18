import { motion, AnimatePresence } from "framer-motion";
import { Home, LayoutGrid, ShoppingCart, BookText, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roleData);
    };
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { label: "الرئيسية", icon: Home, href: "/" },
    { label: "المنتجات", icon: LayoutGrid, href: "/products" },
    { label: "السلة", icon: ShoppingCart, href: "/cart", badge: totalItems },
    { label: "المقالات", icon: BookText, href: "/articles" },
    ...(isAdmin ? [{ label: "حسابي", icon: User, href: "/admin" }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-[100] px-4 pointer-events-none">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="mx-auto max-w-sm bg-white dark:bg-zinc-900 border-2 border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] flex justify-between items-center h-20 px-4 relative pointer-events-auto"
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              to={item.href} 
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <motion.div 
                animate={{ 
                  y: active ? -15 : 0,
                  scale: active ? 1.2 : 1
                }}
                className={`p-3 rounded-2xl transition-all duration-300 relative ${active ? "bg-primary text-white shadow-[0_10px_20px_rgba(34,197,94,0.4)]" : "text-muted-foreground/60"}`}
              >
                <item.icon className={`w-6 h-6 ${active ? "stroke-[3px]" : "stroke-[2px]"}`} />
                
                <AnimatePresence>
                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-[10px] font-cairo font-black absolute bottom-2 text-primary uppercase tracking-wider"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default BottomNav;
