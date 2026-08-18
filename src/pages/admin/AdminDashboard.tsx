import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, MessageSquare, Image, TrendingUp, Clock, Eye, Wrench, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "قيد الانتظار", variant: "secondary" },
  confirmed: { label: "مؤكد", variant: "default" },
  delivered: { label: "تم التسليم", variant: "outline" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

const COLORS = ["hsl(43 74% 49%)", "hsl(35 80% 45%)", "hsl(0 0% 20%)", "hsl(0 0% 40%)"];

interface PageView {
  id: string;
  ip_hash: string;
}

interface OrderSummary {
  id: string;
  total_amount: number | null;
  status: string;
  created_at: string;
  product_name: string;
  quantity: number;
  customer_name?: string;
}

const AdminDashboard = () => {
  const { data: products } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["admin-services-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("services").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: orders } = useQuery<OrderSummary[], Error>({
    queryKey: ["admin-orders-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id, status, created_at, product_name, quantity, customer_name");
      if (error) {
        console.warn("AdminDashboard orders load failed", error);
        return [];
      }
      return (data || []) as unknown as OrderSummary[];
    },
  });

  const { data: pageViews } = useQuery<PageView[], Error>({
    queryKey: ["admin-page-views-brief"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_views").select("id, ip_hash");
      if (error) {
        console.warn("AdminDashboard pageViews load failed", error);
        return [];
      }
      return (data || []) as unknown as PageView[];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["admin-messages-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: banners } = useQuery({
    queryKey: ["admin-banners-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("banners").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const unreadMessages = messages?.filter(m => !m.is_read).length || 0;
  const recentOrders = orders?.slice(0, 5) || [];
  const recentMessages = messages?.slice(0, 5) || [];

  const ordersPerDay = useMemo(() => {
    if (!orders) return [];
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric" });
      days[key] = 0;
    }
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        const key = d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric" });
        if (key in days) days[key]++;
      }
    });
    return Object.entries(days).map(([name, count]) => ({ name, الطلبات: count }));
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    if (!orders) return [];
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const label = statusMap[o.status]?.label || o.status;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const topProducts = useMemo(() => {
    if (!orders) return [];
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.product_name] = (counts[o.product_name] || 0) + o.quantity;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, الكمية]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, الكمية }));
  }, [orders]);

  const stats = [
    {
      title: "إجمالي المشاهدات",
      value: pageViews?.length || 0,
      icon: Eye,
      description: "منذ بدء التشغيل",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "الزوار الفريدون",
      value: new Set(pageViews?.map(v => v.ip_hash)).size || 0,
      icon: Users,
      description: "عدد الأجهزة المميزة",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "إجمالي المبيعات",
      value: `${(orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0).toLocaleString()} ج.م`,
      icon: TrendingUp,
      description: "من كافة الطلبات",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "الطلبات الجديدة",
      value: orders?.filter(o => o.status === "pending").length || 0,
      icon: ShoppingCart,
      description: "في انتظار المراجعة",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    { title: "البانرات", value: banners ?? 0, icon: Image, color: "bg-secondary text-secondary-foreground" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-cairo font-extrabold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground font-cairo mt-1">نظرة عامة على نشاط المتجر</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow" style={{ boxShadow: "var(--card-shadow)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-cairo font-extrabold text-foreground">{stat.value}</p>
            <p className="text-sm font-cairo text-muted-foreground">{stat.title}</p>
            {stat.description && <p className="text-xs font-cairo text-primary mt-1">{stat.description}</p>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Area Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5" style={{ boxShadow: "var(--card-shadow)" }}>
          <h2 className="text-lg font-cairo font-bold text-foreground mb-4">📈 الطلبات - آخر 7 أيام</h2>
          {ordersPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={ordersPerDay}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(245 75% 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(245 75% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Cairo" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ fontFamily: "Cairo", borderRadius: "8px", border: "1px solid hsl(220 15% 90%)" }}
                />
                <Area type="monotone" dataKey="الطلبات" stroke="hsl(245 75% 55%)" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground font-cairo py-16 text-sm">لا توجد بيانات</p>
          )}
        </div>

        {/* Status Pie */}
        <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: "var(--card-shadow)" }}>
          <h2 className="text-lg font-cairo font-bold text-foreground mb-4">📊 حالة الطلبات</h2>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  style={{ fontSize: 11, fontFamily: "Cairo" }}
                >
                  {ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Cairo", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground font-cairo py-16 text-sm">لا توجد بيانات</p>
          )}
        </div>
      </div>

      {/* Top Products Bar Chart */}
      {topProducts.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: "var(--card-shadow)" }}>
          <h2 className="text-lg font-cairo font-bold text-foreground mb-4">🏆 أكثر المنتجات طلباً</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fontFamily: "Cairo" }} />
              <Tooltip contentStyle={{ fontFamily: "Cairo", borderRadius: "8px" }} />
              <Bar dataKey="الكمية" fill="hsl(245 75% 55%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: "var(--card-shadow)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-cairo font-bold text-foreground">آخر الطلبات</h2>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground font-cairo py-6 text-sm">لا توجد طلبات بعد</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-cairo font-semibold text-sm text-foreground">{o.customer_name}</p>
                    <p className="font-cairo text-xs text-muted-foreground">{o.product_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusMap[o.status]?.variant || "secondary"} className="font-cairo text-xs">
                      {statusMap[o.status]?.label || o.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-cairo">
                      {new Date(o.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: "var(--card-shadow)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-cairo font-bold text-foreground">آخر الرسائل</h2>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-center text-muted-foreground font-cairo py-6 text-sm">لا توجد رسائل بعد</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((m) => (
                <div key={m.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${!m.is_read ? "bg-primary/5 border border-primary/20" : "bg-secondary/30 hover:bg-secondary/50"}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-cairo font-semibold text-sm text-foreground">{m.name}</p>
                      {!m.is_read && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <p className="font-cairo text-xs text-muted-foreground truncate">{m.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-cairo mr-3 whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
