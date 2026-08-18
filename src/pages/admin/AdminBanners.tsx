import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BannerForm {
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  is_active: boolean;
  sort_order: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean;
  sort_order: number;
}

const emptyForm: BannerForm = { title: "", subtitle: "", image_url: "", link: "", is_active: true, sort_order: "0" };

const AdminBanners = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("banners").select("*").order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as Banner[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        image_url: form.image_url || null,
        link: form.link || null,
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (editId) {
        const { error } = await supabase.from("banners").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success(editId ? "تم التعديل" : "تم الإضافة");
      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("تم الحذف");
    },
  });

  const openEdit = (b: Banner) => {
    setEditId(b.id);
    setForm({ title: b.title, subtitle: b.subtitle || "", image_url: b.image_url || "", link: b.link || "", is_active: !!b.is_active, sort_order: String(b.sort_order) });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-cairo font-extrabold text-foreground flex items-center gap-2">
            <Image className="w-6 h-6 text-primary" />
            إدارة البانرات
          </h1>
          <p className="text-sm text-muted-foreground font-cairo mt-1">{banners?.length || 0} بانر</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }} className="font-cairo gap-2">
          <Plus className="w-4 h-4" /> إضافة بانر
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : banners?.length === 0 ? (
        <div className="text-center py-16">
          <Image className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-cairo">لا توجد بانرات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners?.map((b) => (
            <div key={b.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow" style={{ boxShadow: "var(--card-shadow)" }}>
              {b.image_url && (
                <div className="h-40 overflow-hidden">
                  <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-cairo font-bold text-foreground">{b.title}</h3>
                  <Badge variant={b.is_active ? "default" : "secondary"} className="font-cairo text-xs">
                    {b.is_active ? "مفعّل" : "معطّل"}
                  </Badge>
                </div>
                {b.subtitle && <p className="font-cairo text-sm text-muted-foreground mb-3">{b.subtitle}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-cairo">ترتيب: {b.sort_order}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)} className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-cairo">حذف البانر</AlertDialogTitle>
                          <AlertDialogDescription className="font-cairo">هل أنت متأكد من حذف "{b.title}"؟</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2">
                          <AlertDialogCancel className="font-cairo">إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(b.id)} className="font-cairo bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-cairo">{editId ? "تعديل البانر" : "إضافة بانر جديد"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <Input placeholder="العنوان *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="font-cairo" />
            <Input placeholder="العنوان الفرعي" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="font-cairo" />
            <Input placeholder="رابط الصورة" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="font-cairo" dir="ltr" />
            <Input placeholder="الرابط" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="font-cairo" dir="ltr" />
            <Input placeholder="الترتيب" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="font-cairo" />
            <label className="flex items-center gap-2 font-cairo text-sm">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /> مفعّل
            </label>
            <Button type="submit" className="w-full font-cairo" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "حفظ" : "إضافة"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBanners;
