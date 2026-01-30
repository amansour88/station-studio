import { useEffect, useState } from "react";
import { Save, Upload, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface HeroData {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  background_image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
}

const HeroEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroData, setHeroData] = useState<HeroData | null>(null);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const data = await api.get<HeroData>("/hero/get.php");
      setHeroData(data);
    } catch (error) {
      console.error("Error fetching hero data:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار صورة صالحة",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await api.upload("/upload/upload.php", file, "hero");

      setHeroData((prev) =>
        prev ? { ...prev, background_image_url: result.url } : null
      );

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في رفع الصورة",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!heroData) return;

    setSaving(true);
    try {
      await api.put("/hero/update.php", {
        id: heroData.id,
        title: heroData.title,
        subtitle: heroData.subtitle,
        description: heroData.description,
        background_image_url: heroData.background_image_url,
        cta_text: heroData.cta_text,
        cta_link: heroData.cta_link,
      });

      toast({
        title: "تم الحفظ",
        description: "تم حفظ التغييرات بنجاح",
      });
    } catch (error) {
      console.error("Error saving hero data:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حفظ البيانات",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="تعديل الهيرو">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تعديل الهيرو">
      <div className="max-w-4xl">
        <div className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
          <h3 className="text-lg font-bold text-foreground mb-6">
            محتوى القسم الرئيسي
          </h3>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                العنوان الرئيسي
              </label>
              <Input
                value={heroData?.title || ""}
                onChange={(e) =>
                  setHeroData((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                className="bg-muted/50"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                العنوان الفرعي
              </label>
              <Input
                value={heroData?.subtitle || ""}
                onChange={(e) =>
                  setHeroData((prev) =>
                    prev ? { ...prev, subtitle: e.target.value } : null
                  )
                }
                className="bg-muted/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                الوصف
              </label>
              <Textarea
                value={heroData?.description || ""}
                onChange={(e) =>
                  setHeroData((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                rows={3}
                className="bg-muted/50"
              />
            </div>

            {/* CTA */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نص الزر
                </label>
                <Input
                  value={heroData?.cta_text || ""}
                  onChange={(e) =>
                    setHeroData((prev) =>
                      prev ? { ...prev, cta_text: e.target.value } : null
                    )
                  }
                  className="bg-muted/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رابط الزر
                </label>
                <Input
                  value={heroData?.cta_link || ""}
                  onChange={(e) =>
                    setHeroData((prev) =>
                      prev ? { ...prev, cta_link: e.target.value } : null
                    )
                  }
                  className="bg-muted/50"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Background Image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                صورة الخلفية
              </label>
              <div className="space-y-4">
                {heroData?.background_image_url && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-muted">
                    <img
                      src={heroData.background_image_url}
                      alt="Hero background"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setHeroData((prev) =>
                          prev ? { ...prev, background_image_url: null } : null
                        )
                      }
                      className="absolute top-2 left-2 w-8 h-8 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {uploading ? "جاري الرفع..." : "اختر صورة للرفع"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              جاري الحفظ...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </span>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default HeroEditor;
