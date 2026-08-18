import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, Trash2, Search, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ContactMessage[];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMsg = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("تم الحذف");
    },
  });

  const filtered = messages?.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.message.toLowerCase().includes(search.toLowerCase())) || [];
  const unread = messages?.filter(m => !m.is_read).length || 0;

  const openMessage = (m: ContactMessage) => {
    setSelectedMsg(m);
    if (!m.is_read) markRead.mutate(m.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-cairo font-extrabold text-foreground flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          رسائل التواصل
          {unread > 0 && <Badge variant="destructive" className="font-cairo text-xs">{unread} جديدة</Badge>}
        </h1>
        <p className="text-sm text-muted-foreground font-cairo mt-1">{filtered.length} رسالة</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث في الرسائل..." value={search} onChange={(e) => setSearch(e.target.value)} className="font-cairo pr-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-cairo">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--card-shadow)" }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="font-cairo font-bold">الاسم</TableHead>
                <TableHead className="font-cairo font-bold">الهاتف</TableHead>
                <TableHead className="font-cairo font-bold">البريد</TableHead>
                <TableHead className="font-cairo font-bold">الرسالة</TableHead>
                <TableHead className="font-cairo font-bold">التاريخ</TableHead>
                <TableHead className="font-cairo font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id} className={`hover:bg-secondary/20 cursor-pointer ${!m.is_read ? "bg-primary/5" : ""}`} onClick={() => openMessage(m)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!m.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      <span className="font-cairo font-semibold text-sm">{m.name}</span>
                    </div>
                  </TableCell>
                  <TableCell dir="ltr" className="text-sm">{m.phone || "-"}</TableCell>
                  <TableCell dir="ltr" className="text-sm">{m.email || "-"}</TableCell>
                  <TableCell className="font-cairo max-w-[200px] truncate text-sm text-muted-foreground">{m.message}</TableCell>
                  <TableCell className="font-cairo text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {!m.is_read && (
                        <Button size="icon" variant="ghost" onClick={() => markRead.mutate(m.id)} className="h-8 w-8" title="تعيين كمقروء">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-cairo">حذف الرسالة</AlertDialogTitle>
                            <AlertDialogDescription className="font-cairo">هل أنت متأكد من حذف رسالة "{m.name}"؟</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse gap-2">
                            <AlertDialogCancel className="font-cairo">إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMsg.mutate(m.id)} className="font-cairo bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
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

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-cairo">تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          {selectedMsg && (
            <div className="space-y-4 font-cairo text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">الاسم</p><p className="font-semibold">{selectedMsg.name}</p></div>
                <div><p className="text-muted-foreground">التاريخ</p><p className="font-semibold">{new Date(selectedMsg.created_at).toLocaleDateString("ar-EG")}</p></div>
                <div><p className="text-muted-foreground">الهاتف</p><p className="font-semibold" dir="ltr">{selectedMsg.phone || "-"}</p></div>
                <div><p className="text-muted-foreground">البريد</p><p className="font-semibold" dir="ltr">{selectedMsg.email || "-"}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">الرسالة</p>
                <p className="bg-secondary/50 rounded-lg p-4 leading-relaxed">{selectedMsg.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
