import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, Moon, Sun, ChevronUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";
import { useSiteSettings, type SiteSettings } from "@/hooks/useSiteSettings";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { isDark, toggle } = useTheme();
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const { data } = useSiteSettings();
  const settings = data as SiteSettings | null;

  const socialLinks = [];
  if (settings) {
    if (settings.facebook) {
      socialLinks.push({ 
        label: "Facebook", 
        link: settings.facebook, 
        d: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" 
      });
    }
    if (settings.instagram) {
      socialLinks.push({ 
        label: "Instagram", 
        link: settings.instagram, 
        d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" 
      });
    }
    if (settings.tiktok) {
      socialLinks.push({ 
        label: "TikTok", 
        link: settings.tiktok, 
        d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.4-2.31 5.96-1.4 1.54-3.54 2.5-5.69 2.59-2.14.09-4.32-.48-5.94-1.87-1.63-1.39-2.61-3.41-2.82-5.54-.21-2.13.43-4.33 1.83-5.94 1.4-1.6 3.48-2.64 5.63-2.73V13.3c-1.04.16-2.05.65-2.78 1.41-.73.76-1.12 1.8-1.08 2.86.04 1.06.56 2.05 1.34 2.74.78.69 1.87 1.04 2.93 1 .98-.03 1.93-.42 2.62-1.1.69-.68 1.05-1.68 1.05-2.64V.02h4.16z" 
      });
    }
    if (settings.whatsapp) {
      const waLink = settings.whatsapp.startsWith('http') ? settings.whatsapp : `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`;
      socialLinks.push({ 
        label: "WhatsApp", 
        link: waLink, 
        d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" 
      });
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      setShowScrollTop(currentY > 400);
      setHidden(currentY > lastScrollY && currentY > 80);
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const links = [
    { label: "الرئيسية", href: "/#hero" },
    { label: "من نحن", href: "/#about" },
    { label: "منتجاتنا", href: "/products" },
    { label: "المقالات", href: "/articles" },
    { label: "تواصل معنا", href: "/#contact" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return location.pathname === "/";
    return location.pathname === href;
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: hidden ? -80 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass shadow-xl border-b border-white/5"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 overflow-hidden transform group-hover:scale-110 transition-transform duration-300">
              <img 
                src={settings?.logo_url || "/logo-main.jpg"} 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tighter font-cairo text-primary drop-shadow-sm">
              أحمد الماسي
            </span>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <li key={link.href} className="relative">
                <a
                  href={link.href}
                  className={`relative text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-primary font-bold bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isDark ? "sun" : "moon"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {deferredPrompt && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleInstall}
                className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors flex"
                aria-label="تثبيت التطبيق"
              >
                <Download className="w-5 h-5" />
              </motion.button>
            )}

            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors"
              aria-label="سلة المشتريات"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-bold text-primary-foreground bg-primary flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {socialLinks.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 mr-1 pr-2 border-r border-border/50">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.link} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/40 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
                  </a>
                ))}
              </div>
            )}

            {/* Mobile Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2 rounded-xl text-foreground hover:bg-muted/60 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {isOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-background/95 backdrop-blur-2xl border-b border-border/30"
            >
              <ul className="flex flex-col items-center gap-1 py-4 px-4">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-full"
                  >
                    <a
                      href={link.href}
                      className={`text-base font-cairo font-semibold px-4 py-2.5 rounded-xl block text-center transition-colors ${
                        isActive(link.href)
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:text-primary hover:bg-muted/50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: links.length * 0.05 }}
                  className="w-full"
                >
                  <Link
                    to="/cart"
                    className="text-base font-cairo font-semibold text-foreground hover:text-primary px-4 py-2.5 rounded-xl block text-center transition-colors hover:bg-muted/50"
                    onClick={() => setIsOpen(false)}
                  >
                    🛒 السلة {totalItems > 0 && `(${totalItems})`}
                  </Link>
                </motion.li>

                {/* Mobile Social Links */}
                {socialLinks.length > 0 && (
                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (links.length + 1) * 0.05 }}
                    className="w-full pt-4 mt-4 border-t border-border/50 flex justify-center gap-6"
                  >
                    {socialLinks.map((s) => (
                      <a 
                        key={s.label} 
                        href={s.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-3 rounded-full bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
                      </a>
                    ))}
                  </motion.li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
            aria-label="العودة للأعلى"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
