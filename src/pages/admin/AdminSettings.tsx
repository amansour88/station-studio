import { useState } from "react";
import { Shield, Users, Key, Save } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "editor">("editor");
  const [isCreating, setIsCreating] = useState(false);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserEmail || !newUserPassword) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
      });
      return;
    }

    if (newUserPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Note: In production, this should be done via an edge function
      // to properly create users with admin privileges
      toast({
        title: "ملاحظة",
        description: "لإنشاء مستخدم جديد، يرجى التواصل مع الدعم الفني",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في إنشاء المستخدم",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور الجديدة وتأكيدها",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمة المرور الجديدة غير متطابقة",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "تم التغيير",
        description: "تم تغيير كلمة المرور بنجاح",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ في تغيير كلمة المرور",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminLayout title="الإعدادات">
        <div className="text-center p-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            الوصول مقيد
          </h2>
          <p className="text-muted-foreground">
            هذه الصفحة متاحة للمسؤولين فقط
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="الإعدادات">
      <div className="max-w-2xl space-y-6">
        {/* Change Password */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">تغيير كلمة المرور</h3>
              <p className="text-sm text-muted-foreground">
                تغيير كلمة المرور الخاصة بحسابك
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                كلمة المرور الجديدة
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-muted/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                تأكيد كلمة المرور
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-muted/50"
              />
            </div>

            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              تغيير كلمة المرور
            </Button>
          </form>
        </div>

        {/* Create New User (Admin Only) */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">إضافة مستخدم جديد</h3>
              <p className="text-sm text-muted-foreground">
                إنشاء حساب جديد للوصول للوحة التحكم
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-muted/50"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                كلمة المرور
              </label>
              <Input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-muted/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                الصلاحية
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as "admin" | "editor")}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg"
              >
                <option value="editor">محرر</option>
                <option value="admin">مسؤول</option>
              </select>
            </div>

            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Users className="w-4 h-4 ml-2" />
              )}
              إنشاء المستخدم
            </Button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-muted/50 rounded-2xl p-6">
          <h4 className="font-medium text-foreground mb-2">معلومات الحساب</h4>
          <p className="text-sm text-muted-foreground">
            البريد الإلكتروني: {user?.email}
          </p>
          <p className="text-sm text-muted-foreground">
            الصلاحية: مسؤول
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
