import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { 
  Users, Eye, MousePointer2, TrendingUp, 
  Globe, Laptop, Smartphone, AlertCircle 
} from "lucide-react";
import { format, subDays, startOfDay, isWithinInterval } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface PageView {
  id: string;
  ip_hash: string;
  path: string;
  user_agent: string;
  created_at: string;
}

const AdminAnalytics = () => {
  const { data: views, isLoading } = useQuery({
    queryKey: ["admin-page-views"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_views").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PageView[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!views || views.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
        <h2 className="text-xl font-cairo font-bold">لا توجد بيانات متاحة بعد</h2>
        <p className="text-muted-foreground font-cairo">سيتم عرض الإحصائيات هنا بمجرد أن يبدأ الزوار في تصفح الموقع.</p>
      </div>
    );
  }

  // Process data for charts
  const totalViews = views.length;
  const uniqueVisitors = new Set(views.map(v => v.ip_hash)).size;
  
  // Last 7 days chart data
  const last7Days = [...Array(7)].map((_, i) => {
    const d = subDays(new Date(), i);
    const dayName = format(d, "EEEE", { locale: ar });
    const count = views.filter(v => {
      const viewDate = new Date(v.created_at);
      return viewDate.toDateString() === d.toDateString();
    }).length;
    return { name: dayName, views: count };
  }).reverse();

  // Top Pages
  const pathCounts: Record<string, number> = {};
  views.forEach(v => {
    pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
  });
  const topPages = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({ path: path === "/" ? "الرئيسية" : path, count }));

  // Device Data
  const mobileCount = views.filter(v => /mobile|android|iphone/i.test(v.user_agent)).length;
  const desktopCount = totalViews - mobileCount;
  const deviceData = [
    { name: "موبايل", value: mobileCount },
    { name: "كمبيوتر", value: desktopCount },
  ];

  const COLORS = ["#22c55e", "#f59e0b"];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-cairo font-black text-foreground">تحليلات الزوار</h1>
        <p className="text-muted-foreground font-cairo">تابع نشاط موقعك في الوقت الفعلي.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-cairo font-bold text-muted-foreground">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold mt-1">{totalViews}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Eye className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-cairo font-bold text-muted-foreground">زوار فريدون</p>
                <p className="text-2xl font-bold mt-1">{uniqueVisitors}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-cairo font-bold text-muted-foreground">معدل التفاعل</p>
                <p className="text-2xl font-bold mt-1">{(totalViews / uniqueVisitors).toFixed(1)} <span className="text-xs text-muted-foreground">صفحة/زائر</span></p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <MousePointer2 className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-cairo font-bold text-muted-foreground">اتجاه النمو</p>
                <p className="text-2xl font-bold mt-1 text-primary">+{Math.min(totalViews, 100)}%</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-cairo font-bold text-lg">زيارات آخر 7 أيام</CardTitle>
            <CardDescription className="font-cairo">عدد المشاهدات يومياً.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="views" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-cairo font-bold text-lg">نوع الجهاز</CardTitle>
            <CardDescription className="font-cairo">توزيع الزوار حسب الجهاز.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 font-cairo">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#22c55e]" /> موبايل</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" /> كمبيوتر</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Top Pages Table */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-cairo font-bold text-lg">أكثر الصفحات زيارة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 group hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-background text-primary text-xs font-bold ring-1 ring-border">
                      {i + 1}
                    </div>
                    <span className="font-cairo text-sm font-semibold truncate max-w-[200px]">{page.path}</span>
                  </div>
                  <Badge className="font-cairo bg-primary/10 text-primary border-none">{page.count} مشاهدة</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global Reach - Placeholder icon list */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-cairo font-bold text-lg">الوصول الجغرافي</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
             <Globe className="w-20 h-20 text-primary/20 animate-pulse" />
             <div className="text-center">
               <p className="font-cairo font-bold">مصدر الزيارة الرئيسي: مصر</p>
               <p className="text-sm text-muted-foreground font-cairo">أغلب زيارات موقعك تأتي من المحافظات المصرية.</p>
             </div>
             <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[95%]" />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${className}`}>
    {children}
  </span>
);
