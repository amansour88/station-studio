import { useEffect, useState } from "react";
import { Save, Upload, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface AboutData {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  stats: { label: string; value: string }[];
}

const AboutEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const data = await api.get<AboutData>("/about/get.php");
      
      // Parse stats from JSON if needed
      const parsedStats = Array.isArray(data.stats) 
        ? data.stats
        : [];
      
      setAboutData({
        ...data,
        stats: parsedStats,
      });
    } catch (error) {
      console.error("Error fetching about data:", error);
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
      const result = await api.upload("/upload/upload.php", file, "about");

      setAboutData((prev) =>
        prev ? { ...prev, image_url: result.url } : null
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

  const updateStat = (index: number, field: "label" | "value", value: string) => {
    setAboutData((prev) => {
      if (!prev) return null;
      const newStats = [...prev.stats];
      newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, stats: newStats };
    });
  };

  const addStat = () => {
    setAboutData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        stats: [...prev.stats, { label: "", value: "" }],
      };
    });
  };

  const removeStat = (index: number) => {
    setAboutData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        stats: prev.stats.filter((_, i) => i !== index),
      };
    });
  };

  const handleSave = async () => {
    if (!aboutData) return;

    setSaving(true);
    try {
      await api.put("/about/update.php", {
        id: aboutData.id,
        title: aboutData.title,
        content: aboutData.content,
        image_url: aboutData.image_url,
        stats: aboutData.stats,
      });

      toast({
        title: "تم الحفظ",
        description: "تم حفظ التغييرات بنجاح",
      });
    } catch (error) {
      console.error("Error saving about data:", error);
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
      <AdminLayout title="تعديل من نحن">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تعديل من نحن">
      <div className="max-w-4xl space-y-6">
        {/* Main Content */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-bold text-foreground mb-6">
            محتوى القسم
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                العنوان
              </label>
              <Input
                value={aboutData?.title || ""}
                onChange={(e) =>
                  setAboutData((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                className="bg-muted/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                المحتوى
              </label>
              <Textarea
                value={aboutData?.content || ""}
                onChange={(e) =>
                  setAboutData((prev) =>
                    prev ? { ...prev, content: e.target.value } : null
                  )
                }
                rows={6}
                className="bg-muted/50"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                الصورة
              </label>
              <div className="space-y-4">
                {aboutData?.image_url && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-muted">
                    <img
                      src={aboutData.image_url}
                      alt="About"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setAboutData((prev) =>
                          prev ? { ...prev, image_url: null } : null
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

        {/* Stats */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">الإحصائيات</h3>
            <Button variant="outline" size="sm" onClick={addStat}>
              إضافة إحصائية
            </Button>
          </div>

          <div className="space-y-4">
            {aboutData?.stats.map((stat, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="العنوان (مثال: سنوات الخبرة)"
                    value={stat.label}
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
                <div className="w-32">
                  <Input
                    placeholder="القيمة"
                    value={stat.value}
                    onChange={(e) => updateStat(index, "value", e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStat(index)}
                  className="text-destructive hover:text-destructive"
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

export default AboutEditor;
