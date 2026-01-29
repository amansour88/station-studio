import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, LogIn, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client.safe";
import Logo from "@/components/ui/Logo";
import stationHero from "@/assets/station-hero.jpg";

const loginSchema = z.object({
  identifier: z.string().min(1, { message: "اسم المستخدم أو البريد الإلكتروني مطلوب" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  // Load remembered credentials
  useEffect(() => {
    const remembered = localStorage.getItem("aws_remember_login");
    if (remembered) {
      try {
        const data = JSON.parse(remembered);
        setIdentifier(data.identifier || "");
        setRememberMe(true);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const result = loginSchema.safeParse({ identifier, password });
    if (!result.success) {
      const fieldErrors: { identifier?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "identifier") fieldErrors.identifier = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      let email = identifier;

      // Check if identifier is a username (not an email)
      if (!identifier.includes("@")) {
        // Look up email by username
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("username", identifier)
          .single();

        if (profileError || !profile) {
          toast({
            variant: "destructive",
            title: "خطأ في تسجيل الدخول",
            description: "اسم المستخدم غير موجود",
          });
          setIsLoading(false);
          return;
        }

        // Get user email from auth
        // Since we can't query auth.users directly, we'll try to sign in with the identifier as email first
        // If it fails, the username lookup already failed
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يرجى استخدام البريد الإلكتروني لتسجيل الدخول",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول",
          description: error.message === "Invalid login credentials" 
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : error.message,
        });
      } else {
        // Save to localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem("aws_remember_login", JSON.stringify({ identifier }));
        } else {
          localStorage.removeItem("aws_remember_login");
        }

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة التحكم",
        });
        navigate("/admin");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-cairo">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={stationHero}
          alt="خلفية"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-aws-burgundy-dark/90" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-aws-lg p-8 border border-border/50">
          <div className="text-center mb-8">
            <a href="/" className="inline-block mb-4">
              <Logo size="xl" />
            </a>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              لوحة التحكم
            </h1>
            <p className="text-muted-foreground">
              سجل دخولك للوصول إلى لوحة الإدارة
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@aws.sa"
                  dir="ltr"
                  className={`bg-muted/50 border-border focus:border-secondary text-left pl-10 ${
                    errors.identifier ? "border-destructive" : ""
                  }`}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              {errors.identifier && (
                <p className="text-destructive text-sm mt-1">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className={`bg-muted/50 border-border focus:border-secondary text-left pl-10 ${
                    errors.password ? "border-destructive" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  تذكرني
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-secondary transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-white/80 hover:text-secondary transition-colors"
          >
            العودة للموقع الرئيسي
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
