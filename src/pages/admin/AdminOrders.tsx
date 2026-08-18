import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ShoppingBag, Filter } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  notes?: string | null;
}

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const { data: orders = [], isLoading } = useQuery<AdminOrder[], Error>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from<AdminOrder>("orders").select("*").order("created_at", { ascending: false });
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

  const filtered = orders?.filter(o => {
    const matchSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.product_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
