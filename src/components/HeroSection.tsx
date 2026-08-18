import { motion } from "framer-motion";
import { useSiteSettings, type SiteSettings } from "@/hooks/useSiteSettings";

const defaultHeroImage = "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200";

const HeroSection = () => {
  const { data } = useSiteSettings();
  const settings = data as SiteSettings | null;
  const heroImage = settings?.hero_image || defaultHeroImage;

  return (
    <section id="hero" className="min-h-screen flex items-center pt-24 pb-12 relative overflow-hidden bg-background">
      {/* Optimized Deep Space / Premium Background Glows without heavy blur filters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Text Content */}
        <motion.div
          className="flex-1 text-center lg:text-right max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 mb-8 bg-card shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary tracking-[0.1em] text-xs sm:text-sm font-semibold uppercase">
              التجربة العطرية الفاخرة
            </span>
          </motion.div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold text-foreground leading-[1.1] mb-8">
            أحمد الماسي <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-yellow-300 to-yellow-600 font-medium block mt-2">
              جاذبية تأسر الحواس
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
            اكتشف تشكيلتنا الحصرية من العطور الفاخرة التي تمزج بين الأصالة الشرقية والرقي الفرنسي، لتمنحك حضوراً لا يُنسى ويدوم طويلاً.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center">
            <a
              href="/products"
              className="group relative overflow-hidden inline-flex items-center justify-center font-semibold px-10 py-4 rounded-xl text-primary-foreground text-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              style={{ background: "linear-gradient(135deg, hsl(43 74% 55%), hsl(35 80% 40%))" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                اكتشف المجموعة
                <svg className="w-5 h-5 rotate-180 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
              <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out duration-500" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center font-medium px-10 py-4 rounded-xl text-foreground text-lg border border-border/50 hover:border-primary/50 hover:bg-secondary/20 transition-all duration-300 bg-card"
            >
              عن علامتنا
            </a>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        >
          {/* Replaced heavy blur overlays with optimized CSS radial gradients */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-5 -left-10 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)' }} />
          
          <div className="relative w-full max-w-[400px] lg:max-w-[450px] aspect-[4/5] rounded-[2rem] overflow-hidden p-2 shadow-lg border border-border bg-card group">
            <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <img
                src={heroImage}
                alt="أحمد الماسي"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                fetchPriority="high"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
