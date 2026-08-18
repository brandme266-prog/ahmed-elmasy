import { motion } from "framer-motion";
import { useSiteSettings, type SiteSettings } from "@/hooks/useSiteSettings";

const defaultPerfumeShowcase = "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000";

const FeaturesSection = () => {
  const { data } = useSiteSettings();
  const settings = data as SiteSettings | null;
  const showcaseImage = settings?.features_image || defaultPerfumeShowcase;
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Optimized Background Decorators */}
      <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full -translate-y-1/2 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />
      
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16 md:gap-24 relative z-10">
        <motion.div
          className="flex-1 w-full flex justify-center md:justify-end"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative group perspective-1000">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-[3rem] opacity-70 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
            <div className="bg-card border border-border p-3 rounded-[2.5rem] shadow-lg transform transition-transform duration-700 group-hover:rotate-y-12">
              <img
                src={showcaseImage}
                alt="تشكيلة عطور أريج"
                width={600}
                height={800}
                loading="lazy"
                className="relative w-full max-w-sm md:max-w-md object-cover rounded-[2rem]"
                style={{ aspectRatio: "3/4" }}
              />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="flex-1 text-center md:text-right"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-10 h-[1px] bg-primary/50 block" />
            <span className="text-primary tracking-[0.2em] uppercase text-sm font-semibold">
              الفخامة في كل قطرة
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10 leading-tight">
            أحمد الماسي <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-400 to-yellow-600 block mt-2">
              فن العطارة الأصيلة
            </span>
          </h2>
          
          <ul className="space-y-8 text-base md:text-lg text-muted-foreground">
            {[
              { title: "مكونات نادرة وفريدة", desc: "ننتقي أندر الزيوت العطرية من حول العالم لنقدم لك تجربة استثنائية." },
              { title: "ثبات وفوحان يدوم", desc: "عطورنا مصممة بتركيزات عالية لترافقك رائحتها طوال اليوم." },
              { title: "تصاميم تعكس رقيّك", desc: "زجاجات صُممت بعناية لتكون تحفة فنية تزين خزانة عطورك." },
            ].map((item, i) => (
              <motion.li
                key={i}
                className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-right group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
              >
                <div className="w-14 h-14 flex-shrink-0 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-2xl text-xl font-bold group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 font-en">
                  0{i + 1}
                </div>
                <div>
                  <h4 className="text-foreground text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-sm md:text-base font-light text-muted-foreground/90 leading-relaxed max-w-sm">{item.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
