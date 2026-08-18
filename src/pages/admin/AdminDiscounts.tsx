import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Tag, CheckSquare, Square, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDiscounts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [discountValue, setDiscountValue] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products-discounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async (percentage: number) => {
      if (selectedIds.length === 0) throw new Error("لم يتم تحديد أي منتج");
      
      const { error } = await supabase
        .from("products")
        .update({ discount_percentage: percentage })
        .in("id", selectedIds);
        
      if (error) throw error;
    },
    onSuccess: (_, percentage) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-discounts"] });
      toast.success(percentage === 0 ? "تم إزالة الخصم بنجاح" : `تم تطبيق خصم ${percentage}% بنجاح`);
      setSelectedIds([]);
      setDiscountValue("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "حدث خطأ أثناء تطبيق الخصم");
    }
  });

  const filtered = products?.filter(p => p.name.includes(search) || p.categories?.name?.includes(search)) || [];
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const toggleAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const handleApplyDiscount = () => {
    const val = parseInt(discountValue);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error("يرجى إدخال نسبة خصم صحيحة بين 0 و 100");
      return;
    }
    applyDiscountMutation.mutate(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-cairo font-extrabold text-foreground flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" /> إدارة الخصومات
          </h1>
          <p className="text-sm text-muted-foreground font-cairo mt-1">تحديد منتجات وتطبيق نسبة خصم عليها</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ابحث عن منتج..." value={search} onChange={(e) => setSearch(e.target.value)} className="font-cairo pr-9 w-full" />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto bg-secondary/30 p-2 rounded-lg border border-border/50">
          <div className="relative w-32">
            <Input 
              type="number" 
              placeholder="النسبة" 
              value={discountValue} 
              onChange={(e) => setDiscountValue(e.target.value)} 
              className="font-cairo pr-8"
              min="0"
              max="100"
            />
            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <Button 
            onClick={handleApplyDiscount} 
            disabled={applyDiscountMutation.isPending || selectedIds.length === 0}
            className="font-cairo shrink-0"
          >
            {applyDiscountMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق الخصم"}
          </Button>
          <Button 
            variant="outline"
            onClick={() => applyDiscountMutation.mutate(0)} 
            disabled={applyDiscountMutation.isPending || selectedIds.length === 0}
            className="font-cairo shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            إزالة الخصم
          </Button>
        </div>
      </div>

      <div className="mb-2 flex justify-between items-center px-2">
        <span className="text-sm text-muted-foreground font-cairo">تم تحديد {selectedIds.length} منتج</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="w-12 text-center">
                  <button onClick={toggleAll} className="p-1 hover:text-primary transition-colors">
                    {selectedIds.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-cairo font-bold">المنتج</TableHead>
                <TableHead className="font-cairo font-bold">القسم</TableHead>
                <TableHead className="font-cairo font-bold">السعر الأساسي</TableHead>
                <TableHead className="font-cairo font-bold">نسبة الخصم</TableHead>
                <TableHead className="font-cairo font-bold">السعر بعد الخصم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                const discount = product.discount_percentage || 0;
                const finalPrice = discount > 0 ? product.price - (product.price * discount / 100) : product.price;
                
                return (
                  <TableRow 
                    key={product.id} 
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-secondary/20'}`}
                    onClick={() => toggleSelect(product.id)}
                  >
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground/50" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-border" />
                        )}
                        <span className="font-cairo font-semibold">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-cairo">{product.categories?.name}</TableCell>
                    <TableCell className="font-cairo">{product.price} ج.م</TableCell>
                    <TableCell>
                      {discount > 0 ? (
                        <Badge variant="default" className="font-cairo bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border-0">
                          {discount}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground font-cairo text-sm">لا يوجد</span>
                      )}
                    </TableCell>
                    <TableCell className="font-cairo font-bold text-primary">
                      {finalPrice.toFixed(2)} ج.م
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 font-cairo text-muted-foreground">
                    لم يتم العثور على منتجات
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
