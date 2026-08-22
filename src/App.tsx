import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MetaTags from "./components/MetaTags";

import FooterScripts from "./components/FooterScripts";
import AnalyticsTracker from "./components/AnalyticsTracker";

const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Services = lazy(() => import("./pages/Services"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminDiscounts = lazy(() => import("./pages/admin/AdminDiscounts"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg" />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1"
        >
          <Suspense fallback={<Loading />}>
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/services" element={<Services />} />
              
              {/* Admin Auth */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="articles" element={<AdminArticles />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="discounts" element={<AdminDiscounts />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>

      <FooterScripts />
      <AnalyticsTracker />
    </div>
  );
};

import { HelmetProvider } from "react-helmet-async";

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <BrowserRouter>
              <MetaTags />
              <ScrollToTop />
              <Sonner position="top-center" expand={true} richColors />
              <Toaster />
              <AppContent />
            </BrowserRouter>
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
