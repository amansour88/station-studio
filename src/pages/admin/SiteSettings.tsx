import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, Save, Globe, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/lib/api";
import type { SiteSettings, SuccessResponse } from "@/types/api";

const SiteSettingsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<SiteSettings>({
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    phone: "",
    email: "",
    address: "",
    map_latitude: "",
    map_longitude: "",
    map_zoom: "6",
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => api.get<SiteSettings>("/settings/get.php"),
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        facebook_url: settings.facebook_url || "",
        twitter_url: settings.twitter_url || "",
        instagram_url: settings.instagram_url || "",
        linkedin_url: settings.linkedin_url || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        map_latitude: settings.map_latitude || "",
        map_longitude: settings.map_longitude || "",
        map_zoom: settings.map_zoom || "6",
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: SiteSettings) => api.post<SuccessResponse>("/settings/update.php", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "تم الحفظ", description: "تم تحديث إعدادات الموقع بنجاح" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ الإعدادات" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <AdminLayout title="إعدادات الموقع">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Social Media Section */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            روابط السوشيال ميديا
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Facebook className="w-5 h-5 text-blue-600" />
              <Input
                placeholder="https://facebook.com/..."
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-3">
              <Twitter className="w-5 h-5 text-sky-500" />
              <Input
                placeholder="https://twitter.com/..."
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-pink-600" />
              <Input
                placeholder="https://instagram.com/..."
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-3">
              <Linkedin className="w-5 h-5 text-blue-700" />
              <Input
                placeholder="https://linkedin.com/..."
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            معلومات التواصل
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="920008436"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="info@aws.sa"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-2" />
              <Textarea
                placeholder="العنوان الكامل..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Map Location Section */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            موقع المقر الرئيسي على الخريطة
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">خط العرض (Latitude)</label>
              <Input
                placeholder="26.3266"
                value={formData.map_latitude || ""}
                onChange={(e) => setFormData({ ...formData, map_latitude: e.target.value })}
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">خط الطول (Longitude)</label>
              <Input
                placeholder="43.9748"
                value={formData.map_longitude || ""}
                onChange={(e) => setFormData({ ...formData, map_longitude: e.target.value })}
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">مستوى التقريب (Zoom)</label>
              <Input
                placeholder="6"
                type="number"
                min="1"
                max="18"
                value={formData.map_zoom || ""}
                onChange={(e) => setFormData({ ...formData, map_zoom: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            💡 يمكنك الحصول على الإحداثيات من Google Maps بالضغط بزر الماوس الأيمن على الموقع واختيار الإحداثيات
          </p>
        </div>

        <Button type="submit" disabled={mutation.isPending} className="w-full py-6">
          <Save className="w-5 h-5 ml-2" />
          {mutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </form>
    </AdminLayout>
  );
};

export default SiteSettingsPage;
