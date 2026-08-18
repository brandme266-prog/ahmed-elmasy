import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, FolderOpen, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ImageUpload from "@/components/ImageUpload";

interface CategoryForm {
  name: string;
  slug: string;
  icon: string;
  image_url: string;
}

interface Category extends CategoryForm {
  id: string;
  created_at: string;
}

const emptyForm: CategoryForm = { name: "", slug: "", icon: "", image_url: "" };

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Category[];
    },
  });

  const { data: productCounts } = useQuery({
    queryKey: ["category-product-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("category_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach((p) => {
        if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });
      return counts;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.replace(/\s+/g, "-").toLowerCase(),
        icon: form.icon || null,
        image_url: form.image_url || null,
      };
      if (editId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(editId ? "تم تعديل التصنيف" : "تم إضافة التصنيف");
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("تم حذف التصنيف");
    },
    onError: () => toast.error("لا يمكن حذف تصنيف مرتبط بمنتجات"),
  });

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || "", image_url: cat.image_url || "" });
    setDialogOpen(true);
  };

  const filtered = categories?.filter((c) => c.name.includes(search)) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-cairo font-extrabold text-foreground flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" /> إدارة التصنيفات
          </h1>
          <p className="text-sm text-muted-foreground font-cairo mt-1">{filtered.length} تصنيف</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }} className="font-cairo gap-2">
          <Plus className="w-4 h-4" /> تصنيف جديد
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="font-cairo pr-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-cairo">لا توجد تصنيفات</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--card-shadow)" }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="font-cairo font-bold">الصورة/الأيقونة</TableHead>
                <TableHead className="font-cairo font-bold">الاسم</TableHead>
                <TableHead className="font-cairo font-bold">الرابط</TableHead>
                <TableHead className="font-cairo font-bold">المنتجات</TableHead>
                <TableHead className="font-cairo font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-secondary/20">
                  <TableCell>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl">{cat.icon || "📁"}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-cairo font-semibold">{cat.name}</TableCell>
                  <TableCell className="font-cairo text-sm text-muted-foreground" dir="ltr">{cat.slug}</TableCell>
                  <TableCell className="font-cairo">{productCounts?.[cat.id] || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(cat)} className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-cairo">حذف التصنيف</AlertDialogTitle>
                            <AlertDialogDescription className="font-cairo">هل أنت متأكد من حذف "{cat.name}"؟</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse gap-2">
                            <AlertDialogCancel className="font-cairo">إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(cat.id)} className="font-cairo bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-cairo">{editId ? "تعديل التصنيف" : "تصنيف جديد"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block font-cairo">صورة القسم</label>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="categories"
              />
            </div>
            <Input placeholder="اسم التصنيف *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="font-cairo" />
            <Input placeholder="الرابط (slug) - يُنشأ تلقائياً" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="font-cairo" dir="ltr" />
            <Input placeholder="أيقونة (emoji) بديل للصورة" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="font-cairo" />
            <Button type="submit" className="w-full font-cairo" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "حفظ" : "إضافة"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
