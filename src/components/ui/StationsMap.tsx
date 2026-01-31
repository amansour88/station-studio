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
  latitude?: number | null;
  longitude?: number | null;
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

  // Process stations to get coordinates - check direct lat/lng first, then extract from URL
  // IMPORTANT: Filter out any NaN values to prevent map crash
  const stationsWithCoords = useMemo(() => {
    return stations
      .map(station => {
        // First try direct latitude/longitude fields
        if (station.latitude && station.longitude) {
          const lat = Number(station.latitude);
          const lng = Number(station.longitude);
          // Validate coordinates are valid numbers
          if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
            return { ...station, lat, lng };
          }
        }
        // Then try extracting from google_maps_url
        const coords = extractCoordinates(station.google_maps_url);
        if (coords && !isNaN(coords.lat) && !isNaN(coords.lng)) {
          return { ...station, lat: coords.lat, lng: coords.lng };
        }
        return null;
      })
      .filter((s): s is (Station & { lat: number; lng: number }) => s !== null);
  }, [stations]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Calculate initial center - use Saudi Arabia center as default
    let initialCenter: [number, number] = [24.7136, 46.6753];
    let initialZoom = 6;

    if (stationsWithCoords.length > 0) {
      const validStations = stationsWithCoords.filter(s => 
        !isNaN(s.lat) && !isNaN(s.lng) && isFinite(s.lat) && isFinite(s.lng)
      );
      if (validStations.length > 0) {
        const avgLat = validStations.reduce((sum, s) => sum + s.lat, 0) / validStations.length;
        const avgLng = validStations.reduce((sum, s) => sum + s.lng, 0) / validStations.length;
        if (!isNaN(avgLat) && !isNaN(avgLng)) {
          initialCenter = [avgLat, avgLng];
        }
      }
    }

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      scrollWheelZoom: true,
      attributionControl: false, // Remove attribution
    });

    // Add tile layer without attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '',
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
      const marker = L.marker([station.lat, station.lng], {
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
      // First try direct lat/lng
      if (selectedStation.latitude && selectedStation.longitude) {
        map.flyTo([selectedStation.latitude, selectedStation.longitude], 14, { duration: 1 });
      } else {
        // Then try extracting from URL
        const coords = extractCoordinates(selectedStation.google_maps_url);
        if (coords) {
          map.flyTo([coords.lat, coords.lng], 14, { duration: 1 });
        }
      }
    }
  }, [selectedStation, stationsWithCoords]);

  if (stationsWithCoords.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 min-h-[350px] lg:min-h-[450px]">
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
      className="w-full h-full min-h-[350px] lg:min-h-[450px]"
      style={{ zIndex: 0 }}
    />
  );
};

export default StationsMap;
