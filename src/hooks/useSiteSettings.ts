import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteFeatureItem {
  bold: string;
  text: string;
}

export interface SiteStatItem {
  icon: string;
  value: string;
  label: string;
}

export interface SiteSettings {
  site_name?: string;
  site_description?: string;
  logo_url?: string;
  favicon_url?: string;
  email?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  google_site_verification?: string;
  hero_image?: string;
  about_image?: string;
  features_image?: string;
  footer_image?: string;
  header_scripts?: string;
  footer_scripts?: string;
  features_title?: string;
  features_bottom_text?: string;
  features_list?: SiteFeatureItem[];
  home_stats?: SiteStatItem[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "احمد الماسي العطور",
  logo_url: "/logo/logo'.jpg",
  favicon_url: "/logo/logo'.jpg",
  whatsapp: "01008246179",
  facebook: "https://www.facebook.com/share/1cJnbbT8xc/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/almassiperfume?igsh=MTRpZzlxcHYzeHMzdQ%3D%3D&igsi=MTRpZzlxcHYzeHMzdQ%3D%3D&utm_source=qr",
  tiktok: "https://www.tiktok.com/@almassiperfume",
};

export const useSiteSettings = () => {
  return useQuery<SiteSettings | null, Error>({
    queryKey: ["site-settings-public"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").single();
      if (error) {
        if (error.code === 'PGRST116') return DEFAULT_SETTINGS;
        console.warn("useSiteSettings fetch failed", error);
        return DEFAULT_SETTINGS;
      }
      
      const settings = data as unknown as SiteSettings;
      
      // Merge database settings with defaults.
      // This allows the Admin panel to control the images, stats, and text.
      const finalSettings = { 
        ...DEFAULT_SETTINGS,
        ...settings 
      };

      // Force correct whatsapp number if the old one is still in the DB
      if (finalSettings.whatsapp === "01000592469") {
        finalSettings.whatsapp = "01008246179";
      }

      return finalSettings;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};
