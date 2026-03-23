"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";

// FIX default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 🎨 CATEGORY ICONS
const icons: Record<string, L.Icon> = {
  Plants: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
  }),
  Food: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
  }),
  Tech: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
  }),
};

// 🧠 DISTANCE
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function MapComponent({ stores }: any) {
  const [userLocation, setUserLocation] =
    useState<LatLngExpression | null>(null);

  const [nearestStore, setNearestStore] = useState<any>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      setUserLocation([userLat, userLng]);

      let nearest = null;
      let min = Infinity;

      stores.forEach((store: any) => {
        const d = getDistance(
          userLat,
          userLng,
          store.latitude,
          store.longitude
        );

        if (d < min) {
          min = d;
          nearest = { ...store, distance: d };
        }
      });

      setNearestStore(nearest);
    });
  }, [stores]);

  return (
    <div className="relative">

      {/* 🤖 AI PANEL */}
      {nearestStore && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 shadow-xl rounded-xl px-6 py-3 text-center">
          <p className="font-semibold">🤖 Smart Recommendation</p>
          <p>
            <b>{nearestStore.name}</b>
          </p>
          <p className="text-sm text-gray-500">
            {nearestStore.distance.toFixed(2)} km away
          </p>
        </div>
      )}

      <MapContainer
        center={(userLocation ?? [8.9475, 125.5406]) as LatLngExpression}
        zoom={14}
        className="h-screen w-full rounded-xl overflow-hidden"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {stores.map((store: any) => {
          const isNearest = nearestStore?.id === store.id;

          return (
            <Marker
              key={store.id}
              position={[store.latitude, store.longitude] as LatLngExpression}
              icon={
                isNearest
                  ? new L.Icon({
                      iconUrl:
                        "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                      iconSize: [42, 42],
                    })
                  : icons[store.category] ?? icons.Plants
              }
            >
              <Popup>
                <div className="text-center">
                  <b>{store.name}</b>
                  <p className="text-sm text-gray-500">
                    {store.category}
                  </p>

                  {isNearest && (
                    <p className="text-yellow-500 font-bold">
                      ⭐ Best Option
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* USER */}
        {userLocation && (
          <>
            <Marker position={userLocation}>
              <Popup>You are here 📍</Popup>
            </Marker>

            <Circle
              center={userLocation}
              radius={500}
              pathOptions={{ color: "blue", fillOpacity: 0.1 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}