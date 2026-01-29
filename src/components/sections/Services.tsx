import { Fuel, Car, ShoppingBag, Wrench, Coffee, Pill, Building, Key, Store, LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client.safe";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import stationPumps from "@/assets/station-pumps.jpg";
import carService from "@/assets/car-service.jpg";
import supermarket from "@/assets/supermarket.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Fuel,
  Car,
  ShoppingBag,
  Wrench,
  Coffee,
  Pill,
  Building,
  Key,
  Store,
};

// Default image mapping
const defaultImages: Record<string, string> = {
  "تعبئة الوقود": stationPumps,
  "غسيل السيارات": carService,
  "غيار الزيت والإطارات": carService,
  "سوبر ماركت": supermarket,
  "مطاعم ومقاهي": supermarket,
  "صيدلية": supermarket,
};

// Fallback static services
const fallbackServices = [
  {
    icon: "Fuel",
    title: "تعبئة الوقود",
    description: "وقود عالي الجودة (91، 95، ديزل) بأحدث معدات التعبئة",
    image_url: stationPumps,
  },
  {
    icon: "Car",
    title: "غسيل السيارات",
    description: "خدمات غسيل متكاملة للحفاظ على سيارتك نظيفة ولامعة",
    image_url: carService,
  },
  {
    icon: "Wrench",
    title: "غيار الزيت والإطارات",
    description: "صيانة سريعة وموثوقة لسيارتك بأيدي فنيين محترفين",
    image_url: carService,
  },
  {
    icon: "ShoppingBag",
    title: "سوبر ماركت",
    description: "متجر متكامل يوفر كل ما تحتاجه في رحلتك",
    image_url: supermarket,
  },
  {
    icon: "Coffee",
    title: "مطاعم ومقاهي",
    description: "مطاعم ومقاهي متنوعة لراحتك واستمتاعك",
    image_url: supermarket,
  },
  {
    icon: "Pill",
    title: "صيدلية",
    description: "خدمات صيدلانية لتلبية احتياجاتك الصحية",
    image_url: supermarket,
  },
];

const investorServices = [
  { label: "إدارة المحطات", type: "station_management" },
  { label: "الامتياز التجاري", type: "franchise" },
  { label: "تأجير المرافق", type: "facility_rental" },
];

const Services = () => {
  const { t, language } = useLanguage();
  
  const investorServices = language === "ar" 
    ? [
        { label: "إدارة المحطات", type: "station_management" },
        { label: "الامتياز التجاري", type: "franchise" },
        { label: "تأجير المرافق", type: "facility_rental" },
      ]
    : [
        { label: "Station Management", type: "station_management" },
        { label: "Franchise", type: "franchise" },
        { label: "Facility Rental", type: "facility_rental" },
      ];

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const scrollToContact = (serviceType: string) => {
    const contactSection = document.querySelector("#contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      sessionStorage.setItem("selectedServiceType", serviceType);
      sessionStorage.setItem("contactType", "investor");
      window.dispatchEvent(new CustomEvent("investorServiceSelected", { detail: { serviceType } }));
    }
  };

  const displayServices = services && services.length > 0 ? services : fallbackServices;

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            {t("services.label")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t("services.title")}
            <span className="text-primary"> {t("services.titleHighlight")}</span>
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("services.description")}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card rounded-3xl overflow-hidden shadow-aws border border-border/50">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-16 w-16 rounded-2xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          ) : (
            displayServices.map((service, index) => {
              const IconComponent = iconMap[service.icon || "Fuel"] || Fuel;
              const imageUrl = service.image_url || defaultImages[service.title] || stationPumps;
              const colorClass = index % 2 === 0 ? "bg-primary" : "bg-secondary";
              const serviceId = 'id' in service ? String(service.id) : String(index);

              return (
                <div
                  key={serviceId}
                  className="group relative bg-card rounded-3xl overflow-hidden shadow-aws hover-lift border border-border/50"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative p-6 -mt-8">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              );
            })
          )}
        </div>

        {/* Additional Services Banner - Investor Services */}
        <div className="mt-16 bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {language === "ar" ? "خدمات للمستثمرين" : "Investor Services"}
            </h3>
            <p className="text-white/80 max-w-2xl mx-auto mb-6">
              {language === "ar" 
                ? "نقدم أيضاً خدمات مميزة للمستثمرين تشمل إدارة وتشغيل المحطات، الامتياز التجاري، وتأجير المرافق بالمحطات"
                : "We also offer special services for investors including station management, franchise opportunities, and facility rental"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {investorServices.map((service) => (
                <Button
                  key={service.type}
                  variant="secondary"
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  onClick={() => scrollToContact(service.type)}
                >
                  {service.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
