import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, userRole, loading, isAdmin, isEditor } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-cairo">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-cairo">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            غير مصرح
          </h1>
          <p className="text-muted-foreground mb-6">
            ليس لديك صلاحية الوصول إلى لوحة التحكم
          </p>
          <a
            href="/"
            className="text-primary hover:underline"
          >
            العودة للموقع الرئيسي
          </a>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-cairo">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            صلاحيات غير كافية
          </h1>
          <p className="text-muted-foreground mb-6">
            هذه الصفحة متاحة للمسؤولين فقط
          </p>
          <a
            href="/admin"
            className="text-primary hover:underline"
          >
            العودة للوحة التحكم
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
