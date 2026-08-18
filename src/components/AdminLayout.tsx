import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, Image, LogOut, Home, Loader2, BookOpen, FolderOpen, Wrench, Settings, Star, LineChart, Tag } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const menuItems = [
  { title: "الرئيسية", url: "/admin", icon: LayoutDashboard },
  { title: "المنتجات", url: "/admin/products", icon: Package },
  { title: "الطلبات", url: "/admin/orders", icon: ShoppingBag, badgeKey: "orders" },
  { title: "الرسائل", url: "/admin/messages", icon: MessageSquare, badgeKey: "messages" },
  { title: "آراء العملاء", url: "/admin/testimonials", icon: Star },
  { title: "البانرات", url: "/admin/banners", icon: Image },
  { title: "المقالات", url: "/admin/articles", icon: BookOpen },
  { title: "التصنيفات", url: "/admin/categories", icon: FolderOpen },
  { title: "الخصومات", url: "/admin/discounts", icon: Tag },
  { title: "التحليلات", url: "/admin/analytics", icon: LineChart },
  { title: "الإعدادات", url: "/admin/settings", icon: Settings },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const { data: pendingOrders } = useQuery({
    queryKey: ["pending-orders-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  const { data: unreadMessages } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false);
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  const badges: Record<string, number> = {
    orders: pendingOrders || 0,
    messages: unreadMessages || 0,
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-cairo text-xs uppercase tracking-wider">القائمة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50 relative"
                      activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                    >
                      <item.icon className="ml-2 h-4 w-4" />
                      {!collapsed && (
                        <span className="font-cairo flex-1">{item.title}</span>
                      )}
                      {!collapsed && item.badgeKey && badges[item.badgeKey] > 0 && (
                        <Badge variant="destructive" className="mr-auto text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full px-1.5">
                          {badges[item.badgeKey]}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/" className="hover:bg-muted/50">
                    <Home className="ml-2 h-4 w-4" />
                    {!collapsed && <span className="font-cairo">الموقع</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  {!collapsed && <span className="font-cairo">تسجيل الخروج</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleData) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });

    checkAdmin();
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-cairo text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="ml-3" />
            <NotificationBell />
            
            <a 
              href="/" 
              target="_blank" 
              className="mr-4 flex items-center gap-1.5 text-sm font-cairo font-medium text-muted-foreground hover:text-primary transition-colors bg-secondary/30 px-3 py-1.5 rounded-full"
            >
              <Home className="w-4 h-4" />
              <span>زيارة الموقع</span>
            </a>
            
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <img src="/logo-main.jpg" alt="Logo" className="w-9 h-9 rounded-full object-cover border border-border shadow-sm" />
              <h2 className="font-cairo font-bold text-foreground">أحمد الماسي</h2>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 bg-secondary/10 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
