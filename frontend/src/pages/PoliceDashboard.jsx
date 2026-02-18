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
      .get(`/sos/pending/${city}`)
      .then(res => setSosList(res.data))
      .catch(err => console.error("Police SOS load error:", err));
  }, [city]);

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

      {/* -------- SOS LIST -------- */}
      {sosList.length === 0 && (
        <p className="text-gray-500">No SOS alerts for this city</p>
      )}

      {sosList.map(sos => (
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
                    : sos.status === "ACTIVE"
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {sos.status}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              👥 Accepted Volunteers: {sos.acceptedBy?.length || 0}
            </p>
          </div>

          {/* -------- ACTION BUTTONS -------- */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => navigate(`/police/map/${sos._id}`)}
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
    </div>
  );
}
