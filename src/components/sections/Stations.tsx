import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client.safe";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ExternalLink } from "lucide-react";
import stationDay from "@/assets/station-day.jpg";
import stationNight from "@/assets/station-night.jpg";
import serviceCenter from "@/assets/service-center.jpg";
import hotel from "@/assets/hotel.jpg";

// Fallback gallery images
const galleryImages = [
  {
    image: stationDay,
    title: "محطة متكاملة",
    description: "تصميم عصري مع جميع الخدمات",
  },
  {
    image: stationNight,
    title: "خدمة على مدار الساعة",
    description: "نعمل ليلاً ونهاراً لخدمتكم",
  },
  {
    image: serviceCenter,
    title: "مركز خدمة السيارات",
    description: "صيانة متكاملة وغيار زيت وإطارات",
  },
  {
    image: hotel,
    title: "فنادق ومرافق",
    description: "راحة المسافرين أولويتنا",
  },
];

const Stations = () => {
  // Fetch stations from database
  const { data: stations, isLoading: stationsLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .eq("is_active", true)
        .order("region", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Extract unique regions from stations
  const regions = stations
    ? [...new Set(stations.map((s) => s.region))].filter(Boolean)
    : ["منطقة القصيم", "منطقة مكة المكرمة", "منطقة المدينة المنورة", "منطقة حائل", "منطقة عسير"];

  // Calculate stats
  const stationCount = stations?.length || 78;
  const regionCount = regions.length || 5;
  const cityCount = stations ? [...new Set(stations.map((s) => s.city))].filter(Boolean).length : 30;

  return (
    <section id="stations" className="py-24 bg-muted/50">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            محطاتنا
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            انتشارنا
            <span className="text-primary"> الجغرافي</span>
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نغطي كافة مناطق المملكة الرئيسية لخدمتكم أينما كنتم
          </p>
        </div>

        {/* Regions */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {stationsLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-32 rounded-full" />
            ))
          ) : (
            regions.map((region, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-full px-6 py-3 shadow-sm hover:shadow-aws hover:border-secondary transition-all duration-300 cursor-pointer flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{region}</span>
              </div>
            ))
          )}
        </div>

        {/* Stats Banner */}
        <div className="bg-primary rounded-3xl p-8 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-aws-burgundy-dark opacity-90" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">{stationCount}</div>
              <div className="text-white/80">محطة وقود</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">{regionCount}</div>
              <div className="text-white/80">مناطق</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">{cityCount}+</div>
              <div className="text-white/80">مدينة ومحافظة</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-white/80">خدمة مستمرة</div>
            </div>
          </div>
        </div>

        {/* Stations List - Show if we have real stations */}
        {stations && stations.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              محطاتنا
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.slice(0, 6).map((station) => (
                <div
                  key={station.id}
                  className="bg-card rounded-2xl p-6 shadow-aws border border-border/50 hover:shadow-aws-lg hover:border-secondary transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-foreground mb-1">
                        {station.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {station.city} - {station.region}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  
                  {station.address && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {station.address}
                    </p>
                  )}

                  {station.services && station.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {station.services.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}

                  {station.phone && (
                    <a
                      href={`tel:${station.phone}`}
                      className="text-sm text-primary hover:text-secondary transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {station.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stations Gallery */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((station, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden shadow-aws hover-lift"
            >
              <img
                src={station.image}
                alt={station.title}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-lg font-bold mb-1">{station.title}</h3>
                <p className="text-white/80 text-sm">{station.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stations;
