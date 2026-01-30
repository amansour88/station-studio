import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import Logo from "@/components/ui/Logo";
import stationHero from "@/assets/station-hero.jpg";

const emailSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
});

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password.php", { email });
      
      setIsSuccess(true);
      toast({
        title: "تم الإرسال",
        description: "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: err.message || "حدث خطأ غير متوقع",
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
        {/* Card */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-aws-lg p-8 border border-border/50">
          {isSuccess ? (
            <div className="text-center">
              <a href="/" className="inline-block mb-4">
                <Logo size="xl" />
              </a>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                تم الإرسال بنجاح
              </h1>
              <p className="text-muted-foreground mb-6">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
                يرجى التحقق من صندوق الوارد.
              </p>
              <Link to="/admin/login">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                  <ArrowRight className="w-5 h-5 ml-2" />
                  العودة لتسجيل الدخول
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <a href="/" className="inline-block mb-4">
                  <Logo size="xl" />
                </a>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  نسيت كلمة المرور؟
                </h1>
                <p className="text-muted-foreground">
                  أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aws.sa"
                    dir="ltr"
                    className={`bg-muted/50 border-border focus:border-secondary text-left ${
                      error ? "border-destructive" : ""
                    }`}
                  />
                  {error && (
                    <p className="text-destructive text-sm mt-1">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      جاري الإرسال...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      إرسال رابط إعادة التعيين
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <Link
                  to="/admin/login"
                  className="text-primary hover:text-secondary transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
