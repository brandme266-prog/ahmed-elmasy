import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  // Realtime subscription for new notifications
  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
          queryClient.invalidateQueries({ queryKey: ["pending-orders-count"] });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
          
          const n = payload.new;
          toast.info(n.message, {
            action: {
              label: "عرض",
              onClick: () => navigate(n.link || "/admin/orders"),
            },
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, navigate]);

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  const markAllRead = async () => {
    const unreadIds = notifications?.filter((n) => !n.is_read).map((n) => n.id) || [];
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  const handleClick = (link: string | null) => {
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 text-[10px] rounded-full px-1.5 flex items-center justify-center animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" dir="rtl">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-cairo font-bold text-sm">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs font-cairo h-7" onClick={markAllRead}>
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {(!notifications || notifications.length === 0) ? (
            <p className="text-center text-muted-foreground font-cairo text-sm py-8">لا توجد إشعارات</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n.link)}
                className={`p-3 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${
                  !n.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-cairo font-semibold text-sm text-foreground">{n.title}</p>
                    <p className="font-cairo text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="font-cairo text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(n.created_at).toLocaleString("ar-EG")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
