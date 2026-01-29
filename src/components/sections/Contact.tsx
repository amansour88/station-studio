import { useState } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(255),
  phone: z.string().trim().min(10, "رقم الجوال غير صحيح").max(20),
  city: z.string().max(100).optional(),
  message: z.string().trim().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل").max(1000),
});

const contactInfo = [
  {
    icon: Phone,
    title: "الهاتف",
    value: "920008436",
    link: "tel:920008436",
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    value: "info@aws.sa",
    link: "mailto:info@aws.sa",
  },
  {
    icon: MapPin,
    title: "العنوان",
    value: "طريق الملك عبدالله، المدينة المنورة، أبراج غوث، برج 2، الطابق السابع",
    link: "#",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.city ? `من ${formData.city}` : null,
        message: formData.message.trim(),
      });

      if (error) throw error;

      toast({
        title: "تم إرسال رسالتك بنجاح!",
        description: "سنتواصل معك في أقرب وقت ممكن",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-muted/50">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            تواصل معنا
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            نحن هنا
            <span className="text-primary"> لمساعدتك</span>
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            سواء كنت ترغب في الاستثمار معنا أو لديك استفسار، نحن سعداء بالتواصل معك
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">
              معلومات التواصل
            </h3>
            
            <div className="space-y-6 mb-10">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.link}
                  className="flex items-start gap-4 p-4 bg-card rounded-xl shadow-sm border border-border/50 hover:shadow-aws hover:border-secondary transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {info.title}
                    </h4>
                    <p className="text-muted-foreground" dir={info.title === "الهاتف" ? "ltr" : "rtl"}>
                      {info.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Franchise CTA */}
            <div className="bg-primary rounded-2xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">
                هل تريد الانضمام لعائلة اوس؟
              </h4>
              <p className="text-white/80 mb-4">
                احصل على امتياز تجاري وابدأ رحلة نجاحك معنا
              </p>
              <div className="flex items-center gap-2 text-secondary">
                <CheckCircle className="w-5 h-5" />
                <span>دعم فني متكامل</span>
              </div>
              <div className="flex items-center gap-2 text-secondary mt-2">
                <CheckCircle className="w-5 h-5" />
                <span>تدريب وتأهيل شامل</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-3xl shadow-aws-lg p-8 border border-border/50">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              أرسل لنا رسالة
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الاسم الكامل *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك"
                    required
                    className={`bg-muted/50 border-border focus:border-secondary ${errors.name ? 'border-destructive' : ''}`}
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    البريد الإلكتروني *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    dir="ltr"
                    className={`bg-muted/50 border-border focus:border-secondary text-left ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    رقم الجوال *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="05xxxxxxxx"
                    required
                    dir="ltr"
                    className={`bg-muted/50 border-border focus:border-secondary text-left ${errors.phone ? 'border-destructive' : ''}`}
                  />
                  {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    المدينة
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="المدينة"
                    className="bg-muted/50 border-border focus:border-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رسالتك *
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="اكتب رسالتك هنا..."
                  required
                  rows={5}
                  className={`bg-muted/50 border-border focus:border-secondary resize-none ${errors.message ? 'border-destructive' : ''}`}
                />
                {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg py-6 shadow-gold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    جاري الإرسال...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    إرسال الرسالة
                    <Send className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
