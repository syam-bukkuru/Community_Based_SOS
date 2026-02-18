import { useState } from "react";

export default function PoliceEvidence() {
  const [tab, setTab] = useState("images");

  /* 🔒 DEMO DATA (Hardcoded) */
  const images = [
    {
      id: 1,
      url: "https://res.cloudinary.com/dotzaqq1c/image/upload/v1767701990/IMG_20260106_173426_qjvvxe.jpg",
      time: "12:45 PM",
    },
    {
      id: 2,
      url: "https://res.cloudinary.com/dotzaqq1c/image/upload/v1767702128/IMG_20260106_173451_ugoxry.jpg",
      time: "12:47 PM",
    },
  ];

  const audios = [
    {
      id: 1,
      url: "S:/final_year_project/frontend/src/assets/New recording 2.m4a",
      time: "12:46 PM",
      duration: "00:32",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        🚓 Police Evidence Dashboard
      </h2>

      {/* 🔀 Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("images")}
          className={`px-4 py-2 rounded ${
            tab === "images" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          📸 Images
        </button>

        <button
          onClick={() => setTab("audio")}
          className={`px-4 py-2 rounded ${
            tab === "audio" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          🎙 Audio
        </button>
      </div>

      {/* 📸 IMAGES TAB */}
      {tab === "images" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map(img => (
            <div
              key={img.id}
              className="border rounded shadow hover:shadow-lg"
            >
              <img
                src={img.url}
                alt="Evidence"
                className="w-full h-48 object-cover rounded-t"
              />
              <div className="p-2 text-sm text-gray-600">
                ⏱ Captured at: {img.time}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎙 AUDIO TAB */}
      {tab === "audio" && (
        <div className="space-y-4">
          {audios.map(a => (
            <div
              key={a.id}
              className="border rounded p-4 shadow flex flex-col gap-2"
            >
              <p className="text-sm text-gray-600">
                ⏱ Recorded at: {a.time} | ⌛ {a.duration}
              </p>

              <audio controls className="w-full">
                <source src={a.url} type="audio/mpeg" />
                Your browser does not support audio playback.
              </audio>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
