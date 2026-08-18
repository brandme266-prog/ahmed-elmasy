import { Helmet } from "react-helmet";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const MetaTags = () => {
  const { data: settings } = useSiteSettings();

  if (!settings) return null;

  return (
    <Helmet>
      {/* Dynamic SEO */}
      <title>{settings.site_name ? `${settings.site_name} - ${settings.site_description || ""}` : "أحمد الماسي - عطور فاخرة بجودة عالمية"}</title>
      <meta name="description" content={settings.site_description || "أحمد الماسي تقدم لك أندر وأفخم العطور التي تعكس شخصيتك بأعلى جودة وأفضل الأسعار"} />
      
      {/* Social Media Tags */}
      <meta property="og:title" content={settings.site_name || "أحمد الماسي - عطور فاخرة بجودة عالمية"} />
      <meta property="og:description" content={settings.site_description || "أحمد الماسي تقدم لك أندر وأفخم العطور التي تعكس شخصيتك بأعلى جودة وأفضل الأسعار"} />
      <meta property="og:image" content={settings.hero_image || "https://images.unsplash.com/photo-1615486171448-4fdcb5e8848a?auto=format&fit=crop&q=80&w=1200"} />
      <meta property="og:type" content="website" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={settings.site_name || "أحمد الماسي - عطور فاخرة بجودة عالمية"} />
      <meta name="twitter:description" content={settings.site_description || "أحمد الماسي تقدم لك أندر وأفخم العطور التي تعكس شخصيتك بأعلى جودة وأفضل الأسعار"} />
      <meta name="twitter:image" content={settings.hero_image || "https://images.unsplash.com/photo-1615486171448-4fdcb5e8848a?auto=format&fit=crop&q=80&w=1200"} />

      {/* Dynamic Favicon */}
      <link rel="icon" href={settings.favicon_url || "/logo-main.jpg"} />
      <link rel="shortcut icon" href={settings.favicon_url || "/logo-main.jpg"} />

      {/* Verification & Scripts */}
      {settings.google_site_verification && (
        <meta name="google-site-verification" content={settings.google_site_verification} />
      )}
      {settings.header_scripts && (
        <script type="text/javascript">{settings.header_scripts}</script>
      )}
    </Helmet>
  );
};

export default MetaTags;
