import { Link } from "react-router-dom";
import { useSiteSettings, type SiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { data } = useSiteSettings();
  const settings = data as SiteSettings | null;

  const socialLinks = [];
  if (settings) {
    if (settings.facebook) {
      socialLinks.push({ 
        label: "Facebook", 
        link: settings.facebook, 
        d: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
      });
    }
    if (settings.instagram) {
      socialLinks.push({ 
        label: "Instagram", 
        link: settings.instagram, 
        d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      });
    }
    if (settings.tiktok) {
      socialLinks.push({ 
        label: "TikTok", 
        link: settings.tiktok, 
        d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.4-2.31 5.96-1.4 1.54-3.54 2.5-5.69 2.59-2.14.09-4.32-.48-5.94-1.87-1.63-1.39-2.61-3.41-2.82-5.54-.21-2.13.43-4.33 1.83-5.94 1.4-1.6 3.48-2.64 5.63-2.73V13.3c-1.04.16-2.05.65-2.78 1.41-.73.76-1.12 1.8-1.08 2.86.04 1.06.56 2.05 1.34 2.74.78.69 1.87 1.04 2.93 1 .98-.03 1.93-.42 2.62-1.1.69-.68 1.05-1.68 1.05-2.64V.02h4.16z" 
      });
    }
    if (settings.whatsapp) {
      const waLink = settings.whatsapp.startsWith('http') ? settings.whatsapp : `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`;
      socialLinks.push({ 
        label: "WhatsApp", 
        link: waLink, 
        d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      });
    }
  }

  return (
    <footer className="bg-white dark:bg-background border-t border-border pt-20 pb-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group inline-flex">
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src={settings?.logo_url || "/logo-main.jpg"} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-foreground">
                {settings?.site_name || "أحمد الماسي"}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs font-light">
              {settings?.site_description || "شركة رائدة في مجال العطور الفاخرة. نقدم أجود أنواع العطور الشرقية والفرنسية والعود بأسعار تنافسية."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-foreground mb-6 text-lg tracking-wide">روابط سريعة</h4>
            <ul className="space-y-3">
              {[
                { label: "الرئيسية", href: "/" },
                { label: "من نحن", href: "/#about" },
                { label: "منتجاتنا", href: "/products" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="font-bold text-foreground mb-6 text-lg tracking-wide">المزيد</h4>
            <ul className="space-y-3">
              {[
                { label: "المقالات", href: "/articles" },
                { label: "تواصل معنا", href: "/#contact" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-foreground mb-6 text-lg tracking-wide">تواصل معنا</h4>
            <div className="space-y-4 text-sm text-muted-foreground font-light">
              <p className="flex items-center gap-3 font-en">
                <span className="text-primary">•</span> 
                <span dir="ltr">{settings?.whatsapp || "+20 123 456 7890"}</span>
              </p>
              <p className="flex items-center gap-3 font-en">
                <span className="text-primary">•</span> 
                {settings?.email || "info.ahmedmasi@gmail.com"}
              </p>
              <p className="flex items-center gap-3">
                <span className="text-primary">•</span> 
                مصر - القاهرة
              </p>
            </div>
            {/* Social */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 mt-8">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.link} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d}/></svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <p className="text-muted-foreground text-sm font-light">
            © {new Date().getFullYear()} {settings?.site_name || "أحمد الماسي"}. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-light">
            <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-primary transition-colors">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
