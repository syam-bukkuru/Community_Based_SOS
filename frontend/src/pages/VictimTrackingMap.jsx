import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import api from "../api";
import socket from "../socket";
import { victimIcon, volunteerIcon } from "../utils/mapIcons";
import "leaflet/dist/leaflet.css";

export default function VictimTrackingMap() {
  const { sosId } = useParams();

  const [victimPos, setVictimPos] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [routes, setRoutes] = useState({}); // userId -> polyline

  /* 1️⃣ LOAD INITIAL DATA FROM DB */
  useEffect(() => {
    if (!sosId) return;

    api.get(`/tracking/${sosId}`).then(res => {
      const logs = res.data;

      // victim (latest)
      const victimLogs = logs.filter(l => l.role === "VICTIM" && l.lat && l.lng);
      if (victimLogs.length) {
        const v = victimLogs[victimLogs.length - 1];
        setVictimPos([v.lat, v.lng]);
      }

      // volunteers (latest per user)
      const byUser = {};
      logs
        .filter(l => l.role === "VOLUNTEER" && l.lat && l.lng)
        .forEach(l => {
          byUser[l.userId] = l;
        });

      setVolunteers(
        Object.values(byUser).map(v => ({
          userId: v.userId,
          name: v.userId?.name || "Volunteer",
          lat: v.lat,
          lng: v.lng,
        }))
      );
    });
  }, [sosId]);

  /* 2️⃣ LIVE SOCKET UPDATES */
  useEffect(() => {
    if (!sosId) return;

    socket.emit("join_sos", sosId);

    const onUpdate = data => {
      if (data.role === "VICTIM") {
        setVictimPos([data.lat, data.lng]);
      }

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

    socket.on("location_update", onUpdate);
    return () => socket.off("location_update", onUpdate);
  }, [sosId]);

  /* 3️⃣ ROUTES: EACH VOLUNTEER → VICTIM */
  useEffect(() => {
    if (!victimPos || volunteers.length === 0) return;

    volunteers.forEach(v => {
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${v.lng},${v.lat};${victimPos[1]},${victimPos[0]}?overview=full&geometries=geojson`
      )
        .then(r => r.json())
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

  if (!victimPos) return <p className="p-4">Waiting for victim location…</p>;

  return (
    <MapContainer center={victimPos} zoom={13} className="h-screen w-screen">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🔴 Victim */}
      <Marker position={victimPos} icon={victimIcon}>
        <Popup><b>Victim</b></Popup>
      </Marker>

      {/* 🟢 Volunteers */}
      {volunteers.map(v => (
        <Marker
          key={v.userId}
          position={[v.lat, v.lng]}
          icon={volunteerIcon}
        >
          <Popup><b>{v.name}</b></Popup>
        </Marker>
      ))}

      {/* 🟦 Routes */}
      {Object.values(routes).map((r, i) => (
        <Polyline key={i} positions={r} />
      ))}
    </MapContainer>
  );
}
