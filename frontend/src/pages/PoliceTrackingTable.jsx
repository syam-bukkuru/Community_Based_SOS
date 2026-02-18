import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function PoliceTrackingTable() {
  const { sosId } = useParams();
  const [victimLogs, setVictimLogs] = useState([]);
  const [volunteerLogs, setVolunteerLogs] = useState([]);

  useEffect(() => {
    if (!sosId) return;

    api.get(`/tracking/${sosId}`).then(res => {
      const victim = [];
      const volunteers = [];

      res.data.forEach(log => {
        const row = {
          person: log.role === "VICTIM" ? "Victim" : log.userId || "Volunteer",
          lat: log.lat,
          lng: log.lng,
          time: new Date(log.createdAt).toLocaleTimeString(),
        };

        if (log.role === "VICTIM") victim.push(row);
        if (log.role === "VOLUNTEER") volunteers.push(row);
      });

      setVictimLogs(victim);
      setVolunteerLogs(volunteers);
    });
  }, [sosId]);

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-bold">📋 SOS Tracking Evidence</h2>

      {/* 🔴 Victim Table */}
      <div>
        <h3 className="font-semibold mb-2 text-red-600">Victim Movement</h3>
        <table className="border w-full text-sm">
          <thead>
            <tr>
              <th className="border px-2">Latitude</th>
              <th className="border px-2">Longitude</th>
              <th className="border px-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {victimLogs.map((r, i) => (
              <tr key={i}>
                <td className="border px-2">{r.lat}</td>
                <td className="border px-2">{r.lng}</td>
                <td className="border px-2">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🟢 Volunteer Table */}
      <div>
        <h3 className="font-semibold mb-2 text-green-600">
          Volunteers Movement
        </h3>
        <table className="border w-full text-sm">
          <thead>
            <tr>
              <th className="border px-2">Volunteer</th>
              <th className="border px-2">Latitude</th>
              <th className="border px-2">Longitude</th>
              <th className="border px-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {volunteerLogs.map((r, i) => (
              <tr key={i}>
                <td className="border px-2">{r.person}</td>
                <td className="border px-2">{r.lat}</td>
                <td className="border px-2">{r.lng}</td>
                <td className="border px-2">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
