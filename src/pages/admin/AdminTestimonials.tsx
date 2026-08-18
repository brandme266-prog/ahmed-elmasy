import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, MessageSquare, Star } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface TestimonialForm {
  name: string;
  role: string;
  text: string;
  rating: number;
  image_url: string;
}

interface Testimonial extends TestimonialForm {
  id: string;
  created_at: string;
}

const emptyForm: TestimonialForm = { name: "", role: "", text: "", rating: 5, image_url: "" };

const AdminTestimonials = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Testimonial[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("testimonials").update(form).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(editId ? "تم التعديل بنجاح" : "تم الإضافة بنجاح");
      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
    },
    onError: () => toast.error("حدث خطأ - تأكد من تنفيذ كود SQL لإضافة جدول testimonials"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("تم الحذف");
    },
  });

  const openEdit = (t: Testimonial) => {
    setEditId(t.id);
    setForm({
      name: t.name,
      role: t.role || "",
      text: t.text,
      rating: t.rating || 5,
      image_url: t.image_url || "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-cairo font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            آراء العملاء
          </h1>
          <p className="text-sm text-muted-foreground font-cairo mt-1">إدارة التعليقات والتقييمات الظاهرة في الموقع</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }} className="font-cairo gap-2">
          <Plus className="w-4 h-4" /> إضافة رأي جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !testimonials || testimonials.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-cairo">لا توجد آراء عملاء حالياً</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="font-cairo font-bold">العميل</TableHead>
                <TableHead className="font-cairo font-bold">التعليق</TableHead>
                <TableHead className="font-cairo font-bold text-center">التقييم</TableHead>
                <TableHead className="font-cairo font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id} className="hover:bg-secondary/10">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="font-cairo font-semibold text-sm">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground font-cairo">{t.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="font-cairo text-sm text-muted-foreground line-clamp-2">{t.text}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(t)} className="h-8 w-8">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-cairo">حذف رأي العميل</AlertDialogTitle>
                            <AlertDialogDescription className="font-cairo">هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse gap-2">
                            <AlertDialogCancel className="font-cairo">إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(t.id)} className="font-cairo bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
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
            <DialogTitle className="font-cairo">{editId ? "تعديل رأي العميل" : "إضافة رأي جديد"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm font-medium mb-1.5">اسم العميل *</label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="font-cairo" />
              </div>
              <div>
                <label className="block font-cairo text-sm font-medium mb-1.5">الوصف (مثلاً: ربه منزل، شيف..)</label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="font-cairo" />
              </div>
              <div>
                <label className="block font-cairo text-sm font-medium mb-1.5">التعليق *</label>
                <Textarea required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="font-cairo h-32" />
              </div>
              <div>
                <label className="block font-cairo text-sm font-medium mb-1.5">التقييم (1-5)</label>
                <Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} className="font-cairo" />
              </div>
            </div>
            <Button type="submit" className="w-full font-cairo h-12" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "حفظ التعديلات" : "إضافة الرأي"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTestimonials;
