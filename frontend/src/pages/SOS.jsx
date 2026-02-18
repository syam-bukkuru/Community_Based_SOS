// frontend/src/pages/SOS.jsx

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import api from "../api";
import socket from "../socket";

function LocationPicker({ setCoords }) {
  useMapEvents({
    click(e) {
      setCoords({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });
  return null;
}

export default function SOS() {
  const [mode, setMode] = useState("auto");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔒 keep interval reference across renders
  const victimIntervalRef = useRef(null);

  const getAutoLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Location permission denied")
    );
  };

  const sendSOS = async () => {
    try {
      if (!coords || victimIntervalRef.current) return;

      setLoading(true);

      // 1️⃣ Create SOS
      const res = await api.post("/sos/create", coords);
      const sosId = res.data.sos._id;

      alert("🚨 SOS Sent Successfully");

      // 2️⃣ Join SOS room
      socket.emit("join_sos", sosId);
      window.location.href = `/tracking/${sosId}/victim`;

      // 3️⃣ Victim live tracking (every 5 seconds)
      victimIntervalRef.current = setInterval(() => {
        socket.emit("location_update", {
          sosId,
          role: "VICTIM",
          name: "Victim",
          lat: coords.lat,
          lng: coords.lng,
        });
      }, 5000);

    } catch (err) {
      console.error(err);
      alert("Failed to send SOS");
    } finally {
      setLoading(false);
    }
  };

  /* 🧹 CLEANUP on unmount */
  useEffect(() => {
    return () => {
      if (victimIntervalRef.current) {
        clearInterval(victimIntervalRef.current);
        victimIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-screen">

      {/* 🗺️ Fullscreen Map */}
      <MapContainer
        center={[16.5, 80.6]}
        zoom={13}
        className="h-full w-full z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mode === "manual" && <LocationPicker setCoords={setCoords} />}
        {coords && <Marker position={[coords.lat, coords.lng]} />}
      </MapContainer>

      {/* 🎛️ Side Control Panel */}
      <div className="absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-xl p-6 space-y-6 z-10">

        <h2 className="text-xl font-bold text-red-600 text-center">
          🚨 Emergency SOS
        </h2>

        {/* Mode Selector */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Location Mode
          </label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-400"
          >
            <option value="auto">Auto Detect</option>
            <option value="manual">Select on Map</option>
          </select>
        </div>

        {/* Auto location */}
        {mode === "auto" && (
          <button
            onClick={getAutoLocation}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            📍 Get Current Location
          </button>
        )}

        {/* Location Preview */}
        {coords && (
          <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600">
            <p><b>Latitude:</b> {coords.lat.toFixed(5)}</p>
            <p><b>Longitude:</b> {coords.lng.toFixed(5)}</p>
          </div>
        )}

        {/* SOS Button */}
        <button
          onClick={sendSOS}
          disabled={!coords || loading}
          className="mt-auto w-full bg-red-600 text-white py-4 rounded-xl text-lg font-bold
                     hover:bg-red-700 transition shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "🚨 Sending SOS..." : "🚨 SEND SOS"}
        </button>

      </div>
    </div>
  );
}
