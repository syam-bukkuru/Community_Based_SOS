import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import socket from "../socket";
import { victimIcon, volunteerIcon } from "../utils/mapIcons";
import "leaflet/dist/leaflet.css";

export default function PoliceLiveMap() {
  const { sosId } = useParams();

  const [victimPos, setVictimPos] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [routes, setRoutes] = useState({}); // userId -> polyline

  const lastVictimRef = useRef(null);

  /* ---------------- JOIN SOS + LISTEN ---------------- */
  useEffect(() => {
    socket.emit("join_sos", sosId);

    const onLocationUpdate = data => {
      // 🔴 Victim
      if (data.role === "VICTIM") {
        lastVictimRef.current = [data.lat, data.lng];
        setVictimPos([data.lat, data.lng]);
      }

      // 🟢 Volunteers (ALL)
      if (data.role === "VOLUNTEER") {
        setVolunteers(prev => {
          const exists = prev.find(v => v.userId === data.userId);
          if (exists) {
            return prev.map(v =>
              v.userId === data.userId
                ? { ...v, lat: data.lat, lng: data.lng }
                : v
            );
          }
          return [...prev, data];
        });
      }
    };

    socket.on("location_update", onLocationUpdate);
    return () => socket.off("location_update", onLocationUpdate);
  }, [sosId]);

  /* ---------------- OSRM ROUTES (ALL VOLUNTEERS) ---------------- */
  useEffect(() => {
    if (!victimPos || volunteers.length === 0) return;

    volunteers.forEach(v => {
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${v.lng},${v.lat};${victimPos[1]},${victimPos[0]}?overview=full&geometries=geojson`
      )
        .then(res => res.json())
        .then(data => {
          if (data.routes?.length) {
            setRoutes(prev => ({
              ...prev,
              [v.userId]: data.routes[0].geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
              ),
            }));
          }
        });
    });
  }, [victimPos, volunteers]);

  if (!victimPos && volunteers.length === 0) {
    return <p className="p-4">Waiting for live location…</p>;
  }

  return (
    <MapContainer
      center={victimPos || [volunteers[0].lat, volunteers[0].lng]}
      zoom={13}
      className="h-screen w-screen"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🔴 Victim */}
      {victimPos && (
        <Marker position={victimPos} icon={victimIcon}>
          <Popup>
            <b>Victim</b>
          </Popup>
        </Marker>
      )}

      {/* 🟢 Volunteers */}
      {volunteers.map(v => (
        <Marker
          key={v.userId}
          position={[v.lat, v.lng]}
          icon={volunteerIcon}
        >
          <Popup>
            <b>{v.name}</b>
          </Popup>
        </Marker>
      ))}

      {/* 🟦 Routes */}
      {Object.entries(routes).map(([uid, coords]) => (
        <Polyline key={uid} positions={coords} />
      ))}
    </MapContainer>
  );
}
