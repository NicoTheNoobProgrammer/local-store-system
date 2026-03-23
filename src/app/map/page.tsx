"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

// 👇 Load map only on client (prevents SSR issues)
const Map = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

export default function MapPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stores")
      .then((res) => res.json())
      .then((data) => {
        setStores(data);
        setLoading(false);
      });
  }, []);

  // 🔥 Loading state
  if (loading) {
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading map...
      </div>
    );
  }

  return (
    <div>
      {/* 🔥 HEADER */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin size={20} /> Store Locations
        </h1>
        <p className="text-gray-500 text-sm">
          Explore stores across Butuan City
        </p>
      </div>

      {/* 🔥 EMPTY STATE */}
      {stores.length === 0 ? (
        <p className="text-gray-500">No stores available</p>
      ) : (
        <div className="h-[75vh] rounded-xl overflow-hidden shadow">
          <Map stores={stores} />
        </div>
      )}
    </div>
  );
}