import { Calendar, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { staticArticles } from "@/data/articles";

const Articles = () => {
  const displayArticles = staticArticles;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-cairo font-extrabold text-foreground mb-4">
              المقالات
            </h1>
            <p className="text-muted-foreground font-cairo max-w-2xl mx-auto">
              اكتشف آخر الأخبار والنصائح وكل ما يخص عالم العطور الفاخرة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {displayArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.slug}`}
                  className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-primary/30 transition-all duration-300"
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  {article.image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary/40" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-cairo mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
                          : ""}
                      </span>
                    </div>
                    <h3 className="text-lg font-cairo font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground font-cairo line-clamp-3 mb-4">{article.excerpt}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-primary font-cairo font-semibold text-sm">
                      اقرأ المزيد <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Articles;
