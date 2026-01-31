import { useEffect, useState } from "react";
import { Save, Upload, X, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface HeroStat {
  number: string;
  label: string;
  icon: string;
}

interface HeroData {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  background_image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  stats: HeroStat[] | null;
}

const AVAILABLE_ICONS = [
  { value: "Fuel", label: "وقود" },
  { value: "MapPin", label: "موقع" },
  { value: "Calendar", label: "تاريخ" },
  { value: "Users", label: "مستخدمين" },
];

const HeroEditor = () => {
  const queryClient = useQueryClient();
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
      // Parse stats if string
      const parsedStats = Array.isArray(data.stats)
        ? data.stats
        : [
            { number: "78", label: "محطة", icon: "Fuel" },
            { number: "5", label: "مناطق", icon: "MapPin" },
            { number: "1998", label: "سنة التأسيس", icon: "Calendar" },
          ];
      setHeroData({ ...data, stats: parsedStats });
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

  const updateStat = (index: number, field: keyof HeroStat, value: string) => {
    setHeroData((prev) => {
      if (!prev || !prev.stats) return prev;
      const newStats = [...prev.stats];
      newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, stats: newStats };
    });
  };

  const addStat = () => {
    setHeroData((prev) => {
      if (!prev) return prev;
      const currentStats = prev.stats || [];
      return {
        ...prev,
        stats: [...currentStats, { number: "", label: "", icon: "Fuel" }],
      };
    });
  };

  const removeStat = (index: number) => {
    setHeroData((prev) => {
      if (!prev || !prev.stats) return prev;
      return {
        ...prev,
        stats: prev.stats.filter((_, i) => i !== index),
      };
    });
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
        stats: heroData.stats,
      });

      // Invalidate hero cache to refresh homepage
      queryClient.invalidateQueries({ queryKey: ["hero-section"] });

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
      <div className="max-w-4xl space-y-6">
        {/* Main Content */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
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
                placeholder="مثال: شريكك الموثوق على الطريق"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                العنوان الفرعي (المميز بالذهبي)
              </label>
              <Input
                value={heroData?.subtitle || ""}
                onChange={(e) =>
                  setHeroData((prev) =>
                    prev ? { ...prev, subtitle: e.target.value } : null
                  )
                }
                className="bg-muted/50"
                placeholder="مثال: منذ 1998"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                الوصف
              </label>
              <RichTextEditor
                value={heroData?.description || ""}
                onChange={(description) =>
                  setHeroData((prev) =>
                    prev ? { ...prev, description } : null
                  )
                }
                placeholder="اكتب وصف القسم الرئيسي هنا..."
                minHeight="150px"
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

        {/* Stats Cards */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">
              الإحصائيات (الكروت الثلاثة)
            </h3>
            <Button variant="outline" size="sm" onClick={addStat}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة إحصائية
            </Button>
          </div>

          <div className="space-y-4">
            {heroData?.stats?.map((stat, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-muted/30 rounded-xl">
                <div className="flex-1 grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      الرقم
                    </label>
                    <Input
                      placeholder="78"
                      value={stat.number}
                      onChange={(e) => updateStat(index, "number", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      العنوان
                    </label>
                    <Input
                      placeholder="محطة"
                      value={stat.label}
                      onChange={(e) => updateStat(index, "label", e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      الأيقونة
                    </label>
                    <Select
                      value={stat.icon}
                      onValueChange={(value) => updateStat(index, "icon", value)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStat(index)}
                  className="text-destructive hover:text-destructive shrink-0 mt-5"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
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
