// frontend/src/pages/PoliceDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function PoliceDashboard() {
  const [city, setCity] = useState("Gudivada");
  const [sosList, setSosList] = useState([]);
  const navigate = useNavigate();

  /* ---------------- LOAD SOS BY CITY ---------------- */
  useEffect(() => {
    if (!city) return;

    api
      .get(`/sos/all/${city}`) // ✅ make sure backend returns ALL
      .then(res => setSosList(res.data))
      .catch(err => console.error("Police SOS load error:", err));
  }, [city]);

  /* ---------------- SORT LOGIC ---------------- */
  const activeSOS = sosList.filter(
    sos => sos.status === "PENDING" || sos.status === "ACTIVE"
  );

  const solvedSOS = sosList.filter(
    sos => sos.status === "RESOLVED"
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🚓 Police Dashboard</h2>

      {/* -------- CITY SELECT -------- */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Select City
        </label>
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        >
          <option value="Gudivada">Gudivada</option>
          <option value="Gudlavalleru">Gudlavalleru</option>
        </select>
      </div>

      {/* -------- ACTIVE SOS -------- */}
      <h3 className="text-lg font-semibold mb-2 text-red-600">
        🚨 Active Cases
      </h3>

      {activeSOS.length === 0 && (
        <p className="text-gray-500 mb-4">No active SOS alerts</p>
      )}

      {activeSOS.map(sos => (
        <div
          key={sos._id}
          className="border rounded p-4 mb-4 shadow-sm"
        >
          <div className="mb-2">
            <p className="font-medium">
              📍 {sos.street}, {sos.city}
            </p>
            <p className="text-sm text-gray-600">
              🚦 Status:{" "}
              <span
                className={`font-semibold ${
                  sos.status === "PENDING"
                    ? "text-red-600"
                    : "text-orange-600"
                }`}
              >
                {sos.status}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              👥 Accepted Volunteers: {sos.acceptedBy?.length || 0}
            </p>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => navigate(`/live/${sos._id}`)}
              className="px-4 py-1 rounded bg-blue-600 text-white text-sm"
            >
              🔍 View Live Map
            </button>

            <button
              onClick={() => navigate(`/police/evidence/${sos._id}`)}
              className="px-4 py-1 rounded bg-gray-800 text-white text-sm"
            >
              🧾 Evidence
            </button>
          </div>
        </div>
      ))}

      {/* -------- SOLVED SOS -------- */}
      <h3 className="text-lg font-semibold mt-8 mb-2 text-green-600">
        ✅ Solved Cases
      </h3>

      {solvedSOS.length === 0 && (
        <p className="text-gray-500">No solved cases</p>
      )}

      {solvedSOS.map(sos => (
        <div
          key={sos._id}
          className="border rounded p-4 mb-4 shadow-sm bg-green-50"
        >
          <div className="mb-2">
            <p className="font-medium">
              📍 {sos.street}, {sos.city}
            </p>
            <p className="text-sm text-gray-600">
              🚦 Status:{" "}
              <span className="font-semibold text-green-600">
                {sos.status}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              👥 Volunteers Helped: {sos.acceptedBy?.length || 0}
            </p>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => navigate(`/police-evidence/${sos._id}`)}
              className="px-3 py-1 rounded bg-gray-700 text-white"
            >
              🔍 View Evidence Map
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}