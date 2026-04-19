import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import api from "../api";
import "leaflet/dist/leaflet.css";

/* ================= ICONS ================= */

// 🔴 Victim Icon
const victimIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 🟢 Volunteer Icon
const volunteerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* ================= BUCKET FUNCTION ================= */
const bucketPoints = (points, value, unit) => {
  const buckets = {};

  const unitToMs = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
  };

  const intervalMs = Math.max(1, value) * unitToMs[unit];

  points.forEach((p) => {
    if (!p.timeRaw) return;

    const time = new Date(p.timeRaw).getTime();
    const key = Math.floor(time / intervalMs);

    buckets[key] = p;
  });

  return Object.values(buckets);
};

export default function PoliceEvidenceMap() {
  const { sosId } = useParams();

  const [rawVictim, setRawVictim] = useState([]);
  const [rawVolunteers, setRawVolunteers] = useState({});

  // ✅ NEW interval system
  const [intervalValue, setIntervalValue] = useState(5);
  const [intervalUnit, setIntervalUnit] = useState("minutes");

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!sosId) return;

    api.get(`/tracking/${sosId}`).then((res) => {
      const logs = res.data;

      const victimPoints = [];
      const volunteerMap = {};

      logs.forEach((log) => {
        if (
          typeof log.lat !== "number" ||
          typeof log.lng !== "number"
        )
          return;

        const point = {
          lat: log.lat,
          lng: log.lng,
          time: new Date(log.createdAt).toLocaleTimeString(),
          timeRaw: log.createdAt,
        };

        if (log.role === "VICTIM") victimPoints.push(point);

        if (log.role === "VOLUNTEER") {
          const id = log.userId?._id || "unknown";
          const name = log.userId?.name || "Volunteer";

          if (!volunteerMap[id]) {
            volunteerMap[id] = { name, points: [] };
          }

          volunteerMap[id].points.push(point);
        }
      });

      setRawVictim(victimPoints);
      setRawVolunteers(volunteerMap);
    });
  }, [sosId]);

  /* ================= DERIVED ================= */
  const victim = useMemo(() => {
    return bucketPoints(rawVictim, intervalValue, intervalUnit);
  }, [rawVictim, intervalValue, intervalUnit]);

  const volunteers = useMemo(() => {
    const reduced = {};

    Object.entries(rawVolunteers).forEach(([id, vol]) => {
      reduced[id] = {
        name: vol.name,
        points: bucketPoints(vol.points, intervalValue, intervalUnit),
      };
    });

    return reduced;
  }, [rawVolunteers, intervalValue, intervalUnit]);

  const maxSteps = victim.length;

  /* ================= AUTOPLAY ================= */
  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= maxSteps - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [playing, maxSteps]);

  /* ================= VISIBLE ================= */
  const visibleVictim = victim.slice(0, step + 1);

  const visibleVolunteers = {};
  Object.entries(volunteers).forEach(([id, vol]) => {
    visibleVolunteers[id] = {
      name: vol.name,
      points: vol.points.slice(0, step + 1),
    };
  });

  const center =
    victim.length > 0
      ? [victim[0].lat, victim[0].lng]
      : [16.5, 80.6];

  const colors = ["green", "blue", "orange", "purple"];

  return (
    <div className="h-screen w-screen relative">
      {/* CONTROLS */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded shadow space-y-2">
        
        {/* INTERVAL INPUT */}
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            value={intervalValue}
            onChange={(e) => {
              setIntervalValue(Number(e.target.value));
              setStep(0);
              setPlaying(false);
            }}
            className="border px-2 py-1 rounded w-20"
          />

          <select
            value={intervalUnit}
            onChange={(e) => {
              setIntervalUnit(e.target.value);
              setStep(0);
              setPlaying(false);
            }}
            className="border px-2 py-1 rounded"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </select>
        </div>

        <div className="text-xs text-gray-600">
          Interval: {intervalValue} {intervalUnit}
        </div>

        {/* CONTROLS */}
        <div className="flex gap-2">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            className="px-3 py-1 bg-gray-700 text-white rounded"
          >
            ⬅
          </button>

          <button
            onClick={() =>
              setStep((s) => Math.min(s + 1, maxSteps - 1))
            }
            className="px-3 py-1 bg-gray-700 text-white rounded"
          >
            ➡
          </button>

          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>

        <div className="text-xs text-gray-600">
          Step: {step + 1} / {maxSteps}
        </div>
      </div>

      {/* MAP */}
      <MapContainer center={center} zoom={14} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* VICTIM */}
        {visibleVictim.length > 0 && (
          <>
            <Polyline
              positions={visibleVictim.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "red", weight: 5 }}
            />

            {visibleVictim.map((p, i) => (
              <CircleMarker
                key={i}
                center={[p.lat, p.lng]}
                radius={6}
                pathOptions={{ color: "red" }}
              >
                <Tooltip>
                  <b>Victim</b><br />
                  {p.time}
                </Tooltip>
              </CircleMarker>
            ))}

            <Marker
              position={[
                visibleVictim[visibleVictim.length - 1].lat,
                visibleVictim[visibleVictim.length - 1].lng,
              ]}
              icon={victimIcon}
              zIndexOffset={1000}
            >
              <Tooltip>
                <b>Victim</b><br />
                {visibleVictim[visibleVictim.length - 1].time}
              </Tooltip>
            </Marker>
          </>
        )}

        {/* VOLUNTEERS */}
        {Object.entries(visibleVolunteers).map(([id, vol], idx) => {
          const color = colors[idx % colors.length];

          return (
            <div key={id}>
              <Polyline
                positions={vol.points.map((p) => [p.lat, p.lng])}
                pathOptions={{ color, weight: 4 }}
              />

              {vol.points.map((p, i) => (
                <CircleMarker
                  key={i}
                  center={[p.lat, p.lng]}
                  radius={5}
                  pathOptions={{ color }}
                >
                  <Tooltip>
                    <b>{vol.name}</b><br />
                    {p.time}
                  </Tooltip>
                </CircleMarker>
              ))}

              {vol.points.length > 0 && (
                <Marker
                  position={[
                    vol.points[vol.points.length - 1].lat,
                    vol.points[vol.points.length - 1].lng,
                  ]}
                  icon={volunteerIcon}
                  zIndexOffset={1000}
                >
                  <Tooltip>
                    <b>{vol.name}</b><br />
                    {vol.points[vol.points.length - 1].time}
                  </Tooltip>
                </Marker>
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}