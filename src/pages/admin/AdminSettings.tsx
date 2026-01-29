import { useState, useEffect } from "react";
import { Shield, Users, Key, Save, Plus, Edit, Trash2, Ban, RefreshCw, UserCheck, UserX, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client.safe";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  role: "admin" | "editor";
  created_at: string;
  last_sign_in_at: string | null;
  is_banned: boolean;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  
  // Users list
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // New user form
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "editor">("editor");
  const [isCreating, setIsCreating] = useState(false);

  // Edit user
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "editor">("editor");
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset password
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Change own password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await supabase.functions.invoke("manage-users", {
        body: { action: "list" },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);

      setUsers(response.data.users || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ في تحميل المستخدمين",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserEmail || !newUserPassword || !newUserUsername) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني واسم المستخدم وكلمة المرور",
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
      const response = await supabase.functions.invoke("manage-users", {
        body: {
          action: "create",
          email: newUserEmail,
          password: newUserPassword,
          username: newUserUsername,
          full_name: newUserFullName,
          role: newUserRole,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);

      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء المستخدم بنجاح",
      });

      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserUsername("");
      setNewUserFullName("");
      setNewUserRole("editor");
      setShowNewUserForm(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ في إنشاء المستخدم",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      const response = await supabase.functions.invoke("manage-users", {
        body: {
          action: "update",
          user_id: editingUser.id,
          role: editRole,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);

      toast({
        title: "تم التحديث",
        description: "تم تحديث صلاحية المستخدم بنجاح",
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ في تحديث المستخدم",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBan = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لا يمكنك حظر حسابك الخاص",
      });
      return;
    }

    try {
      const response = await supabase.functions.invoke("manage-users", {
        body: {
          action: "toggle_ban",
          user_id: targetUser.id,
          ban: !targetUser.is_banned,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);

      toast({
        title: targetUser.is_banned ? "تم إلغاء الحظر" : "تم الحظر",
        description: targetUser.is_banned ? "تم إلغاء حظر المستخدم" : "تم حظر المستخدم",
      });

      fetchUsers();
    } catch (error: any) {
      console.error("Error toggling ban:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ",
      });
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لا يمكنك حذف حسابك الخاص",
      });
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف "${targetUser.email}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      return;
    }

    try {
      const response = await supabase.functions.invoke("manage-users", {
        body: {
          action: "delete",
          user_id: targetUser.id,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);

      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });

      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ في حذف المستخدم",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !resetPassword) return;

    if (resetPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      });
      return;
    }

    setIsResetting(true);
    try {
      const response = await supabase.functions.invoke("manage-users", {
        body: {
          action: "reset_password",
          user_id: resetPasswordUser.id,
          new_password: resetPassword,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);

      toast({
        title: "تم التغيير",
        description: "تم تغيير كلمة مرور المستخدم بنجاح",
      });

      setResetPasswordUser(null);
      setResetPassword("");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ في تغيير كلمة المرور",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
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
      <div className="max-w-4xl space-y-6">
        {/* Users Management */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">إدارة المستخدمين</h3>
                <p className="text-sm text-muted-foreground">
                  إضافة وتعديل وحذف مستخدمي لوحة التحكم
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loadingUsers}>
                <RefreshCw className={cn("w-4 h-4", loadingUsers && "animate-spin")} />
              </Button>
              <Button onClick={() => setShowNewUserForm(true)} disabled={showNewUserForm}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة مستخدم
              </Button>
            </div>
          </div>

          {/* New User Form */}
          {showNewUserForm && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground">إضافة مستخدم جديد</h4>
                <button onClick={() => setShowNewUserForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">اسم المستخدم *</label>
                  <Input
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="username"
                    className="bg-background"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">الاسم الكامل</label>
                  <Input
                    value={newUserFullName}
                    onChange={(e) => setNewUserFullName(e.target.value)}
                    placeholder="الاسم الكامل"
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">البريد الإلكتروني *</label>
                  <Input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-background"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">كلمة المرور *</label>
                  <Input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">الصلاحية</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as "admin" | "editor")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="editor">محرر</option>
                    <option value="admin">مسؤول</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isCreating} className="w-full">
                    {isCreating ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 ml-2" />
                    )}
                    إنشاء المستخدم
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Users List */}
          {loadingUsers ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا يوجد مستخدمين</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border border-border/50",
                    u.is_banned && "opacity-50 bg-destructive/5",
                    u.id === user?.id && "bg-primary/5 border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                      u.role === "admin" ? "bg-primary" : "bg-muted-foreground"
                    )}>
                      {u.username?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {u.username || u.email}
                        </span>
                        {u.id === user?.id && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">أنت</span>
                        )}
                        {u.is_banned && (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">محظور</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span dir="ltr">{u.email}</span>
                        <span>•</span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary/10"
                        )}>
                          {u.role === "admin" ? "مسؤول" : "محرر"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {u.id !== user?.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUser(u);
                          setEditRole(u.role);
                        }}
                        title="تعديل الصلاحية"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResetPasswordUser(u)}
                        title="إعادة تعيين كلمة المرور"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBan(u)}
                        title={u.is_banned ? "إلغاء الحظر" : "حظر"}
                        className={u.is_banned ? "text-green-600" : "text-orange-600"}
                      >
                        {u.is_banned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(u)}
                        className="text-destructive hover:text-destructive"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Role Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-foreground mb-4">
                تعديل صلاحية {editingUser.username || editingUser.email}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">الصلاحية</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "admin" | "editor")}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg"
                >
                  <option value="editor">محرر</option>
                  <option value="admin">مسؤول</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateRole} disabled={isUpdating}>
                  {isUpdating ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ
                </Button>
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetPasswordUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-foreground mb-4">
                إعادة تعيين كلمة مرور {resetPasswordUser.username || resetPasswordUser.email}
              </h3>
              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isResetting}>
                    {isResetting ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Key className="w-4 h-4 ml-2" />
                    )}
                    تغيير كلمة المرور
                  </Button>
                  <Button variant="outline" type="button" onClick={() => setResetPasswordUser(null)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Own Password */}
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

          <form onSubmit={handleChangeOwnPassword} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
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
