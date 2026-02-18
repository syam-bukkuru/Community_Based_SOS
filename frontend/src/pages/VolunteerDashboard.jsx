// frontend/src/pages/VolunteerDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function VolunteerDashboard() {
  const [sosList, setSosList] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  /* ---------------- LOAD PENDING + ACTIVE SOS ---------------- */
  useEffect(() => {
    if (!user?.city) return;

    api
      .get(`/sos/pending/${user.city}`)
      .then(res => setSosList(res.data))
      .catch(err => console.error(err));
  }, [user?.city]);

  /* ---------------- ACCEPT SOS (NO GPS BLOCKING) ---------------- */
  const acceptSOS = async (sosId) => {
    try {
      await api.post(`/sos/accept/${sosId}`, { userId: user._id });

      // update UI locally (do NOT remove card)
      setSosList(prev =>
        prev.map(s =>
          s._id === sosId
            ? {
                ...s,
                acceptedBy: [...(s.acceptedBy || []), user._id],
                status: "ACTIVE",
              }
            : s
        )
      );

      // ✅ ALWAYS redirect immediately
      navigate(`/tracking/${sosId}`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to accept SOS");
    }
  };

  /* ---------------- RESOLVE SOS ---------------- */
  const resolveSOS = async (sosId) => {
    await api.post(`/sos/resolve/${sosId}`);
    alert("✔ SOS resolved");

    setSosList(prev => prev.filter(s => s._id !== sosId));
  };

  /* Utility: check if current user has accepted */
  const hasAccepted = (sos) => (sos.acceptedBy || []).includes(user._id);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Volunteer Dashboard</h2>

      {sosList.length === 0 && (
        <p className="text-gray-500">No active SOS alerts</p>
      )}

      {sosList.map(sos => (
        <div key={sos._id} className="border p-3 mb-3 rounded shadow">
          <p className="font-medium">🚨 SOS Alert</p>
          <p className="text-sm">
            Location: {sos.street}, {sos.city}
          </p>

          {sos.acceptedBy?.length > 0 && (
            <p className="text-xs mt-1 text-blue-500">
              Accepted by: {sos.acceptedBy.length} volunteers
            </p>
          )}

          <div className="flex gap-3 mt-2">
            {/* Accept Button */}
            {!hasAccepted(sos) && (
              <button
                onClick={() => acceptSOS(sos._id)}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Accept SOS
              </button>
            )}

            {/* After accept */}
            {hasAccepted(sos) && (
              <>
                <button
                  className="px-3 py-1 rounded bg-gray-400 text-white"
                  disabled
                >
                  Accepted
                </button>

                <button
                  onClick={() => resolveSOS(sos._id)}
                  className="px-3 py-1 rounded bg-green-600 text-white"
                >
                  Resolve
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
