import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search, 
  Package, 
  Database, 
  ShoppingBag, 
  ListFilter, 
  Package2, 
  ImagePlus,
  ImageIcon,
  Save
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ImageUpload";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  unit: string;
  stock_quantity: string;
  image_url: string;
  image_urls: string[];
  category_id: string;
  is_featured: boolean;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  stock_quantity: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  category_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  categories?: { name: string } | null;
}

const emptyForm: ProductForm = { 
  name: "", 
  description: "", 
  price: "", 
  unit: "مل",
  stock_quantity: "50",
  image_url: "", 
  image_urls: [], 
  category_id: "", 
  is_featured: false, 
  is_active: true 
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Product[];
    },
  });

  const filtered = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price) || 0,
        unit: form.unit || "مل",
        stock_quantity: parseInt(form.stock_quantity) || 0,
        image_url: form.image_url || null,
        image_urls: form.image_urls.filter(Boolean),
        category_id: form.category_id || null,
        is_featured: form.is_featured,
        is_active: form.is_active,
      };
      if (editId) {
        const { error } = await supabase.from("products").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-all"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success(editId ? "تم التعديل بنجاح" : "تم الإضافة بنجاح");
      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-all"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("تم الحذف");
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      // 1. Delete old Smart Home data
      await supabase.from("articles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      const targetCategories = [
        { name: "عطور رجالية", slug: "men", icon: "👔" },
        { name: "عطور نسائية", slug: "women", icon: "👗" },
        { name: "عطور للجنسين", slug: "unisex", icon: "✨" },
        { name: "عود وبخور", slug: "oud", icon: "🪵" }
      ];
      
      const catMap: Record<string, string> = {};
      
      for (const cat of targetCategories) {
        const { data: existing } = await supabase.from("categories").select("id").eq("slug", cat.slug).maybeSingle();
        if (existing) {
          catMap[cat.slug] = existing.id;
        } else {
          const { data: inserted } = await supabase.from("categories").insert(cat).select().single();
          if (inserted) catMap[cat.slug] = inserted.id;
        }
      }

      const products = [
        { name: "أورينتال عود", description: "عطر فاخر يمزج بين أصالة العود ولمسات العنبر.", price: 1200, unit: "50 مل", stock_quantity: 30, category_id: catMap["oud"], image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop" },
        { name: "ميدنايت روز", description: "عطر نسائي جذاب برائحة الورد والياسمين.", price: 950, unit: "100 مل", stock_quantity: 45, category_id: catMap["women"], image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop" },
        { name: "بلاك وود", description: "عطر رجالي قوي برائحة الأخشاب والتوابل.", price: 1100, unit: "100 مل", stock_quantity: 25, category_id: catMap["men"], image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop" },
        { name: "مسك الحرير", description: "عطر للجنسين بنوتات المسك الصافي والانتعاش.", price: 850, unit: "50 مل", stock_quantity: 60, category_id: catMap["unisex"], image_url: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=800&auto=format&fit=crop" }
      ];

      for (const p of products) {
        await supabase.from("products").insert([p]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("تم إدراج بيانات المنتجات بنجاح");
    },
  });

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      unit: p.unit || "مل",
      stock_quantity: String(p.stock_quantity || 50),
      image_url: p.image_url || "",
      image_urls: p.image_urls || [],
      category_id: p.category_id || "",
      is_featured: !!p.is_featured,
      is_active: !!p.is_active,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-cairo font-extrabold text-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            إدارة المنتجات
          </h1>
          <p className="text-sm text-muted-foreground font-cairo mt-1">{filtered.length} منتج</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="font-cairo gap-2 text-primary hover:text-primary border-primary">
            {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />} توليد عطور تجريبية
          </Button>
          <Button onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }} className="font-cairo gap-2">
            <Plus className="w-4 h-4" /> إضافة منتج
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="font-cairo pr-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-cairo">لا توجد منتجات</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--card-shadow)" }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="font-cairo font-bold">المنتج</TableHead>
                <TableHead className="font-cairo font-bold">التصنيف</TableHead>
                <TableHead className="font-cairo font-bold">السعر</TableHead>
                <TableHead className="font-cairo font-bold">الحالة</TableHead>
                <TableHead className="font-cairo font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-secondary/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-cairo font-semibold text-sm">{p.name}</p>
                        {p.is_featured && <Badge variant="default" className="text-[10px] font-cairo mt-0.5">مميز ⭐</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-cairo text-sm text-muted-foreground">{p.categories?.name || "-"}</TableCell>
                  <TableCell className="font-cairo font-bold text-sm">{Number(p.price).toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"} className="font-cairo text-xs">
                      {p.is_active ? "مفعّل" : "معطّل"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-cairo">حذف المنتج</AlertDialogTitle>
                            <AlertDialogDescription className="font-cairo">هل أنت متأكد من حذف "{p.name}"؟ لا يمكن التراجع عن هذا.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse gap-2">
                            <AlertDialogCancel className="font-cairo">إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(p.id)} className="font-cairo bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent className="sm:max-w-xl w-[95vw] h-full overflow-hidden flex flex-col p-0" side="left">
          <SheetHeader className="p-6 border-b bg-secondary/10">
            <SheetTitle className="font-cairo text-right pr-4">{editId ? "تعديل المنتج" : "إضافة منتج جديد"}</SheetTitle>
            <SheetDescription className="font-cairo text-right pr-4">أكمل البيانات التالية لإضافة منتج جديد للمتجر.</SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-6">
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-6 pb-20">
              <Tabs defaultValue="basic" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="basic" className="font-cairo gap-2">
                    <ListFilter className="w-4 h-4" /> البيانات الأساسية
                  </TabsTrigger>
                  <TabsTrigger value="media" className="font-cairo gap-2">
                    <ImagePlus className="w-4 h-4" /> الصور والمخزون
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 pt-2">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-cairo font-bold flex items-center gap-2">
                        <Package2 className="w-4 h-4 text-primary" /> اسم المنتج *
                      </label>
                      <Input placeholder="مثلاً: مسك الحرير 50 مل" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="font-cairo h-12" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-cairo font-bold">التصنيف *</label>
                      <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                        <SelectTrigger className="font-cairo h-12"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                        <SelectContent className="font-cairo">
                          {categories?.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="font-cairo">{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-cairo font-bold">وصف المنتج</label>
                      <Textarea placeholder="اكتب تفاصيل المنتج وفوائده..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="font-cairo min-h-[120px] resize-none" />
                    </div>

                    <div className="pt-4 border-t border-dashed">
                      <h4 className="text-sm font-bold font-cairo mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-primary" /> خيارات العرض
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/10 group cursor-pointer transition-colors active:scale-95">
                          <span className="font-cairo text-sm">مفعّل (يظهر للعملاء)</span>
                          <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/10 group cursor-pointer transition-colors active:scale-95">
                          <span className="font-cairo text-sm">منتج مميز (Hero)</span>
                          <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                        </label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-8 pt-2">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold font-cairo flex items-center gap-2 text-primary">
                      <ImageIcon className="w-4 h-4" /> الصورة الرئيسية للمنتج
                    </h4>
                    <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="products" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
                    <div className="space-y-1.5">
                      <label className="text-sm font-cairo font-bold">السعر (ج.م) *</label>
                      <Input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="font-cairo h-12" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-cairo font-bold">الوحدة (مل، زجاجة..)</label>
                      <Input placeholder="مل" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="font-cairo h-12" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-cairo font-bold">الكمية المتوفرة (المخزون)</label>
                    <Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="font-cairo h-12" />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed">
                    <h4 className="text-sm font-bold font-cairo">باقي صور المنتج (الجاليري)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-cairo font-bold">الصورة {idx + 1}</p>
                          <ImageUpload 
                            value={form.image_urls[idx] || ""} 
                            onChange={(url) => {
                              const newUrls = [...form.image_urls];
                              newUrls[idx] = url;
                              setForm({ ...form, image_urls: newUrls });
                            }} 
                            folder="products" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button onClick={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="w-full h-12 font-cairo text-lg" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <Save className="w-5 h-5 ml-2" />}
              {editId ? "حفظ التعديلات" : "إضافة المنتج الآن"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminProducts;
