import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleComments from "@/components/ArticleComments";

const fallbackArticles = [
  {
    id: "f1",
    title: "أسرار اختيار العطر المناسب لشخصيتك",
    slug: "how-to-choose-perfume",
    image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    excerpt: "تعرف على كيفية اختيار العطر الذي يعكس شخصيتك ويتناسب مع كيمياء جسمك ليدوم طويلاً.",
    content: "اختيار العطر ليس مجرد اختيار رائحة جميلة، بل هو تعبير عن شخصيتك وحالتك المزاجية. العطور تتفاعل مع كيمياء الجسم لتنتج رائحة فريدة تميزك عن غيرك.\n\nالخطوة الأولى هي فهم العائلات العطرية: الزهرية، الشرقية، الخشبية، والحمضية. إذا كنت شخصية كلاسيكية هادئة، فالعطور الزهرية والخشبية تناسبك. أما إذا كنت تبحث عن الحضور القوي والجاذبية، فالعطور الشرقية التي تحتوي على العود والعنبر هي الخيار الأمثل.\n\nنصيحة أخيرة: جرب العطر دائماً على بشرتك ولا تعتمد فقط على شريط الاختبار، وانتظر بضع دقائق حتى تظهر النوتات الأساسية للعطر.",
    author: "أحمد الماسي",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "f2",
    title: "الفرق بين العطور الفرنسية والشرقية",
    slug: "french-vs-oriental-perfumes",
    image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
    excerpt: "اكتشف السحر الخفي في العطور الشرقية المليئة بالعود والعنبر، ورقة العطور الفرنسية الكلاسيكية.",
    content: "عالم العطور ينقسم بشكل رئيسي إلى مدرستين: المدرسة الشرقية والمدرسة الفرنسية الغربية.\n\nتتميز العطور الشرقية بالدفء والقوة والغموض، وتعتمد على مكونات ثقيلة وثمينة مثل العود، المسك، العنبر، التوابل، واللبان. هذه العطور تدوم طويلاً جداً وتعطي طابعاً بالفخامة والأصالة.\n\nمن ناحية أخرى، تعتمد العطور الفرنسية على النعومة والتدرج الهرمي في الرائحة. ترتكز غالباً على الزهور، الحمضيات، والأخشاب الخفيفة. تمتاز بأنها عطور يومية منعشة وأكثر تنوعاً.\n\nفي أحمد الماسي، نحن نمزج بين المدرستين لنقدم لك عطوراً بتركيبة فرنسية وثبات وقوة شرقية.",
    author: "أحمد الماسي",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "f3",
    title: "كيف تحافظ على رائحة عطرك طوال اليوم؟",
    slug: "long-lasting-perfume-tips",
    image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600",
    excerpt: "نصائح وحيل ذهبية لطريقة رش العطر وأماكن النبض الصحيحة لضمان ثبات الرائحة أطول فترة ممكنة.",
    content: "الكثيرون يعانون من اختفاء رائحة العطر بعد ساعات قليلة، السر لا يكمن فقط في جودة العطر بل في طريقة استخدامه.\n\nأولاً، رش العطر على نقاط النبض في الجسم: خلف الأذنين، الرقبة، المعصمين، وثنية الكوع. هذه المناطق تصدر حرارة تساعد على انتشار العطر.\n\nثانياً، رطب بشرتك! العطر يتبخر بسرعة من البشرة الجافة، استخدم لوشن غير معطر قبل رش العطر لثبات مضاعف.\n\nثالثاً، لا تفرك المعصمين بعد رش العطر لأن هذا يكسر جزيئات العطر ويفسد تركيبته. وأخيراً، احفظ عطورك بعيداً عن الحرارة والرطوبة وأشعة الشمس المباشرة للحفاظ على جودتها.",
    author: "أحمد الماسي",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const fallback = fallbackArticles.find(a => a.slug === slug);
      if (fallback) return fallback;

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
