import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, MapPin, Save, X, Upload } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Station {
  id: string;
  name: string;
  region: string;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  services: string[] | null;
  image_url: string | null;
  is_active: boolean;
}

const StationsManager = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterRegion, setFilterRegion] = useState<string>("all");

  const regions = [
    "منطقة القصيم",
    "منطقة مكة المكرمة",
    "منطقة المدينة المنورة",
    "منطقة حائل",
    "منطقة عسير",
  ];

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .order("region", { ascending: true });

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error("Error fetching stations:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل المحطات",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStation({
      id: "",
      name: "",
      region: regions[0],
      city: "",
      address: "",
      latitude: null,
      longitude: null,
      phone: "",
      services: [],
      image_url: null,
      is_active: true,
    });
    setIsCreating(true);
  };

  const handleEdit = (station: Station) => {
    setEditingStation({ ...station });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingStation(null);
    setIsCreating(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStation) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار صورة صالحة",
      });
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `station-${Date.now()}.${fileExt}`;
      const filePath = `stations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setEditingStation({ ...editingStation, image_url: urlData.publicUrl });

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
    }
  };

  const handleSave = async () => {
    if (!editingStation || !editingStation.name.trim() || !editingStation.region) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال اسم المحطة والمنطقة",
      });
      return;
    }

    setSaving(true);
    try {
      const stationData = {
        name: editingStation.name,
        region: editingStation.region,
        city: editingStation.city || null,
        address: editingStation.address || null,
        latitude: editingStation.latitude,
        longitude: editingStation.longitude,
        phone: editingStation.phone || null,
        services: editingStation.services,
        image_url: editingStation.image_url,
        is_active: editingStation.is_active,
      };

      if (isCreating) {
        const { error } = await supabase.from("stations").insert(stationData);
        if (error) throw error;

        toast({
          title: "تمت الإضافة",
          description: "تمت إضافة المحطة بنجاح",
        });
      } else {
        const { error } = await supabase
          .from("stations")
          .update(stationData)
          .eq("id", editingStation.id);

        if (error) throw error;

        toast({
          title: "تم الحفظ",
          description: "تم حفظ التغييرات بنجاح",
        });
      }

      fetchStations();
      handleCancel();
    } catch (error) {
      console.error("Error saving station:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حفظ المحطة",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (station: Station) => {
    if (!confirm(`هل أنت متأكد من حذف "${station.name}"؟`)) return;

    try {
      const { error } = await supabase
        .from("stations")
        .delete()
        .eq("id", station.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المحطة بنجاح",
      });

      fetchStations();
    } catch (error) {
      console.error("Error deleting station:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حذف المحطة",
      });
    }
  };

  const toggleActive = async (station: Station) => {
    try {
      const { error } = await supabase
        .from("stations")
        .update({ is_active: !station.is_active })
        .eq("id", station.id);

      if (error) throw error;

      setStations((prev) =>
        prev.map((s) =>
          s.id === station.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (error) {
      console.error("Error toggling station:", error);
    }
  };

  const filteredStations =
    filterRegion === "all"
      ? stations
      : stations.filter((s) => s.region === filterRegion);

  if (loading) {
    return (
      <AdminLayout title="إدارة المحطات">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إدارة المحطات">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 bg-muted/50 border border-border rounded-lg text-foreground"
            >
              <option value="all">كل المناطق</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <span className="text-muted-foreground">
              ({filteredStations.length} محطة)
            </span>
          </div>
          <Button onClick={handleCreate} disabled={!!editingStation}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة محطة
          </Button>
        </div>

        {/* Edit Form */}
        {editingStation && (
          <div className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-6">
              {isCreating ? "إضافة محطة جديدة" : "تعديل المحطة"}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم المحطة *
                </label>
                <Input
                  value={editingStation.name}
                  onChange={(e) =>
                    setEditingStation({ ...editingStation, name: e.target.value })
                  }
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  المنطقة *
                </label>
                <select
                  value={editingStation.region}
                  onChange={(e) =>
                    setEditingStation({ ...editingStation, region: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  المدينة
                </label>
                <Input
                  value={editingStation.city || ""}
                  onChange={(e) =>
                    setEditingStation({ ...editingStation, city: e.target.value })
                  }
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رقم الهاتف
                </label>
                <Input
                  value={editingStation.phone || ""}
                  onChange={(e) =>
                    setEditingStation({ ...editingStation, phone: e.target.value })
                  }
                  className="bg-muted/50"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  العنوان
                </label>
                <Textarea
                  value={editingStation.address || ""}
                  onChange={(e) =>
                    setEditingStation({ ...editingStation, address: e.target.value })
                  }
                  rows={2}
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  خط العرض
                </label>
                <Input
                  type="number"
                  step="any"
                  value={editingStation.latitude || ""}
                  onChange={(e) =>
                    setEditingStation({
                      ...editingStation,
                      latitude: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="bg-muted/50"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  خط الطول
                </label>
                <Input
                  type="number"
                  step="any"
                  value={editingStation.longitude || ""}
                  onChange={(e) =>
                    setEditingStation({
                      ...editingStation,
                      longitude: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="bg-muted/50"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  الصورة
                </label>
                <div className="flex items-center gap-4">
                  {editingStation.image_url && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={editingStation.image_url}
                        alt="Station"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setEditingStation({ ...editingStation, image_url: null })
                        }
                        className="absolute top-1 left-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>رفع صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <Switch
                  checked={editingStation.is_active}
                  onCheckedChange={(checked) =>
                    setEditingStation({ ...editingStation, is_active: checked })
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

        {/* Stations Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 text-center p-12 bg-card rounded-2xl border border-border/50 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد محطات</p>
              <Button onClick={handleCreate} variant="link" className="mt-2">
                إضافة أول محطة
              </Button>
            </div>
          ) : (
            filteredStations.map((station) => (
              <div
                key={station.id}
                className={cn(
                  "bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-aws transition-shadow",
                  !station.is_active && "opacity-50"
                )}
              >
                {station.image_url && (
                  <img
                    src={station.image_url}
                    alt={station.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-foreground">{station.name}</h4>
                      <p className="text-sm text-muted-foreground">{station.region}</p>
                      {station.city && (
                        <p className="text-xs text-muted-foreground">{station.city}</p>
                      )}
                    </div>
                    <Switch
                      checked={station.is_active}
                      onCheckedChange={() => toggleActive(station)}
                    />
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(station)}
                    >
                      <Edit className="w-3 h-3 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(station)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
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

export default StationsManager;
