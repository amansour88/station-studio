import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X, Upload, ExternalLink } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client.safe";
import { cn } from "@/lib/utils";

interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
}

const PartnersManager = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل الشركاء",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPartner({
      id: "",
      name: "",
      description: "",
      logo_url: null,
      website_url: "",
      display_order: partners.length,
      is_active: true,
    });
    setIsCreating(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner({ ...partner });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingPartner(null);
    setIsCreating(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPartner) return;

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
      const fileName = `partner-${Date.now()}.${fileExt}`;
      const filePath = `partners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setEditingPartner({ ...editingPartner, logo_url: urlData.publicUrl });

      toast({
        title: "تم رفع الشعار",
        description: "تم رفع الشعار بنجاح",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في رفع الشعار",
      });
    }
  };

  const handleSave = async () => {
    if (!editingPartner || !editingPartner.name.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال اسم الشريك",
      });
      return;
    }

    setSaving(true);
    try {
      const partnerData = {
        name: editingPartner.name,
        description: editingPartner.description || null,
        logo_url: editingPartner.logo_url,
        website_url: editingPartner.website_url || null,
        display_order: editingPartner.display_order,
        is_active: editingPartner.is_active,
      };

      if (isCreating) {
        const { error } = await supabase.from("partners").insert(partnerData);
        if (error) throw error;

        toast({
          title: "تمت الإضافة",
          description: "تمت إضافة الشريك بنجاح",
        });
      } else {
        const { error } = await supabase
          .from("partners")
          .update(partnerData)
          .eq("id", editingPartner.id);

        if (error) throw error;

        toast({
          title: "تم الحفظ",
          description: "تم حفظ التغييرات بنجاح",
        });
      }

      fetchPartners();
      handleCancel();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حفظ الشريك",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`هل أنت متأكد من حذف "${partner.name}"؟`)) return;

    try {
      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", partner.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الشريك بنجاح",
      });

      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حذف الشريك",
      });
    }
  };

  const toggleActive = async (partner: Partner) => {
    try {
      const { error } = await supabase
        .from("partners")
        .update({ is_active: !partner.is_active })
        .eq("id", partner.id);

      if (error) throw error;

      setPartners((prev) =>
        prev.map((p) =>
          p.id === partner.id ? { ...p, is_active: !p.is_active } : p
        )
      );
    } catch (error) {
      console.error("Error toggling partner:", error);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="إدارة الشركاء">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إدارة الشركاء">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            إدارة الشركاء المعروضين في الموقع ({partners.length} شريك)
          </p>
          <Button onClick={handleCreate} disabled={!!editingPartner}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة شريك
          </Button>
        </div>

        {/* Edit Form */}
        {editingPartner && (
          <div className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-6">
              {isCreating ? "إضافة شريك جديد" : "تعديل الشريك"}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم الشريك *
                </label>
                <Input
                  value={editingPartner.name}
                  onChange={(e) =>
                    setEditingPartner({ ...editingPartner, name: e.target.value })
                  }
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الوصف
                </label>
                <Input
                  value={editingPartner.description || ""}
                  onChange={(e) =>
                    setEditingPartner({
                      ...editingPartner,
                      description: e.target.value,
                    })
                  }
                  placeholder="مثال: شريك الوقود الرئيسي"
                  className="bg-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رابط الموقع
                </label>
                <Input
                  value={editingPartner.website_url || ""}
                  onChange={(e) =>
                    setEditingPartner({
                      ...editingPartner,
                      website_url: e.target.value,
                    })
                  }
                  placeholder="https://example.com"
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
                  value={editingPartner.display_order}
                  onChange={(e) =>
                    setEditingPartner({
                      ...editingPartner,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-muted/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  الشعار
                </label>
                <div className="flex items-center gap-4">
                  {editingPartner.logo_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white border border-border p-2">
                      <img
                        src={editingPartner.logo_url}
                        alt="Partner logo"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() =>
                          setEditingPartner({ ...editingPartner, logo_url: null })
                        }
                        className="absolute top-1 left-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>رفع شعار</span>
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
                  checked={editingPartner.is_active}
                  onCheckedChange={(checked) =>
                    setEditingPartner({ ...editingPartner, is_active: checked })
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

        {/* Partners Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {partners.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-card rounded-2xl border border-border/50 text-muted-foreground">
              <p>لا يوجد شركاء</p>
              <Button onClick={handleCreate} variant="link" className="mt-2">
                إضافة أول شريك
              </Button>
            </div>
          ) : (
            partners.map((partner) => (
              <div
                key={partner.id}
                className={cn(
                  "bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-aws transition-shadow",
                  !partner.is_active && "opacity-50"
                )}
              >
                <div className="aspect-square bg-white p-4 flex items-center justify-center">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-4xl text-muted-foreground/30">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {partner.name}
                  </h4>
                  {partner.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {partner.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <Switch
                      checked={partner.is_active}
                      onCheckedChange={() => toggleActive(partner)}
                    />
                    <div className="flex gap-1">
                      {partner.website_url && (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(partner)}
                        className="p-1 text-muted-foreground hover:text-primary"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(partner)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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

export default PartnersManager;
