import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleComments from "@/components/ArticleComments";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/articles" className="inline-flex items-center gap-2 text-primary font-cairo font-semibold mb-8 hover:opacity-80">
            <ArrowRight className="w-4 h-4" />
            العودة للمقالات
          </Link>

          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-64 bg-muted rounded-2xl" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            </div>
          ) : !article ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-cairo text-lg">المقالة غير موجودة</p>
            </div>
          ) : (
            <>
              <article>
                <h1 className="text-3xl md:text-4xl font-cairo font-extrabold text-foreground mb-4">
                  {article.title}
                </h1>
                <div className="flex items-center gap-6 text-sm text-muted-foreground font-cairo mb-8">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
                      : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {article.author}
                  </span>
                </div>
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full rounded-2xl mb-8 max-h-[400px] object-cover"
                  />
                )}
                <div className="prose prose-lg max-w-none font-cairo text-foreground leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </div>
              </article>
              <ArticleComments articleId={article.id} />
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArticleDetail;
