import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X, MapPin, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Region {
  id: string;
  name: string;
  slug: string;
  map_url: string | null;
  is_active: boolean;
  display_order: number;
}

const RegionsManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const data = await api.get<Region[]>("/regions/list.php", { all: "true" });
      setRegions(data || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل المناطق",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const maxOrder = regions.length > 0 ? Math.max(...regions.map(r => r.display_order)) : 0;
    setEditingRegion({
      id: "",
      name: "",
      slug: "",
      map_url: null,
      is_active: true,
      display_order: maxOrder + 1,
    });
    setIsCreating(true);
  };

  const handleEdit = (region: Region) => {
    setEditingRegion({ ...region });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingRegion(null);
    setIsCreating(false);
  };

  const generateSlug = (name: string) => {
    const slugMap: Record<string, string> = {
      "القصيم": "qassim",
      "مكة المكرمة": "makkah",
      "المدينة المنورة": "madinah",
      "حائل": "hail",
      "عسير": "asir",
      "الرياض": "riyadh",
      "الشرقية": "eastern",
      "تبوك": "tabuk",
      "جازان": "jazan",
      "نجران": "najran",
      "الباحة": "baha",
      "الجوف": "jouf",
      "الحدود الشمالية": "northern",
    };
    
    for (const [key, value] of Object.entries(slugMap)) {
      if (name.includes(key)) return value;
    }
    
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  };

  const handleSave = async () => {
    if (!editingRegion || !editingRegion.name.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال اسم المنطقة",
      });
      return;
    }

    const slug = editingRegion.slug || generateSlug(editingRegion.name);

    setSaving(true);
    try {
      const regionData = {
        name: editingRegion.name,
        slug,
        map_url: editingRegion.map_url || null,
        is_active: editingRegion.is_active,
        display_order: editingRegion.display_order,
      };

      if (isCreating) {
        await api.post("/regions/create.php", regionData);

        toast({
          title: "تمت الإضافة",
          description: "تمت إضافة المنطقة بنجاح",
        });
      } else {
        await api.put("/regions/update.php", { id: editingRegion.id, ...regionData });

        toast({
          title: "تم الحفظ",
          description: "تم حفظ التغييرات بنجاح",
        });
      }

      // Invalidate regions cache
      queryClient.invalidateQueries({ queryKey: ["regions"] });

      fetchRegions();
      handleCancel();
    } catch (error: any) {
      console.error("Error saving region:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message?.includes("duplicate") 
          ? "هذا المعرف موجود بالفعل" 
          : "حدث خطأ في حفظ المنطقة",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (region: Region) => {
    if (!confirm(`هل أنت متأكد من حذف "${region.name}"؟`)) return;

    try {
      await api.delete("/regions/delete.php", { id: region.id });

      toast({
        title: "تم الحذف",
        description: "تم حذف المنطقة بنجاح",
      });

      fetchRegions();
    } catch (error) {
      console.error("Error deleting region:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حذف المنطقة",
      });
    }
  };

  const toggleActive = async (region: Region) => {
    try {
      await api.put("/regions/update.php", {
        id: region.id,
        is_active: !region.is_active,
      });

      setRegions((prev) =>
        prev.map((r) =>
          r.id === region.id ? { ...r, is_active: !r.is_active } : r
        )
      );
    } catch (error) {
      console.error("Error toggling region:", error);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="إدارة المناطق">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إدارة المناطق">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            إدارة المناطق الجغرافية للمحطات ({regions.length} منطقة)
          </p>
          <Button onClick={handleCreate} disabled={!!editingRegion}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة منطقة
          </Button>
        </div>

        {/* Edit Form */}
        {editingRegion && (
          <div className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-6">
              {isCreating ? "إضافة منطقة جديدة" : "تعديل المنطقة"}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم المنطقة *
                </label>
                <Input
                  value={editingRegion.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingRegion({ 
                      ...editingRegion, 
                      name,
                      slug: isCreating ? generateSlug(name) : editingRegion.slug
                    });
                  }}
                  placeholder="مثال: منطقة القصيم"
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  المعرف (Slug)
                </label>
                <Input
                  value={editingRegion.slug}
                  onChange={(e) =>
                    setEditingRegion({ ...editingRegion, slug: e.target.value })
                  }
                  placeholder="مثال: qassim"
                  className="bg-muted/50"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  رابط خرائط جوجل
                </label>
                <Input
                  value={editingRegion.map_url || ""}
                  onChange={(e) =>
                    setEditingRegion({ ...editingRegion, map_url: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                  className="bg-muted/50"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ترتيب العرض
                </label>
                <Input
                  type="number"
                  value={editingRegion.display_order}
                  onChange={(e) =>
                    setEditingRegion({
                      ...editingRegion,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-muted/50"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingRegion.is_active}
                  onCheckedChange={(checked) =>
                    setEditingRegion({ ...editingRegion, is_active: checked })
                  }
                />
                <label className="text-sm text-foreground">مفعّل</label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 ml-2" />
                )}
                حفظ
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {/* Regions List */}
        <div className="space-y-3">
          {regions.length === 0 ? (
            <div className="text-center p-12 bg-card rounded-2xl border border-border/50 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مناطق</p>
              <Button onClick={handleCreate} variant="link" className="mt-2">
                إضافة أول منطقة
              </Button>
            </div>
          ) : (
            regions.map((region) => (
              <div
                key={region.id}
                className={cn(
                  "bg-card rounded-xl p-4 border border-border/50 hover:shadow-aws transition-shadow",
                  !region.is_active && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{region.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span dir="ltr">{region.slug}</span>
                        {region.map_url && (
                          <a
                            href={region.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:text-secondary transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            خريطة
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={region.is_active}
                      onCheckedChange={() => toggleActive(region)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(region)}
                      disabled={!!editingRegion}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(region)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RegionsManager;
