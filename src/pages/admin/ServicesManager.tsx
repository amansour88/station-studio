import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, GripVertical, Save, X, Upload } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client.safe";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

const ServicesManager = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل الخدمات",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService({
      id: "",
      title: "",
      description: "",
      icon: "Fuel",
      image_url: null,
      display_order: services.length,
      is_active: true,
    });
    setIsCreating(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService({ ...service });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingService(null);
    setIsCreating(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingService) return;

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
      const fileName = `service-${Date.now()}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setEditingService({ ...editingService, image_url: urlData.publicUrl });

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
    if (!editingService || !editingService.title.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال عنوان الخدمة",
      });
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        const { error } = await supabase.from("services").insert({
          title: editingService.title,
          description: editingService.description,
          icon: editingService.icon,
          image_url: editingService.image_url,
          display_order: editingService.display_order,
          is_active: editingService.is_active,
        });

        if (error) throw error;

        toast({
          title: "تمت الإضافة",
          description: "تمت إضافة الخدمة بنجاح",
        });
      } else {
        const { error } = await supabase
          .from("services")
          .update({
            title: editingService.title,
            description: editingService.description,
            icon: editingService.icon,
            image_url: editingService.image_url,
            display_order: editingService.display_order,
            is_active: editingService.is_active,
          })
          .eq("id", editingService.id);

        if (error) throw error;

        toast({
          title: "تم الحفظ",
          description: "تم حفظ التغييرات بنجاح",
        });
      }

      fetchServices();
      handleCancel();
    } catch (error) {
      console.error("Error saving service:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حفظ الخدمة",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`هل أنت متأكد من حذف "${service.title}"؟`)) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", service.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الخدمة بنجاح",
      });

      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حذف الخدمة",
      });
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: !service.is_active })
        .eq("id", service.id);

      if (error) throw error;

      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (error) {
      console.error("Error toggling service:", error);
    }
  };

  const iconOptions = ["Fuel", "Car", "Wrench", "ShoppingBag", "Coffee", "Pill", "Building", "Star"];

  if (loading) {
    return (
      <AdminLayout title="إدارة الخدمات">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إدارة الخدمات">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            إدارة الخدمات المعروضة في الموقع
          </p>
          <Button onClick={handleCreate} disabled={!!editingService}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة خدمة
          </Button>
        </div>

        {/* Edit Form */}
        {editingService && (
          <div className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-6">
              {isCreating ? "إضافة خدمة جديدة" : "تعديل الخدمة"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  عنوان الخدمة *
                </label>
                <Input
                  value={editingService.title}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      title: e.target.value,
                    })
                  }
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الوصف
                </label>
                <Textarea
                  value={editingService.description || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الأيقونة
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() =>
                        setEditingService({ ...editingService, icon })
                      }
                      className={cn(
                        "px-4 py-2 rounded-lg border transition-colors",
                        editingService.icon === icon
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 border-border hover:border-primary"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الصورة
                </label>
                <div className="space-y-4">
                  {editingService.image_url && (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted">
                      <img
                        src={editingService.image_url}
                        alt="Service"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setEditingService({
                            ...editingService,
                            image_url: null,
                          })
                        }
                        className="absolute top-1 left-1 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center"
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

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingService.is_active}
                  onCheckedChange={(checked) =>
                    setEditingService({ ...editingService, is_active: checked })
                  }
                />
                <label className="text-sm text-foreground">مفعّل</label>
              </div>

              <div className="flex gap-2 pt-4">
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
          </div>
        )}

        {/* Services List */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {services.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              <p>لا توجد خدمات حالياً</p>
              <Button onClick={handleCreate} variant="link" className="mt-2">
                إضافة أول خدمة
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                    !service.is_active && "opacity-50"
                  )}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xs">{service.icon}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{service.title}</h4>
                    {service.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <Switch
                    checked={service.is_active}
                    onCheckedChange={() => toggleActive(service)}
                  />

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(service)}
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

export default ServicesManager;
