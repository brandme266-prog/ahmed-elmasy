import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface ServiceForm {
  title: string;
  description: string;
  image_url: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface Service extends ServiceForm {
  id: string;
  created_at: string;
}

const emptyForm: ServiceForm = {
  title: "",
  description: "",
  image_url: "",
  icon: "",
  sort_order: 0,
  is_active: true,
};

const AdminServices = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as Service[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("services").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success(editId ? "تم تحديث الخدمة" : "تمت إضافة الخدمة");
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("تم حذف الخدمة");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("services").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-services"] }),
  });

  const openEdit = (service: Service) => {
    setEditId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      image_url: service.image_url || "",
      icon: service.icon || "",
      sort_order: service.sort_order || 0,
      is_active: !!service.is_active,
    });
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-cairo font-bold text-foreground">إدارة الخدمات</h1>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" /> إضافة خدمة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-cairo text-right">الترتيب</TableHead>
                <TableHead className="font-cairo text-right">الصورة</TableHead>
                <TableHead className="font-cairo text-right">العنوان</TableHead>
                <TableHead className="font-cairo text-right">الحالة</TableHead>
                <TableHead className="font-cairo text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <GripVertical className="w-4 h-4" />
                      {s.sort_order}
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.title} className="w-12 h-12 object-contain rounded" />
                    ) : s.icon ? (
                      <span className="text-2xl">{s.icon}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-cairo font-semibold">{s.title}</TableCell>
                  <TableCell>
                    <Switch
                      checked={s.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: s.id, is_active: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(s.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!services || services.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground font-cairo py-8">
                    لا توجد خدمات بعد
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-cairo">{editId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-cairo text-muted-foreground mb-1 block">العنوان</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="font-cairo" />
            </div>
            <div>
              <label className="text-sm font-cairo text-muted-foreground mb-1 block">الوصف</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="font-cairo" rows={3} />
            </div>
            <div>
              <label className="text-sm font-cairo text-muted-foreground mb-1 block">صورة الخدمة</label>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="services"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-cairo text-muted-foreground mb-1 block">أيقونة (Emoji)</label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📷" />
              </div>
              <div>
                <label className="text-sm font-cairo text-muted-foreground mb-1 block">الترتيب</label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              <span className="font-cairo text-sm">نشطة</span>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.title || !form.description || saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {editId ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
