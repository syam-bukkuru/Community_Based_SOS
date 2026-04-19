import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import LiveMap from "./LiveMap";

export default function PoliceLiveMap() {
  const { sosId } = useParams();
  const [victim, setVictim] = useState(null);

  useEffect(() => {
    if (!sosId) return;

    api.get(`/sos/${sosId}`).then((res) => {
      // ⚠️ adjust field based on your backend
      const v = res.data?.victimLocation;

      if (v?.lat && v?.lng) {
        setVictim({ lat: v.lat, lng: v.lng });
      }
    });
  }, [sosId]);

  if (!victim) {
    return <p className="p-4">Loading police live map...</p>;
  }

  return <LiveMap sosId={sosId} victim={victim} />;
}