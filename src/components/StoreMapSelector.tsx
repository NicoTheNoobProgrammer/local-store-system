"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface StoreMapSelectorProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  latitude?: number;
  longitude?: number;
}

export default function StoreMapSelector({
  onLocationSelect,
  latitude,
  longitude,
}: StoreMapSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(latitude && longitude ? { lat: latitude, lng: longitude } : null);
  const [isClient, setIsClient] = useState(false);

  // Load Leaflet CSS dynamically
  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || map.current) return;

    if (!mapContainer.current) return;

    // Default to center of Philippines
    const defaultLat = latitude || 12.8797;
    const defaultLng = longitude || 121.774;

    // Initialize map
    map.current = L.map(mapContainer.current).setView(
      [defaultLat, defaultLng],
      13
    );

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Fix icon issues with leaflet
    const defaultIcon = L.icon({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Add initial marker if coordinates exist
    if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude], {
        icon: defaultIcon,
        draggable: true,
      }).addTo(map.current);

      markerRef.current.on("dragend", () => {
        const pos = markerRef.current?.getLatLng();
        if (pos) {
          setSelectedCoords({ lat: pos.lat, lng: pos.lng });
          onLocationSelect(pos.lat, pos.lng);
        }
      });
    }

    // Handle map clicks
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Remove old marker
      if (markerRef.current) {
        map.current?.removeLayer(markerRef.current);
      }

      // Add new marker
      markerRef.current = L.marker([lat, lng], {
        icon: defaultIcon,
        draggable: true,
      }).addTo(map.current!);

      // Make marker draggable
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current?.getLatLng();
        if (pos) {
          setSelectedCoords({ lat: pos.lat, lng: pos.lng });
          onLocationSelect(pos.lat, pos.lng);
        }
      });

      setSelectedCoords({ lat, lng });
      onLocationSelect(lat, lng);
    };

    if (map.current) {
      map.current.on("click", handleMapClick);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off("click", handleMapClick);
      }
    };
  }, [isClient, latitude, longitude]);

  if (!isClient) {
    return <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />;
  }

  return (
    <div className="w-full space-y-3">
      <div
        ref={mapContainer}
        className="w-full h-96 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md"
      />
      {selectedCoords && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            📍 Selected Location:
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            Latitude: <span className="font-mono font-bold">{selectedCoords.lat.toFixed(6)}</span>
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            Longitude: <span className="font-mono font-bold">{selectedCoords.lng.toFixed(6)}</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            💡 Drag the marker to adjust location or click anywhere on the map
          </p>
        </div>
      )}
    </div>
  );
}
