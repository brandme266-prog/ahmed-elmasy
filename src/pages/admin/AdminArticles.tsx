import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ImageUpload from "@/components/ImageUpload";

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  author: string;
}

const emptyForm: ArticleForm = { title: "", slug: "", excerpt: "", content: "", image_url: "", author: "أحمد الماسي" };

interface Article extends ArticleForm {
  id: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const AdminArticles = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Article[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        slug: form.slug || form.title.replace(/\s+/g, "-").toLowerCase(),
        excerpt: form.excerpt || null,
        content: form.content,
        image_url: form.image_url || null,
        author: form.author || "أحمد الماسي",
        updated_at: new Date().toISOString(),
      };
      if (editingId) {
        const { error } = await supabase.from("articles").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success(editingId ? "تم تحديث المقالة" : "تم إضافة المقالة");
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase.from("articles").update({
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("تم تحديث حالة النشر");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("تم حذف المقالة");
    },
  });

  const openEdit = (article: Article) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content,
      image_url: article.image_url || "",
      author: article.author || "أحمد الماسي",
    });
    setDialogOpen(true);
  };

  const filtered = articles?.filter((a) => a.title.includes(search) || a.excerpt?.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-cairo font-bold text-foreground">إدارة المقالات</h1>
          <p className="text-sm text-muted-foreground font-cairo">أنشئ وانشر مقالات لعملائك</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }} className="font-cairo gap-2">
          <Plus className="w-4 h-4" /> مقالة جديدة
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث في المقالات..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9 font-cairo" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-cairo text-muted-foreground">لا توجد مقالات</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-cairo text-right">العنوان</TableHead>
                <TableHead className="font-cairo text-right">الكاتب</TableHead>
                <TableHead className="font-cairo text-right">الحالة</TableHead>
                <TableHead className="font-cairo text-right">التاريخ</TableHead>
                <TableHead className="font-cairo text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-cairo font-medium max-w-[200px] truncate">{article.title}</TableCell>
                  <TableCell className="font-cairo text-muted-foreground">{article.author}</TableCell>
                  <TableCell>
                    <Badge variant={article.is_published ? "default" : "secondary"} className="font-cairo">
                      {article.is_published ? "منشور" : "مسودة"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-cairo text-muted-foreground text-sm">
                    {new Date(article.created_at).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => togglePublish.mutate({ id: article.id, publish: !article.is_published })} title={article.is_published ? "إلغاء النشر" : "نشر"}>
                        {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(article)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-cairo">حذف المقالة</AlertDialogTitle>
                            <AlertDialogDescription className="font-cairo">هل أنت متأكد من حذف هذه المقالة؟</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-cairo">إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(article.id)} className="font-cairo bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo">{editingId ? "تعديل المقالة" : "مقالة جديدة"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <Input placeholder="عنوان المقالة *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="font-cairo" />
            <Input placeholder="الرابط (slug) - يُنشأ تلقائياً" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="font-cairo" dir="ltr" />
            <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="articles" />
            <Input placeholder="الكاتب" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="font-cairo" />
            <Textarea placeholder="مقتطف قصير (يظهر في بطاقة المقالة)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="font-cairo min-h-[80px]" />
            <Textarea placeholder="محتوى المقالة *" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="font-cairo min-h-[200px]" />
            <Button type="submit" className="w-full font-cairo" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "تحديث" : "إضافة"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminArticles;
