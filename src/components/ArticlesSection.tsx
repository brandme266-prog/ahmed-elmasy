import { motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { staticArticles } from "@/data/articles";

const ArticlesSection = () => {
  const displayArticles = staticArticles.slice(0, 3);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-[80px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground">
              <span className="text-gradient">أحدث المقالات</span>
            </h2>
            <p className="text-muted-foreground font-cairo mt-2">اقرأ آخر الأخبار والنصائح</p>
          </div>
          <Link to="/articles" className="hidden md:flex items-center gap-2 font-cairo font-bold text-primary hover:text-primary/80 transition-colors">
            عرض الكل <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Link
                to={`/articles/${article.slug}`}
                className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-primary/30 transition-all duration-300 block relative"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
                {article.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img src={article.image_url} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-cairo mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(article.published_at || article.created_at).toLocaleDateString("ar-EG")}
                  </div>
                  <h3 className="font-cairo font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                  {article.excerpt && <p className="text-sm text-muted-foreground font-cairo line-clamp-2">{article.excerpt}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <Link to="/articles" className="md:hidden flex items-center justify-center gap-2 font-cairo font-bold text-primary mt-8">
          عرض كل المقالات <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default ArticlesSection;
