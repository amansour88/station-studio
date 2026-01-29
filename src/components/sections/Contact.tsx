import { useState } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle, Upload, X, Briefcase, MessageSquare, AlertTriangle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client.safe";
import { z } from "zod";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(255),
  phone: z.string().trim().min(10, "رقم الجوال غير صحيح").max(20),
  city: z.string().max(100).optional(),
  message: z.string().trim().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل").max(1000),
});

const contactTypes = [
  { id: "general", label: "استفسار عام", icon: MessageSquare, description: "لديك سؤال أو استفسار" },
  { id: "complaint", label: "شكوى", icon: AlertTriangle, description: "تقديم شكوى أو ملاحظة" },
  { id: "job_application", label: "التقديم على وظيفة", icon: Briefcase, description: "إرسال السيرة الذاتية" },
  { id: "investor", label: "خدمات المستثمرين", icon: Building2, description: "فرص الاستثمار والامتياز" },
];

const investorServices = [
  { id: "station_management", label: "إدارة المحطات" },
  { id: "franchise", label: "الامتياز التجاري" },
  { id: "facility_rental", label: "تأجير المرافق" },
];

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

interface ContactProps {
  defaultType?: string;
  defaultServiceType?: string;
}

const Contact = ({ defaultType, defaultServiceType }: ContactProps) => {
  const { toast } = useToast();
  const [contactType, setContactType] = useState(defaultType || "general");
  const [serviceType, setServiceType] = useState(defaultServiceType || "");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
        });
        return;
      }
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "نوع الملف غير مدعوم. الملفات المدعومة: PDF, صور, Word",
        });
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `contact-attachments/${fileName}`;

    const { error } = await supabase.storage
      .from("uploads")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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

    // Validate investor service type
    if (contactType === "investor" && !serviceType) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار نوع الخدمة المطلوبة",
      });
      return;
    }

    setIsSubmitting(true);
    let attachmentUrl: string | null = null;

    try {
      // Upload attachment if exists
      if (attachment) {
        setIsUploading(true);
        attachmentUrl = await uploadFile(attachment);
        setIsUploading(false);
        if (!attachmentUrl) {
          throw new Error("Failed to upload attachment");
        }
      }

      // Build subject based on type
      let subject = formData.city ? `من ${formData.city}` : null;
      if (contactType === "investor" && serviceType) {
        const serviceName = investorServices.find(s => s.id === serviceType)?.label;
        subject = serviceName ? `${serviceName}${formData.city ? ` - من ${formData.city}` : ""}` : subject;
      } else if (contactType === "job_application") {
        subject = `طلب توظيف${formData.city ? ` - من ${formData.city}` : ""}`;
      } else if (contactType === "complaint") {
        subject = `شكوى${formData.city ? ` - من ${formData.city}` : ""}`;
      }

      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject,
        message: formData.message.trim(),
        type: contactType,
        service_type: contactType === "investor" ? serviceType : null,
        attachment_url: attachmentUrl,
      });

      if (error) throw error;

      toast({
        title: "تم إرسال رسالتك بنجاح!",
        description: "سنتواصل معك في أقرب وقت ممكن",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        message: "",
      });
      setContactType("general");
      setServiceType("");
      setAttachment(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const getPlaceholderMessage = () => {
    switch (contactType) {
      case "complaint":
        return "صف المشكلة أو الشكوى بالتفصيل...";
      case "job_application":
        return "اكتب نبذة عنك وخبراتك...";
      case "investor":
        return "اكتب تفاصيل طلبك الاستثماري...";
      default:
        return "اكتب رسالتك هنا...";
    }
  };

  const getFileLabel = () => {
    switch (contactType) {
      case "complaint":
        return "إرفاق صورة (اختياري)";
      case "job_application":
        return "إرفاق السيرة الذاتية *";
      case "investor":
        return "إرفاق مستندات (اختياري)";
      default:
        return "إرفاق ملف (اختياري)";
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
            
            {/* Contact Type Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {contactTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setContactType(type.id);
                    if (type.id !== "investor") setServiceType("");
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                    contactType === type.id
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-secondary/50"
                  )}
                >
                  <type.icon className="w-6 h-6" />
                  <span className="font-medium text-sm">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Investor Service Type */}
            {contactType === "investor" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  نوع الخدمة المطلوبة *
                </label>
                <div className="flex flex-wrap gap-2">
                  {investorServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setServiceType(service.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        serviceType === service.id
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-secondary/20"
                      )}
                    >
                      {service.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
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
                  placeholder={getPlaceholderMessage()}
                  required
                  rows={5}
                  className={`bg-muted/50 border-border focus:border-secondary resize-none ${errors.message ? 'border-destructive' : ''}`}
                />
                {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {getFileLabel()}
                </label>
                {!attachment ? (
                  <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-secondary/50 hover:bg-muted/30 transition-all duration-300">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">اضغط لاختيار ملف (PDF, صور, Word - حتى 5MB)</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg py-6 shadow-gold"
              >
                {isSubmitting || isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {isUploading ? "جاري رفع الملف..." : "جاري الإرسال..."}
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
