import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import logoFlame from "@/assets/logo-flame.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Phone } from "lucide-react";

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: logoFlame,
  iconUrl: logoFlame,
  shadowUrl: undefined,
});

// Custom AWS flame icon
const createFlameIcon = (isSelected: boolean = false) => {
  return L.divIcon({
    className: "custom-flame-marker",
    html: `
      <div class="flame-marker ${isSelected ? "selected" : ""}">
        <img src="${logoFlame}" alt="AWS" />
      </div>
    `,
    iconSize: [isSelected ? 48 : 36, isSelected ? 48 : 36],
    iconAnchor: [isSelected ? 24 : 18, isSelected ? 48 : 36],
    popupAnchor: [0, -36],
  });
};

interface Station {
  id: string;
  name: string;
  region: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  services: string[] | null;
  products: string[] | null;
  google_maps_url: string | null;
  latitude?: number;
  longitude?: number;
}

interface StationsMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onStationSelect: (station: Station) => void;
}

// Extract coordinates from Google Maps URL
const extractCoordinates = (url: string | null): { lat: number; lng: number } | null => {
  if (!url) return null;
  const match = url.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return null;
};

// Component to handle map center changes
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  
  return null;
};

const StationsMap = ({ stations, selectedStation, onStationSelect }: StationsMapProps) => {
  const { t, language } = useLanguage();
  
  // Process stations to get coordinates
  const stationsWithCoords = useMemo(() => {
    return stations
      .map(station => {
        const coords = extractCoordinates(station.google_maps_url);
        if (coords) {
          return { ...station, latitude: coords.lat, longitude: coords.lng };
        }
        return null;
      })
      .filter((s): s is Station & { latitude: number; longitude: number } => s !== null);
  }, [stations]);

  // Calculate map center and zoom
  const mapCenter = useMemo((): [number, number] => {
    if (selectedStation) {
      const coords = extractCoordinates(selectedStation.google_maps_url);
      if (coords) return [coords.lat, coords.lng];
    }
    
    if (stationsWithCoords.length > 0) {
      const avgLat = stationsWithCoords.reduce((sum, s) => sum + s.latitude, 0) / stationsWithCoords.length;
      const avgLng = stationsWithCoords.reduce((sum, s) => sum + s.longitude, 0) / stationsWithCoords.length;
      return [avgLat, avgLng];
    }
    
    // Default to Saudi Arabia center
    return [24.7136, 46.6753];
  }, [stationsWithCoords, selectedStation]);

  const mapZoom = selectedStation ? 14 : 6;

  if (stationsWithCoords.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="text-center p-6">
          <img src={logoFlame} alt="AWS" className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">{t("stations.noStationsOnMap")}</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      className="w-full h-full min-h-[400px] lg:min-h-[600px] z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController center={mapCenter} zoom={mapZoom} />
      
      {stationsWithCoords.map((station) => {
        const isSelected = selectedStation?.id === station.id;
        
        return (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={createFlameIcon(isSelected)}
            eventHandlers={{
              click: () => onStationSelect(station),
            }}
          >
            <Popup className="aws-popup">
              <div className="p-2 min-w-[200px]">
                <h4 className="font-bold text-foreground mb-1">{station.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{station.city} - {station.region}</p>
                
                {station.address && (
                  <p className="text-xs text-muted-foreground mb-2">{station.address}</p>
                )}
                
                <div className="flex items-center gap-2 mt-2">
                  {station.phone && (
                    <a
                      href={`tel:${station.phone}`}
                      className="flex items-center gap-1 text-xs text-primary hover:text-secondary"
                      dir="ltr"
                    >
                      <Phone className="w-3 h-3" />
                      {station.phone}
                    </a>
                  )}
                  {station.google_maps_url && (
                    <a
                      href={station.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-secondary hover:text-primary"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t("stations.directions")}
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default StationsMap;
