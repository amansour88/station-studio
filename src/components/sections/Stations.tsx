import { useState, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ExternalLink, Phone, Fuel, Car, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import logoFlame from "@/assets/logo-flame.png";
import api from "@/lib/api";
import type { Region, Station } from "@/types/api";

// Convert decimal coordinates to DMS format for Google Maps URL
const convertToDMS = (lat: number, lng: number): string => {
  const toDegreesMinutesSeconds = (decimal: number): string => {
    const degrees = Math.floor(Math.abs(decimal));
    const minutesDecimal = (Math.abs(decimal) - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);
    return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds}"`;
  };

  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  
  const latDMS = toDegreesMinutesSeconds(lat) + latDirection;
  const lngDMS = toDegreesMinutesSeconds(lng) + lngDirection;
  
  return `${latDMS}+${lngDMS}`;
};

// Lazy load the map component - force fresh import
const StationsMap = lazy(() => import("@/components/ui/StationsMap"));

// Fallback regions data (78 محطة في 5 مناطق)
const fallbackRegions = [
  { id: "1", name: "القصيم", slug: "qassim", is_active: true, display_order: 1 },
  { id: "2", name: "مكة المكرمة", slug: "makkah", is_active: true, display_order: 2 },
  { id: "3", name: "المدينة المنورة", slug: "madinah", is_active: true, display_order: 3 },
  { id: "4", name: "حائل", slug: "hail", is_active: true, display_order: 4 },
  { id: "5", name: "عسير", slug: "asir", is_active: true, display_order: 5 },
];

// Fallback stations data (sample من البيانات الحقيقية)
const fallbackStations: Station[] = [
  // القصيم - 35 محطة
  { id: "1", name: "AWS-1001", region: "القصيم", city: "بريدة", address: "طريق الملك عبدالعزيز", latitude: 26.3266, longitude: 43.9748, phone: "920008436", services: ["غسيل سيارات", "سوبرماركت"], products: ["بنزين 91", "بنزين 95", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "2", name: "AWS-1002", region: "القصيم", city: "عنيزة", address: "طريق الملك فهد", latitude: 26.0840, longitude: 43.9953, phone: "920008436", services: ["سوبرماركت", "مطعم"], products: ["بنزين 91", "بنزين 95"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "3", name: "AWS-1003", region: "القصيم", city: "الرس", address: "طريق الرس - بريدة", latitude: 25.8697, longitude: 43.4975, phone: "920008436", services: ["غسيل سيارات"], products: ["بنزين 91", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "4", name: "AWS-1004", region: "القصيم", city: "البكيرية", address: "الطريق الرئيسي", latitude: 26.1458, longitude: 43.6641, phone: "920008436", services: ["سوبرماركت"], products: ["بنزين 91", "بنزين 95"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "5", name: "AWS-1005", region: "القصيم", city: "المذنب", address: "طريق المذنب", latitude: 25.8679, longitude: 44.2239, phone: "920008436", services: [], products: ["بنزين 91"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  // مكة المكرمة - 20 محطة
  { id: "6", name: "AWS-1051", region: "مكة المكرمة", city: "أبيار علي", address: "طريق المدينة", latitude: 24.1800, longitude: 39.5662, phone: "920008436", services: ["سوبرماركت", "مسجد"], products: ["بنزين 91", "بنزين 95", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "7", name: "AWS-1052", region: "مكة المكرمة", city: "الحمراء", address: "طريق الحمراء", latitude: 24.3754, longitude: 39.5154, phone: "920008436", services: ["غسيل سيارات"], products: ["بنزين 91", "بنزين 95"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "8", name: "AWS-1053", region: "مكة المكرمة", city: "اليتمة", address: "طريق اليتمة 1", latitude: 23.8100, longitude: 39.6457, phone: "920008436", services: ["مطعم", "كافيه"], products: ["بنزين 91", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "9", name: "AWS-1073", region: "مكة المكرمة", city: "جدة", address: "محطة السعودية", latitude: 21.6334, longitude: 39.1638, phone: "920008436", services: ["سوبرماركت", "صراف آلي"], products: ["بنزين 91", "بنزين 95", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "10", name: "AWS-1074", region: "مكة المكرمة", city: "جدة", address: "محطة الثريا", latitude: 21.7062, longitude: 39.2134, phone: "920008436", services: ["غسيل سيارات", "تغيير زيت"], products: ["بنزين 91", "بنزين 95"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  // المدينة المنورة - 12 محطة
  { id: "11", name: "AWS-1056", region: "المدينة المنورة", city: "العاقول", address: "طريق العاقول", latitude: 24.5484, longitude: 39.7564, phone: "920008436", services: ["سوبرماركت"], products: ["بنزين 91", "بنزين 95"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "12", name: "AWS-1057", region: "المدينة المنورة", city: "أدنو", address: "طريق أدنو", latitude: 24.4723, longitude: 39.4581, phone: "920008436", services: ["مطعم"], products: ["بنزين 91", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "13", name: "AWS-1059", region: "المدينة المنورة", city: "التلال", address: "طريق التلال", latitude: 24.3560, longitude: 39.6010, phone: "920008436", services: [], products: ["بنزين 91", "بنزين 95"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "14", name: "AWS-1063", region: "المدينة المنورة", city: "الرحيلي", address: "طريق الرحيلي", latitude: 24.1211, longitude: 39.5723, phone: "920008436", services: ["غسيل سيارات"], products: ["بنزين 91"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  // حائل - 6 محطات
  { id: "15", name: "AWS-1070", region: "حائل", city: "حائل", address: "بترو عقده", latitude: 27.5181, longitude: 41.6580, phone: "920008436", services: ["سوبرماركت", "مطعم"], products: ["بنزين 91", "بنزين 95", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "16", name: "AWS-1079", region: "حائل", city: "تيماء", address: "تيماء 1", latitude: 27.6266, longitude: 38.5276, phone: "920008436", services: ["مسجد"], products: ["بنزين 91", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "17", name: "AWS-1080", region: "حائل", city: "تيماء", address: "تيماء 2", latitude: 27.6110, longitude: 38.5574, phone: "920008436", services: [], products: ["بنزين 91", "بنزين 95"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  // عسير - 5 محطات
  { id: "18", name: "AWS-1075", region: "عسير", city: "خميس مشيط", address: "محطة الرياض", latitude: 21.8611, longitude: 39.1917, phone: "920008436", services: ["سوبرماركت", "كافيه"], products: ["بنزين 91", "بنزين 95", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "19", name: "AWS-1076", region: "عسير", city: "أبها", address: "طريق أبها", latitude: 18.2164, longitude: 42.5053, phone: "920008436", services: ["غسيل سيارات"], products: ["بنزين 91", "بنزين 95"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
  { id: "20", name: "AWS-1077", region: "عسير", city: "خميس مشيط", address: "طريق الملك فهد", latitude: 18.3093, longitude: 42.7230, phone: "920008436", services: ["مطعم", "صراف آلي"], products: ["بنزين 91", "ديزل"], is_active: true, created_at: "", updated_at: "", google_maps_url: null, image_url: null },
];

const Stations = () => {
  const { t, language } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Fetch regions from database
  const { data: dbRegions, isLoading: regionsLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      return api.get<Region[]>("/regions/list.php");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes in cache
  });

  // Fetch stations from database
  const { data: dbStations, isLoading: stationsLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: async () => {
      return api.get<Station[]>("/stations/list.php");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes in cache
  });

  // Use database data or fallback
  const regions = dbRegions && dbRegions.length > 0 ? dbRegions : fallbackRegions;
  const stations = dbStations && dbStations.length > 0 ? dbStations : fallbackStations;

  // Filter stations by region
  const filteredStations = selectedRegion === "all"
    ? stations
    : stations?.filter(s => s.region === selectedRegion);

  // Calculate stats
  const stationCount = stations?.length || 78;
  const regionCount = regions?.length || 5;
  const cityCount = stations ? [...new Set(stations.map((s) => s.city))].filter(Boolean).length : 30;

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
  };

  return (
    <section id="stations" className="py-24 bg-muted/50">
      <div className="container px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-secondary font-semibold text-lg mb-4">
            {t("stations.label")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t("stations.title")}
            <span className="text-primary"> {t("stations.titleHighlight")}</span>
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("stations.description")}
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-primary rounded-3xl p-6 md:p-8 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-aws-burgundy-dark opacity-90" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div>
              <div className="text-3xl md:text-5xl font-bold text-secondary mb-2">{stationCount}</div>
              <div className="text-white/80 text-sm md:text-base">{t("stations.stationCount")}</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-bold text-secondary mb-2">{regionCount}</div>
              <div className="text-white/80 text-sm md:text-base">{t("stations.regionCount")}</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-bold text-secondary mb-2">{cityCount}+</div>
              <div className="text-white/80 text-sm md:text-base">{t("stations.cityCount")}</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-white/80 text-sm md:text-base">{t("stations.alwaysOpen")}</div>
            </div>
          </div>
        </div>

        {/* Main Content - Map + Stations List */}
        <div className="bg-card rounded-3xl shadow-aws-lg border border-border/50 overflow-hidden">
          {/* Regions Filter */}
          <div className="p-4 md:p-6 border-b border-border/50 bg-muted/30">
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {regionsLoading && (!regions || regions.length === 0) ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-24 rounded-full" />
                ))
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedRegion("all");
                      setSelectedStation(null);
                    }}
                    className={cn(
                      "px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base shadow-sm transition-all duration-300 flex items-center gap-2",
                      selectedRegion === "all"
                        ? "bg-primary text-primary-foreground shadow-aws"
                        : "bg-card border border-border hover:shadow-aws hover:border-secondary"
                    )}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{t("stations.allRegions")}</span>
                  </button>
                  {regions?.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        setSelectedRegion(region.name);
                        setSelectedStation(null);
                      }}
                      className={cn(
                        "px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base shadow-sm transition-all duration-300 flex items-center gap-2",
                        selectedRegion === region.name
                          ? "bg-primary text-primary-foreground shadow-aws"
                          : "bg-card border border-border hover:shadow-aws hover:border-secondary"
                      )}
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{region.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Map + List Container */}
          <div className="grid lg:grid-cols-2 min-h-[450px]">
            {/* Stations List */}
            <div className={`border-b lg:border-b-0 ${language === "ar" ? "lg:border-l" : "lg:border-r"} border-border/50 overflow-y-auto max-h-[350px] lg:max-h-[450px]`}>
              <div className="p-4 border-b border-border/50 bg-muted/20 sticky top-0 z-10">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <img src={logoFlame} alt="AWS" className="w-5 h-5" />
                  {selectedRegion === "all" 
                    ? t("stations.ourStations") 
                    : `${t("stations.stationsIn")} ${selectedRegion}`}
                  <span className="text-muted-foreground font-normal text-sm">
                    ({filteredStations?.length || 0} {t("stations.station")})
                  </span>
                </h3>
              </div>
              
              {stationsLoading && (!stations || stations.length === 0) ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : filteredStations && filteredStations.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {filteredStations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleStationClick(station)}
                      className={cn(
                        "w-full text-start p-4 hover:bg-muted/50 transition-all duration-200",
                        selectedStation?.id === station.id && "bg-primary/5 border-s-4 border-primary"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                          selectedStation?.id === station.id 
                            ? "bg-primary" 
                            : "bg-primary/10"
                        )}>
                          <img 
                            src={logoFlame} 
                            alt="AWS" 
                            className={cn(
                              "w-6 h-6",
                              selectedStation?.id === station.id && "brightness-0 invert"
                            )} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-foreground mb-1 truncate">
                            {station.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {station.city} - {station.region}
                          </p>
                          
                          {/* Products & Services Display */}
                          <div className="space-y-1.5">
                            {/* Products */}
                            {station.products && station.products.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {station.products.slice(0, 3).map((product, idx) => (
                                  <span key={idx} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Fuel className="w-2.5 h-2.5" />
                                    {product}
                                  </span>
                                ))}
                                {station.products.length > 3 && (
                                  <span className="text-[10px] text-muted-foreground">+{station.products.length - 3}</span>
                                )}
                              </div>
                            )}
                            {/* Services */}
                            {station.services && station.services.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {station.services.slice(0, 2).map((service, idx) => (
                                  <span key={idx} className="text-[10px] bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Car className="w-2.5 h-2.5" />
                                    {service}
                                  </span>
                                ))}
                                {station.services.length > 2 && (
                                  <span className="text-[10px] text-muted-foreground">+{station.services.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t("stations.noStations")}</p>
                </div>
              )}
            </div>

            {/* Interactive Map with Leaflet */}
            <div className="relative bg-muted/20">
              <Suspense fallback={
                <div className="w-full h-full min-h-[350px] lg:min-h-[450px] flex items-center justify-center">
                  <div className="text-center">
                    <img src={logoFlame} alt="AWS" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground">{t("stations.loadingMap")}</p>
                  </div>
                </div>
              }>
                {filteredStations && (
                  <StationsMap
                    stations={filteredStations}
                    selectedStation={selectedStation}
                    onStationSelect={handleStationClick}
                  />
                )}
              </Suspense>
              
              {/* Selected Station Details Overlay */}
              {selectedStation && (
                <div className={`absolute top-4 ${language === "ar" ? "right-4" : "left-4"} z-[1000] bg-card/95 backdrop-blur-sm rounded-2xl shadow-aws-lg p-4 max-w-xs border border-border/50`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <img src={logoFlame} alt="AWS" className="w-8 h-8 brightness-0 invert" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{selectedStation.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedStation.city}</p>
                    </div>
                  </div>
                  
                  {selectedStation.address && (
                    <p className="text-sm text-muted-foreground mb-3">{selectedStation.address}</p>
                  )}
                  
                  {/* Products */}
                  {selectedStation.products && selectedStation.products.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {selectedStation.products.map((product, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {product}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Services */}
                  {selectedStation.services && selectedStation.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {selectedStation.services.map((service, idx) => (
                        <span key={idx} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedStation.phone && (
                      <a
                        href={`tel:${selectedStation.phone}`}
                        className="flex items-center gap-1 text-sm text-primary hover:text-secondary transition-colors"
                        dir="ltr"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedStation.phone}
                      </a>
                    )}
                    
                    {/* Directions Button - works with google_maps_url OR coordinates */}
                    {(selectedStation.google_maps_url || (selectedStation.latitude && selectedStation.longitude)) && (
                      <a
                        href={
                          selectedStation.google_maps_url 
                            ? selectedStation.google_maps_url 
                            : `https://www.google.com/maps/place/${convertToDMS(selectedStation.latitude!, selectedStation.longitude!)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-secondary/90 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        {t("stations.directions")}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stations;
