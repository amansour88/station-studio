import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, MapPin, Save, X, Upload, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Region {
  id: string;
  name: string;
  slug: string;
}

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
  products: string[] | null;
  google_maps_url: string | null;
  image_url: string | null;
  is_active: boolean;
}

const StationsManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [stations, setStations] = useState<Station[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterRegion, setFilterRegion] = useState<string>("all");

  useEffect(() => {
    fetchRegions();
    fetchStations();
  }, []);

  const fetchRegions = async () => {
    try {
      const data = await api.get<Region[]>("/regions/list.php");
      setRegions(data || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchStations = async () => {
    try {
      const data = await api.get<Station[]>("/stations/list.php", { all: "true" });
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
      region: regions[0]?.name || "منطقة القصيم",
      city: "",
      address: "",
      latitude: null,
      longitude: null,
      phone: "",
      services: [],
      products: [],
      google_maps_url: null,
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
      const result = await api.upload("/upload/upload.php", file, "stations");
      setEditingStation({ ...editingStation, image_url: result.url });

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
        products: editingStation.products,
        google_maps_url: editingStation.google_maps_url || null,
        image_url: editingStation.image_url,
        is_active: editingStation.is_active,
      };

      if (isCreating) {
        await api.post("/stations/create.php", stationData);

        toast({
          title: "تمت الإضافة",
          description: "تمت إضافة المحطة بنجاح",
        });
      } else {
        await api.put("/stations/update.php", { id: editingStation.id, ...stationData });

        toast({
          title: "تم الحفظ",
          description: "تم حفظ التغييرات بنجاح",
        });
      }

      // Invalidate stations cache
      queryClient.invalidateQueries({ queryKey: ["stations"] });

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
      await api.delete("/stations/delete.php", { id: station.id });

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
      await api.put("/stations/update.php", {
        id: station.id,
        is_active: !station.is_active,
      });

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
                <option key={region.id} value={region.name}>
                  {region.name}
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
                    <option key={region.id} value={region.name}>
                      {region.name}
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
                  رابط خرائط جوجل
                </label>
                <div className="flex gap-2">
                  <Input
                    value={editingStation.google_maps_url || ""}
                    onChange={(e) =>
                      setEditingStation({ ...editingStation, google_maps_url: e.target.value })
                    }
                    placeholder="https://maps.google.com/..."
                    className="bg-muted/50 flex-1"
                    dir="ltr"
                  />
                  {editingStation.google_maps_url && (
                    <a
                      href={editingStation.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  المنتجات المتوفرة (مفصولة بفاصلة)
                </label>
                <Input
                  value={editingStation.products?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingStation({
                      ...editingStation,
                      products: e.target.value.split(",").map(p => p.trim()).filter(Boolean),
                    })
                  }
                  placeholder="بنزين 91، بنزين 95، ديزل..."
                  className="bg-muted/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  الخدمات المتوفرة (مفصولة بفاصلة)
                </label>
                <Input
                  value={editingStation.services?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingStation({
                      ...editingStation,
                      services: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="غسيل سيارات، سوبرماركت، مطعم، كافيه، صراف آلي..."
                  className="bg-muted/50"
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

        {/* Stations List */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {filteredStations.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد محطات</p>
              <Button onClick={handleCreate} variant="link" className="mt-2">
                إضافة أول محطة
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredStations.map((station) => (
                <div
                  key={station.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                    !station.is_active && "opacity-50"
                  )}
                >
                  {station.image_url ? (
                    <img
                      src={station.image_url}
                      alt={station.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{station.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {station.region} {station.city && `- ${station.city}`}
                    </p>
                    {/* Products & Services */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {station.products?.slice(0, 3).map((product, idx) => (
                        <span key={`p-${idx}`} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          {product}
                        </span>
                      ))}
                      {station.services?.slice(0, 2).map((service, idx) => (
                        <span key={`s-${idx}`} className="text-[10px] bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Switch
                    checked={station.is_active}
                    onCheckedChange={() => toggleActive(station)}
                  />

                  <div className="flex gap-1">
                    {station.google_maps_url && (
                      <a
                        href={station.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(station)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(station)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default StationsManager;
