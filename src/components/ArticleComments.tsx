import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageCircle, Send, Loader2, User } from "lucide-react";

interface ArticleCommentsProps {
  articleId: string;
}

const ArticleComments = ({ articleId }: ArticleCommentsProps) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["article-comments", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_comments")
        .select("*")
        .eq("article_id", articleId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("article_comments").insert({
        article_id: articleId,
        name,
        email: email || null,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال تعليقك بنجاح! سيظهر بعد مراجعته.");
      setName("");
      setEmail("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["article-comments", articleId] });
    },
    onError: () => toast.error("حدث خطأ أثناء إرسال التعليق"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error("يرجى ملء الاسم والتعليق");
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="mt-12 border-t border-border pt-10">
      <h3 className="text-2xl font-cairo font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary" />
        التعليقات
        {comments && comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border border-border mb-8" style={{ boxShadow: "var(--card-shadow)" }}>
        <h4 className="font-cairo font-semibold text-foreground mb-4">أضف تعليقك</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-cairo text-muted-foreground mb-1 block">الاسم *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="font-cairo" placeholder="اسمك" required />
          </div>
          <div>
            <label className="text-sm font-cairo text-muted-foreground mb-1 block">البريد الإلكتروني (اختياري)</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="font-cairo" placeholder="email@example.com" type="email" />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-cairo text-muted-foreground mb-1 block">التعليق *</label>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="font-cairo" placeholder="اكتب تعليقك هنا..." rows={4} required />
        </div>
        <Button type="submit" disabled={submitMutation.isPending} className="gap-2">
          {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          إرسال التعليق
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card rounded-xl p-5 border border-border"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-cairo font-semibold text-foreground text-sm">{comment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className="font-cairo text-foreground/90 text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground font-cairo py-6">لا توجد تعليقات بعد. كن أول من يعلق!</p>
      )}
    </div>
  );
};

export default ArticleComments;
