import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import socket from "../socket";
import "leaflet/dist/leaflet.css";

export default function LiveMap({ sosId, victim }) {
  const [currentVictim, setCurrentVictim] = useState(victim);
  const [helpers, setHelpers] = useState({});

  /* ✅ ALWAYS call hooks first */
  useEffect(() => {
    if (!sosId) return;

    socket.emit("join_sos", sosId);

    const handler = (data) => {
      if (data.lat == null || data.lng == null) return;

      // 🔴 update victim LIVE
      if (data.role === "VICTIM") {
        setCurrentVictim({
          lat: data.lat,
          lng: data.lng,
        });
      }

      // 🟢 volunteers
      if (data.role === "VOLUNTEER") {
        setHelpers((prev) => ({
          ...prev,
          [data.userId]: {
            lat: data.lat,
            lng: data.lng,
          },
        }));
      }
    };

    socket.on("location_update", handler);

    return () => socket.off("location_update", handler);
  }, [sosId]);

  /* ✅ fallback to initial victim */
  const displayVictim = currentVictim || victim;

  /* ✅ SAFE UI */
  if (!displayVictim || displayVictim.lat == null || displayVictim.lng == null) {
    return <p className="p-4">Waiting for live location…</p>;
  }

  return (
    <MapContainer
      center={[displayVictim.lat, displayVictim.lng]}
      zoom={14}
      className="h-screen w-screen"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🔴 Victim */}
      <Marker position={[displayVictim.lat, displayVictim.lng]} />

      {/* 🟢 Volunteers */}
      {Object.entries(helpers).map(([id, h]) => (
        <Marker key={id} position={[h.lat, h.lng]} />
      ))}
    </MapContainer>
  );
}