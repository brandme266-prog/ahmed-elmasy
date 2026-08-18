import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const logPageView = async () => {
      try {
        // Simple client-side "visitor ID" to help count unique visitors
        let visitorId = localStorage.getItem("ganna_visitor_id");
        if (!visitorId) {
          visitorId = Math.random().toString(36).substring(2, 15);
          localStorage.setItem("ganna_visitor_id", visitorId);
        }

        const { error } = await supabase.from("page_views").insert({
          path: location.pathname,
          referrer: document.referrer || "direct",
          user_agent: navigator.userAgent,
          ip_hash: visitorId, // Using the local ID as a unique identifier
        });

        if (error) {
          // Fail silently in production to not disturb the user
          console.error("Analytics log error:", error);
        }
      } catch (e) {
        console.error("Analytics failed:", e);
      }
    };

    // Delay slightly to ensure page title/context is ready
    const timer = setTimeout(logPageView, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;
