// frontend/src/pages/AllSOSAlerts.jsx
import { useEffect, useState } from "react";
import api from "../api";

export default function AllSOSAlerts() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/sos/all").then(res => setList(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        All SOS Alerts (Debug)
      </h2>

      {list.map(sos => (
        <div key={sos._id} className="border p-3 mb-2">
          <p><b>City:</b> {sos.city}</p>
          <p><b>Street:</b> {sos.street}</p>
          <p><b>Status:</b> {sos.status}</p>
        </div>
      ))}
    </div>
  );
}
