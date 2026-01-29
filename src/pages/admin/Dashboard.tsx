import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Image,
  Info,
  Wrench,
  MapPin,
  Users,
  MessageSquare,
  TrendingUp,
  Eye,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client.safe";

interface Stats {
  services: number;
  stations: number;
  partners: number;
  messages: number;
  unreadMessages: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    services: 0,
    stations: 0,
    partners: 0,
    messages: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [servicesRes, stationsRes, partnersRes, messagesRes, unreadRes] =
          await Promise.all([
            supabase.from("services").select("id", { count: "exact", head: true }),
            supabase.from("stations").select("id", { count: "exact", head: true }),
            supabase.from("partners").select("id", { count: "exact", head: true }),
            supabase.from("contact_messages").select("id", { count: "exact", head: true }),
            supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
          ]);

        setStats({
          services: servicesRes.count || 0,
          stations: stationsRes.count || 0,
          partners: partnersRes.count || 0,
          messages: messagesRes.count || 0,
          unreadMessages: unreadRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "الخدمات",
      value: stats.services,
      icon: Wrench,
      color: "bg-blue-500",
      href: "/admin/services",
    },
    {
      title: "المحطات",
      value: stats.stations,
      icon: MapPin,
      color: "bg-green-500",
      href: "/admin/stations",
    },
    {
      title: "الشركاء",
      value: stats.partners,
      icon: Users,
      color: "bg-purple-500",
      href: "/admin/partners",
    },
    {
      title: "الرسائل",
      value: stats.messages,
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined,
      icon: MessageSquare,
      color: "bg-orange-500",
      href: "/admin/messages",
    },
  ];

  const quickActions = [
    { title: "تعديل الهيرو", icon: Image, href: "/admin/hero", color: "bg-primary" },
    { title: "تعديل من نحن", icon: Info, href: "/admin/about", color: "bg-secondary" },
    { title: "إضافة خدمة", icon: Wrench, href: "/admin/services", color: "bg-blue-500" },
    { title: "إضافة محطة", icon: MapPin, href: "/admin/stations", color: "bg-green-500" },
  ];

  return (
    <AdminLayout title="لوحة التحكم">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-primary to-primary/80 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            مرحباً بك في لوحة التحكم 👋
          </h2>
          <p className="text-white/80">
            إدارة محتوى موقع اوس للخدمات البترولية
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.href}
            className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-aws transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.badge && (
                <span className="bg-destructive text-white text-xs font-bold px-2 py-1 rounded-full">
                  {stat.badge} جديد
                </span>
              )}
            </div>
            <h3 className="text-muted-foreground text-sm mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-foreground">
              {loading ? "..." : stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          إجراءات سريعة
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* View Site Button */}
      <div className="mt-8 text-center">
        <a
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <Eye className="w-5 h-5" />
          عرض الموقع الرئيسي
        </a>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
