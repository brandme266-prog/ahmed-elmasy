import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Loader2, Package, MapPin } from "lucide-react";

import { useSiteSettings } from "@/hooks/useSiteSettings";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", email: "", notes: "" });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { data: settings } = useSiteSettings();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("متصفحك لا يدعم تحديد الموقع");
      return;
    }
    
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGettingLocation(false);
        toast.success("تم تحديد موقعك بنجاح");
      },
      (error) => {
        setGettingLocation(false);
        toast.error("حدث خطأ أثناء تحديد الموقع، يرجى التأكد من تفعيل صلاحيات الموقع");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    const locationLink = location ? `\nرابط الموقع: https://www.google.com/maps?q=${location.lat},${location.lng}` : "";
    const fullAddress = form.address.trim() + locationLink;

    const orders = items.map((item) => ({
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_address: fullAddress,
      customer_email: form.email.trim() || null,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      notes: form.notes.trim() || null,
      status: 'pending'
    }));

    const { error } = await supabase.from("orders").insert(orders as any);
    setLoading(false);

    if (error) {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } else {
      // Construction of WhatsApp message
      const rawwhatsapp = settings?.whatsapp?.replace(/[^0-9]/g, '') || "";
      const whatsappNumber = rawwhatsapp.startsWith('01') ? `20${rawwhatsapp}` : rawwhatsapp;
      if (!whatsappNumber) {
        toast.error("رقم الواتساب غير مهيأ، يرجى التواصل مع الإدارة");
        return;
      }
      const itemsList = items.map(item => `- ${item.name} (${item.quantity})`).join("\n");
      const message = `طلب جديد من متجر أحمد الماسي (سلة المشتريات):\n` +
        `الاسم: ${form.name}\n` +
        `الهاتف: ${form.phone}\n` +
        `العنوان: ${form.address}\n` +
        (location ? `رابط الموقع: https://www.google.com/maps?q=${location.lat},${location.lng}\n` : "") +
        `المنتجات:\n${itemsList}\n` +
        `الإجمالي: ${totalPrice.toLocaleString("ar-EG")} ج.م\n` +
        (form.notes ? `ملاحظات: ${form.notes}` : "");
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      toast.success("تم إرسال طلبك بنجاح! جاري تحويلك للواتساب...");
      
      // Delay redirection slightly to let the toast show
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        clearCart();
        setForm({ name: "", phone: "", address: "", email: "", notes: "" });
        setLocation(null);
      }, 1500);
    }
  };


  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground text-center mb-4">
            <ShoppingCart className="inline-block w-8 h-8 ml-2" />
            سلة المشتريات
          </h1>
          <p className="text-center text-muted-foreground font-cairo mb-10">
            {totalItems > 0 ? `${totalItems} منتج في السلة` : "السلة فارغة"}
          </p>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Package className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
              <p className="text-xl font-cairo text-muted-foreground mb-6">لا توجد منتجات في السلة</p>
              <Link to="/products">
                <Button className="font-cairo gap-2" style={{ background: "var(--premium-gradient)" }}>
                  <ArrowRight className="w-4 h-4" />
                  تصفح المنتجات
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="bg-card rounded-2xl border border-border p-4 flex gap-4 items-center"
                      style={{ boxShadow: "var(--card-shadow)" }}
                    >
                      <div className="w-20 h-20 rounded-xl bg-secondary/30 overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.id}`}>
                          <h3 className="font-cairo font-bold text-foreground hover:text-primary transition-colors truncate">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm font-cairo font-extrabold text-gradient mt-1">
                          {item.price.toLocaleString("ar-EG")} ج.م
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="font-cairo font-bold text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <p className="font-cairo font-extrabold text-foreground min-w-[80px] text-center hidden sm:block">
                        {(item.price * item.quantity).toLocaleString("ar-EG")} ج.م
                      </p>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive h-8 w-8 flex-shrink-0"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Form */}
              <div className="lg:col-span-1">
                <div
                  className="bg-card rounded-2xl border border-border p-6 sticky top-24"
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <h2 className="text-xl font-cairo font-extrabold text-foreground mb-6">ملخص الطلب</h2>

                  <div className="space-y-3 mb-6 border-b border-border pb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm font-cairo">
                        <span className="text-muted-foreground truncate ml-2">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-bold text-foreground flex-shrink-0">
                          {(item.price * item.quantity).toLocaleString("ar-EG")} ج.م
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-cairo font-bold text-lg">الإجمالي</span>
                    <span className="font-cairo font-extrabold text-2xl text-gradient">
                      {totalPrice.toLocaleString("ar-EG")} ج.م
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      placeholder="الاسم الكامل *"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="font-cairo"
                    />
                    <Input
                      placeholder="رقم الهاتف *"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="font-cairo"
                      dir="ltr"
                    />
                    <Input
                      placeholder="العنوان التفصيلي (المدينة، الحي، الشارع) *"
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="font-cairo"
                    />
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleGetLocation}
                        disabled={gettingLocation}
                        className="font-cairo w-full flex items-center justify-center gap-2 border-primary/30 hover:bg-primary/5 text-primary"
                      >
                        {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        {location ? "تحديث موقعي (GPS)" : "تحديد موقعي الحالي (GPS)"}
                      </Button>
                      
                      {location && (
                        <div className="w-full h-32 rounded-xl overflow-hidden border border-border relative">
                          <img 
                            src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff0000(${location.lng},${location.lat})/${location.lng},${location.lat},15,0/400x300?access_token=${MAPBOX_TOKEN}`} 
                            alt="Map location" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <Input
                      placeholder="البريد الإلكتروني (اختياري)"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="font-cairo"
                      dir="ltr"
                    />
                    <Textarea
                      placeholder="ملاحظات إضافية"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="font-cairo"
                    />
                    <Button
                      type="submit"
                      className="w-full font-cairo text-lg gap-2 py-5"
                      style={{ background: "var(--premium-gradient)" }}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          إرسال الطلب
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Cart;
