import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function PoliceTrackingPage() {
  const { sosId } = useParams();

  const [sos, setSos] = useState(null);
  const [victimLogs, setVictimLogs] = useState([]);
  const [volunteerLogs, setVolunteerLogs] = useState({});

  /* ---------------- LOAD SOS INFO ---------------- */
  useEffect(() => {
    api.get(`/sos/details/${sosId}`)
      .then(res => setSos(res.data))
      .catch(() => {});
  }, [sosId]);

  /* ---------------- LOAD TRACKING ---------------- */
  useEffect(() => {
    api.get(`/tracking/${sosId}`).then(res => {
      const logs = res.data;

      const victims = logs.filter(l => l.role === "VICTIM");

      const volunteers = {};
      logs
        .filter(l => l.role === "VOLUNTEER")
        .forEach(l => {
          const name = l.userId?.name || "Volunteer";
          if (!volunteers[name]) volunteers[name] = [];
          volunteers[name].push(l);
        });

      setVictimLogs(victims);
      setVolunteerLogs(volunteers);
    });
  }, [sosId]);

  if (!sos) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">
          🚨 SOS ID: {sosId}
        </h1>
        <p className="text-gray-600">
          📍 {sos.street}, {sos.city}
        </p>
      </div>

      {/* VICTIM TABLE */}
      <div>
        <h2 className="font-semibold mb-2">Victim Tracking</h2>
        <table className="border w-full text-sm">
          <thead>
            <tr>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {victimLogs.map((l, i) => (
              <tr key={i}>
                <td>{l.lat}</td>
                <td>{l.lng}</td>
                <td>{new Date(l.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VOLUNTEER TABLES */}
      {Object.keys(volunteerLogs).map(name => (
        <div key={name}>
          <h2 className="font-semibold mb-2">
            Volunteer: {name}
          </h2>

          <table className="border w-full text-sm">
            <thead>
              <tr>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {volunteerLogs[name].map((l, i) => (
                <tr key={i}>
                  <td>{l.lat}</td>
                  <td>{l.lng}</td>
                  <td>{new Date(l.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

    </div>
  );
}
