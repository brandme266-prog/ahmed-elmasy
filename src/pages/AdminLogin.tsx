import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("بيانات الدخول غير صحيحة");
      setLoading(false);
      return;
    }
    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast.error("ليس لديك صلاحيات الأدمن");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    toast.success("تم تسجيل الدخول بنجاح");
    navigate("/admin");
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
    });
    
    if (error) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
      setLoading(false);
      return;
    }

    toast.success("تم إنشاء الحساب بنجاح! جرب تسجيل الدخول الآن.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 px-4">
      <div className="w-full max-w-sm bg-card rounded-xl border border-border p-8" style={{ boxShadow: "var(--card-shadow)" }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-cairo font-extrabold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground font-cairo text-sm mt-1">تسجيل دخول الأدمن</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="font-cairo"
            dir="ltr"
          />
          <Input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="font-cairo"
            dir="ltr"
          />
          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" className="w-full font-cairo" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تسجيل الدخول"}
            </Button>
            
            {/* زر مؤقت لإنشاء الحساب النظيف لحل المشكلة */}
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSignUp}
              className="w-full font-cairo border-dashed border-primary/50 text-primary hover:bg-primary/5" 
              disabled={loading}
            >
              إنشاء حساب جديد (مؤقت)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
