import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function VolunteerDashboard() {
  const [sosList, setSosList] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  /* ---------------- LOAD SOS ---------------- */
  const loadSOS = async () => {
  if (!user?.city) return;

  try {
    const res = await api.get(`/sos/pending/${user.city}`);
    setSosList(res.data);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
  if (!user?.city) return;

  const fetchSOS = async () => {
    try {
      const res = await api.get(`/sos/pending/${user.city}`);
      setSosList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchSOS();
}, [user?.city]);

  /* ---------------- ACCEPT SOS ---------------- */
  const acceptSOS = async (sosId) => {
    try {
      await api.post(`/sos/accept/${sosId}`, { userId: user._id });

      // 🔥 REFETCH instead of local hack (fixes multi-user issues)
      await loadSOS();

      navigate(`/tracking/${sosId}`);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to accept SOS");
    }
  };

  /* ---------------- RESOLVE SOS ---------------- */
  const resolveSOS = async (sosId) => {
    try {
      await api.post(`/sos/resolve/${sosId}`);
      alert("✔ SOS resolved");

      await loadSOS();
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- CHECK ACCEPTED ---------------- */
  const hasAccepted = (sos) => {
    if (!sos.acceptedBy) return false;

    return sos.acceptedBy.some(
      (id) => id.toString() === user._id
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Volunteer Dashboard
      </h2>

      {sosList.length === 0 && (
        <p className="text-gray-500">No active SOS alerts</p>
      )}

      {sosList.map((sos) => (
        <div key={sos._id} className="border p-3 mb-3 rounded shadow">
          <p className="font-medium">🚨 SOS Alert</p>
          <p className="text-sm">
            Location: {sos.street}, {sos.city}
          </p>

          {/* Volunteer count */}
          {sos.acceptedBy?.length > 0 && (
            <p className="text-xs mt-1 text-blue-500">
              Accepted by: {sos.acceptedBy.length} volunteers
            </p>
          )}

          <div className="flex gap-3 mt-2">

            {/* ACCEPT BUTTON */}
            {!hasAccepted(sos) && (
              <button
                onClick={() => acceptSOS(sos._id)}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Accept SOS
              </button>
            )}

            {/* AFTER ACCEPT */}
            {hasAccepted(sos) && (
              <>
                <button
                  onClick={() => navigate(`/tracking/${sos._id}`)}
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                >
                  Revisit
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