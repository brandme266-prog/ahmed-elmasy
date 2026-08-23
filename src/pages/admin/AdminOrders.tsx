import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ShoppingBag, Filter, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "قيد الانتظار", variant: "secondary" },
  confirmed: { label: "مؤكد", variant: "default" },
  delivered: { label: "تم التسليم", variant: "outline" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  product_name: string;
  quantity: number;
  status: string;
  created_at: string;
  customer_email?: string | null;
  notes?: string | null;
  products?: { price: number } | null;
}

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const { data: orders = [], isLoading } = useQuery<AdminOrder[], Error>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, products(price)").order("created_at", { ascending: false });
      if (error) {
        console.warn("AdminOrders load failed", error);
        return [];
      }
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("تم تحديث الحالة");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("تم حذف الطلب بنجاح");
      setSelectedOrder(null);
    },
  });

  const filtered = orders?.filter(o => {
    const matchSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.product_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

  const handlePrint = (order: AdminOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("يرجى السماح بالنوافذ المنبثقة (Pop-ups) لطباعة الفاتورة");
      return;
    }

    const htmlContent = `
      <html dir="rtl" lang="ar">
        <head>
          <title>تصريح خروج - طلب #${order.id.split('-')[0]}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { max-width: 120px; margin-bottom: 15px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; color: #111; }
            .subtitle { color: #666; margin-top: 5px; }
            .details-container { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; width: 45%; }
            .box h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 16px; }
            .row { margin-bottom: 8px; font-size: 14px; }
            .label { font-weight: bold; color: #555; display: inline-block; width: 80px; }
            table { w-full; width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            th { background-color: #f9f9f9; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; padding: 0 40px; }
            .sig-box { text-align: center; }
            .sig-line { width: 150px; border-bottom: 1px solid #333; margin-top: 40px; }
            @media print {
              body { padding: 0; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">تصريح خروج / إذن تسليم</h1>
            <p class="subtitle">رقم الطلب: ${order.id}</p>
            <p class="subtitle">تاريخ الطلب: ${new Date(order.created_at).toLocaleDateString("ar-EG")}</p>
          </div>
          
          <div class="details-container">
            <div class="box">
              <h3>بيانات العميل</h3>
              <div class="row"><span class="label">الاسم:</span> ${order.customer_name}</div>
              <div class="row"><span class="label">رقم الهاتف:</span> <span dir="ltr">${order.customer_phone}</span></div>
              <div class="row"><span class="label">البريد:</span> ${order.customer_email || 'لا يوجد'}</div>
            </div>
            <div class="box">
              <h3>معلومات التسليم</h3>
              <div class="row"><span class="label">الحالة:</span> ${statusMap[order.status]?.label || order.status}</div>
              <div class="row"><span class="label">تاريخ الطباعة:</span> ${new Date().toLocaleDateString("ar-EG")}</div>
            </div>
          </div>

          <h3>محتويات الطلب</h3>
          <table>
            <thead>
              <tr>
                <th>اسم المنتج</th>
                <th>سعر الوحدة</th>
                <th>الكمية</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.product_name}</td>
                <td>${order.products?.price ? Number(order.products.price).toLocaleString("ar-EG") + ' ج.م' : '-'}</td>
                <td>${order.quantity}</td>
                <td><strong>${order.products?.price ? Number(order.products.price * order.quantity).toLocaleString("ar-EG") + ' ج.م' : '-'}</strong></td>
              </tr>
            </tbody>
          </table>

          ${order.notes ? `
          <div style="margin-top: 30px;">
            <h3>ملاحظات العميل:</h3>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">${order.notes}</p>
          </div>
          ` : ''}

          <div class="signature">
            <div class="sig-box">
              <p>توقيع مسؤول المخزن / الأمن</p>
              <div class="sig-line"></div>
            </div>
            <div class="sig-box">
              <p>توقيع المستلم / المندوب</p>
              <div class="sig-line"></div>
            </div>
          </div>

          <div class="footer">
            هذا المستند يعتبر تصريح خروج رسمي من مخازن أحمد الماسي.
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-cairo font-extrabold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          إدارة الطلبات
        </h1>
        <p className="text-sm text-muted-foreground font-cairo mt-1">{filtered.length} طلب</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو المنتج..." value={search} onChange={(e) => setSearch(e.target.value)} className="font-cairo pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 font-cairo">
            <Filter className="w-4 h-4 ml-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-cairo">الكل</SelectItem>
            {Object.entries(statusMap).map(([key, val]) => (
              <SelectItem key={key} value={key} className="font-cairo">{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-cairo">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--card-shadow)" }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="font-cairo font-bold">العميل</TableHead>
                <TableHead className="font-cairo font-bold">الهاتف</TableHead>
                <TableHead className="font-cairo font-bold">المنتج</TableHead>
                <TableHead className="font-cairo font-bold">الكمية</TableHead>
                <TableHead className="font-cairo font-bold">الحالة</TableHead>
                <TableHead className="font-cairo font-bold">التاريخ</TableHead>
                <TableHead className="font-cairo font-bold text-center">حذف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} className="hover:bg-secondary/20 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                  <TableCell className="font-cairo font-semibold">{o.customer_name}</TableCell>
                  <TableCell dir="ltr" className="text-sm">{o.customer_phone}</TableCell>
                  <TableCell className="font-cairo text-sm">{o.product_name}</TableCell>
                  <TableCell className="text-sm">{o.quantity}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => { updateStatus.mutate({ id: o.id, status: v }); }}>
                      <SelectTrigger className="w-32 font-cairo h-8" onClick={(e) => e.stopPropagation()}>
                        <Badge variant={statusMap[o.status]?.variant || "secondary"} className="font-cairo text-xs">
                          {statusMap[o.status]?.label || o.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusMap).map(([key, val]) => (
                          <SelectItem key={key} value={key} className="font-cairo">{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="font-cairo text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8 hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-cairo">حذف الطلب</AlertDialogTitle>
                          <AlertDialogDescription className="font-cairo">
                            هل أنت متأكد من حذف هذا الطلب بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2">
                          <AlertDialogCancel className="font-cairo">إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(o.id)} 
                            className="font-cairo bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            نعم، احذف الطلب
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-cairo">تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 font-cairo text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">العميل</p><p className="font-semibold">{selectedOrder.customer_name}</p></div>
                <div><p className="text-muted-foreground">الهاتف</p><p className="font-semibold" dir="ltr">{selectedOrder.customer_phone}</p></div>
                <div><p className="text-muted-foreground">البريد</p><p className="font-semibold" dir="ltr">{selectedOrder.customer_email || "-"}</p></div>
                <div><p className="text-muted-foreground">المنتج</p><p className="font-semibold">{selectedOrder.product_name}</p></div>
                <div><p className="text-muted-foreground">الكمية</p><p className="font-semibold">{selectedOrder.quantity}</p></div>
                <div><p className="text-muted-foreground">التاريخ</p><p className="font-semibold">{new Date(selectedOrder.created_at).toLocaleDateString("ar-EG")}</p></div>
              </div>
              {selectedOrder.notes && (
                <div><p className="text-muted-foreground">ملاحظات</p><p className="bg-secondary/50 rounded-lg p-3 mt-1">{selectedOrder.notes}</p></div>
              )}
              
              <div className="pt-4 mt-4 border-t flex justify-end">
                <Button 
                  onClick={() => handlePrint(selectedOrder)} 
                  className="font-cairo gap-2 w-full sm:w-auto"
                >
                  <Printer className="w-4 h-4" />
                  طباعة تصريح الخروج
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
