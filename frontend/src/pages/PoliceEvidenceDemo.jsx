import { useState, useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

/* ================= DATA ================= */
const dummyTrackingGudivada = [
  {
    role: "VICTIM",
    name: "Victim",
    points: [
      { lat: 16.4355, lng: 80.9956, time: "10:00:00" },
      { lat: 16.4357, lng: 80.9957, time: "10:01:00" },
      { lat: 16.4359, lng: 80.9959, time: "10:02:00" },
      { lat: 16.4361, lng: 80.9960, time: "10:03:00" },
      { lat: 16.4363, lng: 80.9962, time: "10:04:00" },
      { lat: 16.4365, lng: 80.9963, time: "10:05:00" },
    ],
  },
  {
    role: "VOLUNTEER",
    name: "Volunteer A",
    points: [
      { lat: 16.4340, lng: 80.9940, time: "10:01:00" },
      { lat: 16.4345, lng: 80.9945, time: "10:02:00" },
      { lat: 16.4350, lng: 80.9950, time: "10:03:00" },
      { lat: 16.4355, lng: 80.9956, time: "10:04:00" },
      { lat: 16.4360, lng: 80.9960, time: "10:05:00" },
      { lat: 16.4365, lng: 80.9963, time: "10:06:00" },
    ],
  },
  {
    role: "VOLUNTEER",
    name: "Volunteer B",
    points: [
      { lat: 16.4380, lng: 80.9980, time: "10:01:30" },
      { lat: 16.4377, lng: 80.9975, time: "10:02:30" },
      { lat: 16.4373, lng: 80.9970, time: "10:03:30" },
      { lat: 16.4369, lng: 80.9966, time: "10:04:30" },
      { lat: 16.4366, lng: 80.9964, time: "10:05:30" },
    ],
  },
];

/* ================= COLOR ================= */
const getColor = (role, index) => {
  if (role === "VICTIM") return "red";
  const colors = ["green", "blue", "orange", "purple"];
  return colors[index % colors.length];
};

/* ================= BUCKET ================= */
const bucketPoints = (points, value, unit) => {
  const buckets = {};

  const unitToMs = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
  };

  const intervalMs = Math.max(1, value) * unitToMs[unit];

  points.forEach((p) => {
    const [h, m, s] = p.time.split(":").map(Number);
    const totalMs = (h * 3600 + m * 60 + s) * 1000;

    const key = Math.floor(totalMs / intervalMs);
    buckets[key] = p;
  });

  return Object.values(buckets);
};

export default function PoliceEvidenceMap() {
  const [intervalValue, setIntervalValue] = useState(5);
  const [intervalUnit, setIntervalUnit] = useState("minutes");

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  /* ================= DERIVED ================= */
  const data = useMemo(() => {
    return dummyTrackingGudivada.map((p) => ({
      ...p,
      points: bucketPoints(p.points, intervalValue, intervalUnit),
    }));
  }, [intervalValue, intervalUnit]);

  const maxSteps = Math.max(...data.map((p) => p.points.length));

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

  const center = [16.4360, 80.9960];

  return (
    <div className="h-screen w-screen relative">
      {/* CONTROLS */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded shadow space-y-2">
        
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

        <div className="text-xs">
          Interval: {intervalValue} {intervalUnit}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStep((s) => Math.max(s - 1, 0))}>⬅</button>
          <button onClick={() => setStep((s) => Math.min(s + 1, maxSteps - 1))}>➡</button>
          <button onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
        </div>

        <div className="text-xs">
          Step {step + 1} / {maxSteps}
        </div>
      </div>

      {/* MAP */}
      <MapContainer center={center} zoom={15} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {data.map((person, idx) => {
          const currentPoint = person.points[step];
          const visible = person.points.slice(0, step + 1);

          return (
            <div key={idx}>
              {/* PATH */}
              <Polyline
                positions={visible.map((p) => [p.lat, p.lng])}
                pathOptions={{
                  color: getColor(person.role, idx),
                  weight: 4,
                }}
              />

              {/* HISTORY DOTS */}
              {visible.map((p, i) => (
                <CircleMarker
                  key={i}
                  center={[p.lat, p.lng]}
                  radius={5}
                  pathOptions={{
                    color: getColor(person.role, idx),
                  }}
                >
                  <Tooltip>
                    <b>{person.name}</b><br />
                    {p.time}
                  </Tooltip>
                </CircleMarker>
              ))}

              {/* MOVING MARKER */}
              {currentPoint && (
                <Marker
                  position={[currentPoint.lat, currentPoint.lng]}
                  icon={
                    person.role === "VICTIM"
                      ? victimIcon
                      : volunteerIcon
                  }
                >
                  <Tooltip>
                    <b>{person.name}</b><br />
                    {currentPoint.time}
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