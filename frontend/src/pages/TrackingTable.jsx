// frontend/src/pages/TrackingTable.jsx

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import socket from "../socket";

export default function TrackingTable() {
  const { sosId } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const watchIdRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ stable primitives
  const isVolunteer = user?.isVolunteer;
  const userId = user?._id;
  const userName = user?.name;

  /* ================= LOAD PREVIOUS TRACKING ================= */
  useEffect(() => {
    if (!sosId) return;

    api.get(`/tracking/${sosId}`).then(res => {
      setRows(
        res.data.map(log => ({
          name: log.role === "VOLUNTEER" ? log.userId?.name || "Volunteer" : log.role,
          lat: log.lat,
          lng: log.lng,
          time: new Date(log.createdAt).toLocaleTimeString(),
        }))
      );
    });
  }, [sosId]);

  /* ================= SOCKET JOIN + LIVE LISTEN ================= */
  useEffect(() => {
    if (!sosId) return;

    socket.emit("join_sos", sosId);

    const onLocationUpdate = data => {
      setRows(prev => [
        ...prev,
        {
          name: data.name,
          lat: data.lat,
          lng: data.lng,
          time: data.time,
        },
      ]);
    };

    socket.on("location_update", onLocationUpdate);

    return () => {
      socket.off("location_update", onLocationUpdate);
    };
  }, [sosId]);

  /* ================= VOLUNTEER GPS TRACKING (FIXED) ================= */
  useEffect(() => {
    if (!navigator.geolocation || !isVolunteer || !sosId) return;

    // 🔥 FORCE permission popup
    navigator.geolocation.getCurrentPosition(
      () => {
        let lastSent = 0;

        watchIdRef.current = navigator.geolocation.watchPosition(
          pos => {
            const now = Date.now();
            if (now - lastSent < 5000) return; // ⏱️ 5 sec throttle
            lastSent = now;

            socket.emit("location_update", {
              sosId,
              userId,
              role: "VOLUNTEER",
              name: userName,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          err => console.error("GPS watch error:", err),
          { enableHighAccuracy: true }
        );
      },
      err => {
        alert("⚠️ Location permission is required to help the victim");
        console.error(err);
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [sosId, isVolunteer, userId, userName]);

  /* ================= RESOLVE SOS ================= */
  const resolveSOS = async () => {
    await api.post(`/sos/resolve/${sosId}`);

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    alert("✅ SOS resolved");
    navigate("/volunteer");
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Live SOS Tracking</h2>

      <table className="border w-full text-sm">
        <thead>
          <tr>
            <th className="border px-2">Person</th>
            <th className="border px-2">Latitude</th>
            <th className="border px-2">Longitude</th>
            <th className="border px-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border px-2">{r.name}</td>
              <td className="border px-2">{r.lat}</td>
              <td className="border px-2">{r.lng}</td>
              <td className="border px-2">{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ RESOLVE — ONLY FOR VOLUNTEERS */}
      {isVolunteer && (
        <button
          onClick={resolveSOS}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          ✔ Mark SOS Resolved
        </button>
      )}
    </div>
  );
}
