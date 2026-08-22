import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Settings, Globe, Image as ImageIcon, Code, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";

type SiteFeatureItem = {
  bold: string;
  text: string;
};

type SiteStatItem = {
  icon: string;
  value: string;
  label: string;
};

type SiteSettingsForm = {
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  email: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  google_site_verification: string;
  hero_image: string;
  about_image: string;
  features_image: string;
  footer_image: string;
  header_scripts: string;
  footer_scripts: string;
  features_title: string;
  features_bottom_text: string;
  features_list: SiteFeatureItem[];
  home_stats: SiteStatItem[];
};

type SiteSettingsRow = SiteSettingsForm & {
  id: boolean;
};

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    site_name: "",
    site_description: "",
    logo_url: "",
    favicon_url: "",
    email: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    google_site_verification: "",
    hero_image: "",
    about_image: "",
    features_image: "",
    footer_image: "",
    header_scripts: "",
    footer_scripts: "",
    features_title: "",
    features_bottom_text: "",
    features_list: [
      { bold: "", text: "" },
      { bold: "", text: "" },
      { bold: "", text: "" },
    ],
    home_stats: [
      { icon: "Users", value: "", label: "" },
      { icon: "Award", value: "", label: "" },
      { icon: "Shield", value: "", label: "" },
      { icon: "Leaf", value: "", label: "" },
    ],
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").single();
      if (error && error.code !== 'PGRST116') throw error;
      return (data || null) as unknown as SiteSettingsRow | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name || "أحمد الماسي",
        site_description: settings.site_description || "",
        logo_url: settings.logo_url || "",
        favicon_url: settings.favicon_url || "",
        email: settings.email || "",
        whatsapp: settings.whatsapp || "",
        facebook: settings.facebook || "",
        instagram: settings.instagram || "",
        tiktok: settings.tiktok || "",
        google_site_verification: settings.google_site_verification || "",
        hero_image: settings.hero_image || "",
        about_image: settings.about_image || "",
        features_image: settings.features_image || "",
        footer_image: settings.footer_image || "",
        header_scripts: settings.header_scripts || "",
        footer_scripts: settings.footer_scripts || "",
        features_title: settings.features_title || "",
        features_bottom_text: settings.features_bottom_text || "",
        features_list: settings.features_list || [
          { bold: "", text: "" },
          { bold: "", text: "" },
          { bold: "", text: "" },
        ],
        home_stats: settings.home_stats || [
          { icon: "Users", value: "", label: "" },
          { icon: "Award", value: "", label: "" },
          { icon: "Shield", value: "", label: "" },
          { icon: "Leaf", value: "", label: "" },
        ],
      });
    }
  }, [settings, setForm]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        id: true,
        ...form,
      };

      const { error } = await supabase.from("site_settings").upsert(payload);
      
      if (error) {
        console.log("Full settings update failed, falling back to basic fields. Error:", error);
        // Fallback for older schemas that don't have the new columns yet
        const basicPayload = {
          id: true,
          site_name: form.site_name,
          site_description: form.site_description,
          logo_url: form.logo_url,
          favicon_url: form.favicon_url,
          email: form.email,
          whatsapp: form.whatsapp,
          facebook: form.facebook,
          instagram: form.instagram,
          tiktok: form.tiktok,
          google_site_verification: form.google_site_verification
        };
        const { error: fallbackError } = await supabase.from("site_settings").upsert(basicPayload);
        if (fallbackError) throw fallbackError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings-public"] });
      toast.success("تم تحديث الإعدادات بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ - تأكد من تنفيذ كود SQL لإضافة الأعمدة الجديدة");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-cairo font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            إعدادات الموقع
          </h1>
          <p className="text-sm text-muted-foreground font-cairo mt-1">
            إدارة الهوية البصرية، روابط التواصل، وأدوات التتبع
          </p>
        </div>
        <Button onClick={handleSubmit} className="font-cairo gap-2" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <Tabs defaultValue="social" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="branding" className="font-cairo gap-2">
              <ImageIcon className="w-4 h-4" /> الهوية البصرية
            </TabsTrigger>
            <TabsTrigger value="social" className="font-cairo gap-2">
              <Globe className="w-4 h-4" /> التواصل
            </TabsTrigger>
            <TabsTrigger value="seo" className="font-cairo gap-2">
              <Code className="w-4 h-4" /> SEO وأكواد
            </TabsTrigger>
            <TabsTrigger value="content" className="font-cairo gap-2">
              <BarChart3 className="w-4 h-4" /> أرقام الموقع
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-cairo font-bold text-foreground mb-4">روابط التواصل الاجتماعي</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">البريد الإلكتروني</label>
                    <Input dir="ltr" placeholder="info@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-cairo" />
                  </div>
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">رقم الواتساب</label>
                    <Input dir="ltr" placeholder="+20123..." value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="font-cairo" />
                    <p className="text-[10px] text-muted-foreground font-cairo mt-1">
                      * يرجى إدخال الرقم مع كود الدولة لضمان عمل الرابط بشكل صحيح.
                    </p>
                  </div>
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">رابط فيسبوك</label>
                    <Input dir="ltr" placeholder="https://facebook.com/..." value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className="font-cairo" />
                  </div>
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">رابط إنستجرام</label>
                    <Input dir="ltr" placeholder="https://instagram.com/..." value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="font-cairo" />
                  </div>
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">رابط تيك توك</label>
                    <Input dir="ltr" placeholder="https://tiktok.com/@..." value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} className="font-cairo" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-fit">
                <h2 className="text-xl font-cairo font-bold text-foreground mb-4">أدوات مشرفي المواقع</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">رمز التحقق لـ Google</label>
                    <Input dir="ltr" placeholder="your-verification-code" value={form.google_site_verification} onChange={(e) => setForm({ ...form, google_site_verification: e.target.value })} className="font-cairo" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-cairo font-bold text-foreground mb-4">بيانات الموقع الأساسية</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">اسم الموقع</label>
                    <Input placeholder="مثلاً: أحمد الماسي" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="font-cairo" />
                  </div>
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">وصف الموقع (SEO)</label>
                    <Textarea placeholder="وصف موجز للموقع يظهر في محركات البحث..." value={form.site_description} onChange={(e) => setForm({ ...form, site_description: e.target.value })} className="font-cairo" rows={3} />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-cairo font-bold text-foreground mb-4">الشعار والأيقونات</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-cairo text-xs font-bold text-center">لوجو الموقع (Logo)</label>
                    <ImageUpload value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} folder="site" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-cairo text-xs font-bold text-center">أيقونة المتصفح (Favicon)</label>
                    <ImageUpload value={form.favicon_url} onChange={(url) => setForm({ ...form, favicon_url: url })} folder="site" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-cairo text-center mt-2">
                  * اللوجو يظهر في الهيدر والفوتر والـ PWA. <br/>
                  * Favicon يظهر في تبويب المتصفح.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-cairo font-bold text-foreground mb-4 font-cairo">صور الأقسام الرئيسية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block font-cairo text-xs font-bold">صورة القسم الترحيبي (Hero)</label>
                  <ImageUpload value={form.hero_image} onChange={(url) => setForm({ ...form, hero_image: url })} folder="site" />
                </div>
                <div className="space-y-2">
                  <label className="block font-cairo text-xs font-bold">صورة (من نحن)</label>
                  <ImageUpload value={form.about_image} onChange={(url) => setForm({ ...form, about_image: url })} folder="site" />
                </div>
                <div className="space-y-2">
                  <label className="block font-cairo text-xs font-bold">صورة قسم المميزات</label>
                  <ImageUpload value={form.features_image} onChange={(url) => setForm({ ...form, features_image: url })} folder="site" />
                </div>
                <div className="space-y-2">
                  <label className="block font-cairo text-xs font-bold">خلفية الفوتر (Footer)</label>
                  <ImageUpload value={form.footer_image} onChange={(url) => setForm({ ...form, footer_image: url })} folder="site" />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-cairo font-bold text-foreground mb-4 font-cairo">تحسين محركات البحث والأكواد الخارجية</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5">رمز التحقق لـ Google (Site Verification)</label>
                    <Input dir="ltr" placeholder="your-code" value={form.google_site_verification} onChange={(e) => setForm({ ...form, google_site_verification: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5 text-blue-600">أكواد الهيدر (Header Scripts)</label>
                    <p className="text-xs text-muted-foreground mb-2 font-cairo">توضع داخل وسام &lt;head&gt; (مثل Google Analytics, FB Pixel)</p>
                    <Textarea dir="ltr" rows={5} placeholder="<script>...</script>" value={form.header_scripts} onChange={(e) => setForm({ ...form, header_scripts: e.target.value })} className="font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block font-cairo text-sm font-medium mb-1.5 text-green-600">أكواد الفوتر (Footer Scripts)</label>
                    <p className="text-xs text-muted-foreground mb-2 font-cairo">توضع قبل إغلاق وسام &lt;body&gt;</p>
                    <Textarea dir="ltr" rows={5} placeholder="<script>...</script>" value={form.footer_scripts} onChange={(e) => setForm({ ...form, footer_scripts: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-cairo font-bold text-foreground mb-6 font-cairo">إحصائيات الصفحة الرئيسية (Stats)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {form.home_stats.map((stat, idx) => (
                  <div key={idx} className="p-4 bg-secondary/20 rounded-lg border border-border space-y-3">
                    <p className="text-xs font-bold text-primary font-cairo">الإحصائية {idx + 1}</p>
                    <div>
                      <label className="block text-[10px] font-bold mb-1 font-cairo">القيمة (مثلاً +1000)</label>
                      <Input value={stat.value} onChange={(e) => {
                        const newStats = [...form.home_stats];
                        newStats[idx].value = e.target.value;
                        setForm({ ...form, home_stats: newStats });
                      }} className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold mb-1 font-cairo">الوصف (مثلاً عميل سعيد)</label>
                      <Input value={stat.label} onChange={(e) => {
                        const newStats = [...form.home_stats];
                        newStats[idx].label = e.target.value;
                        setForm({ ...form, home_stats: newStats });
                      }} className="h-8 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminSettings;
