import { motion } from "framer-motion";
import { Eye, Target, Users, Award, Shield, Leaf } from "lucide-react";
import { useSiteSettings, type SiteSettings } from "@/hooks/useSiteSettings";

const AboutSection = () => {
  const { data } = useSiteSettings();
  const settings = data as SiteSettings | null;
  
  const stats = settings?.home_stats || [
    { icon: Users, value: "+1000", label: "عميل سعيد" },
    { icon: Award, value: "+80", label: "منتج طبيعي" },
    { icon: Shield, value: "100%", label: "جودة مضمونة" },
    { icon: Leaf, value: "طبيعي", label: "بدون مواد حافظة" },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          <motion.div
            className="flex-1 text-right max-w-2xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              أحمد الماسي <span className="text-gradient">للعطور الفاخرة</span>
            </h2>
            <div className="text-muted-foreground text-lg font-light leading-relaxed space-y-4">
              <p>
                مرحباً بك في عالم <strong>أحمد الماسي للعطور</strong>، الوجهة الأولى في مصر والوطن العربي لعشاق التميز والفخامة. نحن متخصصون في تقديم أندر الزيوت العطرية وأفخم العطور المصممة خصيصاً لتلبي ذوقك الرفيع.
              </p>
              <p>
                إذا كنت تبحث عن <strong>أفضل عطور رجالية جذابة</strong> تمنحك الثقة في كل خطوة، أو <strong>عطور نسائية مثيرة</strong> تدوم طويلاً، فإن مجموعتنا الحصرية تضم أفضل العطور المستوحاة من الماركات العالمية (مثل عطر فيري سيكسي، سترونجر وذ يو، ودي جي) بتركيبات عالية التركيز والثبات.
              </p>
              <p>
                نؤمن بأن العطر ليس مجرد رائحة، بل هو هويتك وبصمتك التي تسبقك. لذلك نعتمد على استيراد أفضل الخامات العطرية لضمان فوحان استثنائي وثبات يدوم لأيام على الملابس، لتكتمل أناقتك في جميع مناسباتك وسهراتك.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 w-full relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute -inset-2 bg-primary/10 blur-xl rounded-[2rem] -z-10" />
            <img 
              src={settings?.about_image || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"} 
              alt="عن أحمد الماسي" 
              className="rounded-[1.5rem] shadow-lg w-full h-[350px] object-cover border border-border bg-card" 
            />
          </motion.div>
        </div>

        {/* Removed stats section */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Eye, title: "رؤيتنا", text: "أن نكون الخيار الأول للعطور الفاخرة في مصر والوطن العربي، من خلال تقديم عطور عالية الجودة من مصادر طبيعية وموثوقة." },
            { icon: Target, title: "مهمتنا", text: "توفير عطور فاخرة تمنحك جاذبية فريدة وتجعل إطلالتك أفضل، مع الالتزام بأعلى معايير الجودة وخدمة عملاء متميزة." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="glass-card bg-card border border-border shadow-sm rounded-[1.5rem] p-10 flex flex-col items-start text-right"
              initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center mb-6 bg-gradient-to-br from-primary to-yellow-600 shadow-md">
                <item.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
              <p className="text-muted-foreground/90 leading-relaxed text-lg font-light">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
