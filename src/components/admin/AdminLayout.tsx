import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image,
  Info,
  Wrench,
  MapPin,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
  { name: "الهيرو", href: "/admin/hero", icon: Image },
  { name: "من نحن", href: "/admin/about", icon: Info },
  { name: "الخدمات", href: "/admin/services", icon: Wrench },
  { name: "المناطق", href: "/admin/regions", icon: MapPin },
  { name: "المحطات", href: "/admin/stations", icon: MapPin },
  { name: "الشركاء", href: "/admin/partners", icon: Users },
  { name: "الرسائل", href: "/admin/messages", icon: MessageSquare },
  { name: "الإعدادات", href: "/admin/settings", icon: Settings, adminOnly: true },
];

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin, userRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="min-h-screen bg-muted/30 font-cairo" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-72 bg-card border-l border-border z-50 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Link to="/admin">
                <Logo size="md" />
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-aws"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border">
            <div className="bg-muted rounded-xl p-4 mb-3">
              <p className="text-sm text-muted-foreground">مسجل الدخول كـ</p>
              <p className="font-semibold text-foreground truncate">
                {user?.email}
              </p>
              <span className={cn(
                "inline-block mt-2 text-xs px-2 py-1 rounded-full",
                isAdmin ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary-foreground"
              )}>
                {isAdmin ? "مسؤول" : "محرر"}
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:mr-72">
        {/* Top Bar */}
        <header className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
            </div>
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span>عرض الموقع</span>
              <ChevronLeft className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
