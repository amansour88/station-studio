import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import logoFlame from "@/assets/logo-flame.png";
import { useLanguage } from "@/contexts/LanguageContext";

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

// Create custom flame icon
const createFlameIcon = (isSelected: boolean = false) => {
  const size = isSelected ? 48 : 32;
  return L.divIcon({
    className: "custom-flame-marker",
    html: `
      <div class="flame-marker ${isSelected ? "selected" : ""}">
        <img src="${logoFlame}" alt="AWS" style="width: ${size}px; height: ${size}px;" />
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const StationsMap = ({ stations, selectedStation, onStationSelect }: StationsMapProps) => {
  const { t } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

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
      .filter((s): s is (Station & { latitude: number; longitude: number }) => s !== null);
  }, [stations]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Calculate initial center
    let initialCenter: [number, number] = [24.7136, 46.6753]; // Saudi Arabia center
    let initialZoom = 6;

    if (stationsWithCoords.length > 0) {
      const avgLat = stationsWithCoords.reduce((sum, s) => sum + s.latitude, 0) / stationsWithCoords.length;
      const avgLng = stationsWithCoords.reduce((sum, s) => sum + s.longitude, 0) / stationsWithCoords.length;
      initialCenter = [avgLat, avgLng];
    }

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      scrollWheelZoom: true,
    });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add/update markers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers
    stationsWithCoords.forEach(station => {
      const isSelected = selectedStation?.id === station.id;
      const marker = L.marker([station.latitude, station.longitude], {
        icon: createFlameIcon(isSelected),
      });

      // Only trigger selection, no popup
      marker.on("click", () => onStationSelect(station));
      marker.addTo(map);

      markersRef.current.set(station.id, marker);
    });
  }, [stationsWithCoords, selectedStation, onStationSelect, t]);

  // Handle selected station change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Update all marker icons
    stationsWithCoords.forEach(station => {
      const marker = markersRef.current.get(station.id);
      if (marker) {
        const isSelected = selectedStation?.id === station.id;
        marker.setIcon(createFlameIcon(isSelected));
      }
    });

    // Fly to selected station
    if (selectedStation) {
      const coords = extractCoordinates(selectedStation.google_maps_url);
      if (coords) {
        map.flyTo([coords.lat, coords.lng], 14, { duration: 1 });
      }
    }
  }, [selectedStation, stationsWithCoords]);

  if (stationsWithCoords.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 min-h-[400px] lg:min-h-[600px]">
        <div className="text-center p-6">
          <img src={logoFlame} alt="AWS" className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">{t("stations.noStationsOnMap")}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[400px] lg:min-h-[600px]"
      style={{ zIndex: 0 }}
    />
  );
};

export default StationsMap;
