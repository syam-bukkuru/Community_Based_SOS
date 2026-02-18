// frontend/src/pages/LiveMap.jsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import socket from "../socket";


export default function LiveMap({ sosId, victim }) {
  const [helpers, setHelpers] = useState({});

  useEffect(() => {
    socket.emit("join_sos", sosId);

    socket.on("location_update", data => {
      setHelpers(prev => ({
        ...prev,
        [data.socketId || Date.now()]: {
          lat: data.lat,
          lng: data.lng,
        },
      }));
    });

    return () => socket.off("location_update");
  }, [sosId]);

  return (
    <MapContainer
      center={[victim.lat, victim.lng]}
      zoom={14}
      className="h-screen"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Victim */}
      <Marker position={[victim.lat, victim.lng]} />

      {/* Helpers */}
      {Object.values(helpers).map((h, i) => (
        <Marker key={i} position={[h.lat, h.lng]} />
      ))}
    </MapContainer>
  );
}
