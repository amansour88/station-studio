import { useState, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ExternalLink, Phone, Fuel, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import logoFlame from "@/assets/logo-flame.png";
import api from "@/lib/api";
import type { Region, Station } from "@/types/api";

// Lazy load the map component - force fresh import
const StationsMap = lazy(() => import("@/components/ui/StationsMap"));

const Stations = () => {
  const { t, language } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Fetch regions from database
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const data = await api.get<Region[]>("/regions/list.php");
      return data;
    },
  });

  // Fetch stations from database
  const { data: stations, isLoading: stationsLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: async () => {
      const data = await api.get<Station[]>("/stations/list.php");
      return data;
    },
  });

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
              {regionsLoading ? (
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
              
              {stationsLoading ? (
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
                          
                          {/* Quick Info Icons */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {station.products && station.products.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Fuel className="w-3 h-3 text-primary" />
                                {station.products.length}
                              </span>
                            )}
                            {station.services && station.services.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Car className="w-3 h-3 text-secondary" />
                                {station.services.length}
                              </span>
                            )}
                            {station.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                              </span>
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
                  
                  <div className="flex items-center gap-3">
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
                    {selectedStation.google_maps_url && (
                      <a
                        href={selectedStation.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
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
