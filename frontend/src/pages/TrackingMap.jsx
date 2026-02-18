// frontend/src/pages/TrackingMap.jsx

import { useEffect, useRef, useState } from "react";
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

export default function TrackingMap() {
  const { sosId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [victimPos, setVictimPos] = useState(null);
  const [volunteerPos, setVolunteerPos] = useState(null);
  const [route, setRoute] = useState([]);

  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  const isVolunteer = user?.isVolunteer;
  const userId = user?._id;
  const userName = user?.name;

  /* ================= 1️⃣ LOAD VICTIM LOCATION FROM DB ================= */
  useEffect(() => {
    if (!sosId) return;

    api.get(`/tracking/${sosId}`).then(res => {
      const victimLogs = res.data.filter(
        l => l.role === "VICTIM" && l.lat && l.lng
      );

      if (victimLogs.length > 0) {
        const last = victimLogs[victimLogs.length - 1];
        setVictimPos([last.lat, last.lng]);
      }
    });
  }, [sosId]);

  /* ================= 2️⃣ SOCKET JOIN + LIVE LISTEN ================= */
  useEffect(() => {
    if (!sosId) return;

    socket.emit("join_sos", sosId);

    const onLocationUpdate = data => {
      if (data.role === "VICTIM") {
        setVictimPos([data.lat, data.lng]);
      }

      if (data.role === "VOLUNTEER" && data.userId === userId) {
        setVolunteerPos([data.lat, data.lng]);
      }
    };

    socket.on("location_update", onLocationUpdate);
    return () => socket.off("location_update", onLocationUpdate);
  }, [sosId, userId]);

  /* ================= 3️⃣ FORCE LOCATION PERMISSION ================= */
  useEffect(() => {
    if (!navigator.geolocation || !isVolunteer || !sosId) return;

    navigator.geolocation.getCurrentPosition(
      () => {
        watchIdRef.current = navigator.geolocation.watchPosition(
          pos => {
            const now = Date.now();
            if (now - lastSentRef.current < 5000) return; // ⏱️ 5 sec throttle
            lastSentRef.current = now;

            socket.emit("location_update", {
              sosId,
              userId,
              role: "VOLUNTEER",
              name: userName,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          err => console.error("GPS error:", err),
          { enableHighAccuracy: true }
        );
      },
      () => alert("⚠️ Location permission is required")
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [sosId, isVolunteer, userId, userName]);

  /* ================= 4️⃣ OSRM ROUTE ================= */
  useEffect(() => {
    if (!victimPos || !volunteerPos) return;

    const [vLat, vLng] = volunteerPos;
    const [tLat, tLng] = victimPos;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${vLng},${vLat};${tLng},${tLat}?overview=full&geometries=geojson`
    )
      .then(res => res.json())
      .then(data => {
        if (data.routes?.length) {
          setRoute(
            data.routes[0].geometry.coordinates.map(([lng, lat]) => [
              lat,
              lng,
            ])
          );
        }
      });
  }, [victimPos, volunteerPos]);

  if (!victimPos) {
    return <p className="p-4">Waiting for victim location…</p>;
  }

  return (
    <MapContainer
      center={victimPos}
      zoom={13}
      className="h-screen w-screen"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🔴 Victim */}
      <Marker position={victimPos} icon={victimIcon}>
        <Popup><b>Victim</b></Popup>
      </Marker>

      {/* 🟢 Current Volunteer */}
      {volunteerPos && (
        <Marker position={volunteerPos} icon={volunteerIcon}>
          <Popup><b>{userName}</b></Popup>
        </Marker>
      )}

      {/* 🟦 Route */}
      {route.length > 0 && <Polyline positions={route} />}
    </MapContainer>
  );
}
