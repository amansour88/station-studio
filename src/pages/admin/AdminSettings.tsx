import { useState, useEffect } from "react";
import { Shield, Users, Key, Save, Plus, Edit, Trash2, Ban, RefreshCw, UserCheck, UserX, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
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
      const data = await api.get<{ users: User[] }>("/users/list.php");
      setUsers(data.users || []);
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
      await api.post("/users/create.php", {
        email: newUserEmail,
        password: newUserPassword,
        username: newUserUsername,
        full_name: newUserFullName,
        role: newUserRole,
      });

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
      await api.put("/users/update.php", {
        user_id: editingUser.id,
        role: editRole,
      });

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
      await api.post("/users/toggle-ban.php", {
        user_id: targetUser.id,
        ban: !targetUser.is_banned,
      });

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
      await api.delete("/users/delete.php", { user_id: targetUser.id });

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
      await api.post("/users/reset-password.php", {
        user_id: resetPasswordUser.id,
        new_password: resetPassword,
      });

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
      await api.post("/auth/change-password.php", {
        new_password: newPassword,
      });

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
                    u.id === user?.id && "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                      u.role === "admin" ? "bg-primary" : "bg-secondary"
                    )}>
                      {(u.username || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">
                          {u.full_name || u.username || u.email}
                        </h4>
                        {u.id === user?.id && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            أنت
                          </span>
                        )}
                        {u.is_banned && (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                            محظور
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      u.role === "admin" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-secondary/10 text-secondary-foreground"
                    )}>
                      {u.role === "admin" ? "مسؤول" : "محرر"}
                    </span>
                    
                    {u.id !== user?.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingUser(u);
                            setEditRole(u.role);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setResetPasswordUser(u)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleBan(u)}
                          className={u.is_banned ? "text-green-500 hover:text-green-600" : "text-orange-500 hover:text-orange-600"}
                        >
                          {u.is_banned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(u)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Role Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-foreground mb-4">تعديل صلاحية المستخدم</h3>
              <p className="text-muted-foreground mb-4">{editingUser.email}</p>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as "admin" | "editor")}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg mb-4"
              >
                <option value="editor">محرر</option>
                <option value="admin">مسؤول</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleUpdateRole} disabled={isUpdating} className="flex-1">
                  {isUpdating ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "حفظ"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
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
              <h3 className="text-lg font-bold text-foreground mb-4">تغيير كلمة المرور</h3>
              <p className="text-muted-foreground mb-4">{resetPasswordUser.email}</p>
              <form onSubmit={handleResetPassword}>
                <Input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="كلمة المرور الجديدة"
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isResetting} className="flex-1">
                    {isResetting ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "تغيير"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setResetPasswordUser(null)} className="flex-1">
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
              <p className="text-sm text-muted-foreground">تغيير كلمة مرور حسابك</p>
            </div>
          </div>

          <form onSubmit={handleChangeOwnPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
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
              <label className="block text-sm font-medium text-foreground mb-1">
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
              حفظ التغييرات
            </Button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
