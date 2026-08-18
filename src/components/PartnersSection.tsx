import { motion } from "framer-motion";

const certifications = [
  { name: "ISO 22000", emoji: "🏅" },
  { name: "HACCP", emoji: "✅" },
  { name: "عضوي معتمد", emoji: "🌿" },
  { name: "حلال", emoji: "☪️" },
  { name: "جودة مصرية", emoji: "🇪🇬" },
  { name: "FDA", emoji: "🔬" },
];

const PartnersSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/3 rounded-full blur-[80px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground mb-4">
            <span className="text-gradient">شهادات الجودة</span>
          </h2>
          <p className="text-muted-foreground font-cairo max-w-2xl mx-auto">
            منتجاتنا معتمدة من أهم الجهات الرقابية والمعايير الدولية
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.name}
              className="bg-card rounded-2xl p-6 border border-border flex flex-col items-center justify-center gap-3 group hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
              style={{ boxShadow: "var(--card-shadow)" }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.05 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-4xl relative z-10">{cert.emoji}</span>
              <span className="font-cairo text-xs text-muted-foreground group-hover:text-foreground transition-colors relative z-10 font-bold">{cert.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
