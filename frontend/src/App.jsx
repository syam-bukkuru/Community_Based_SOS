// frontend/src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import SOS from "./pages/SOS";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Volunteer from "./pages/Volunteer";
import LiveMap from "./pages/LiveMap";
import TrackingMap from "./pages/TrackingMap";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AllSOSAlerts from "./pages/AllSOSAlerts";
import VictimTrackingMap from "./pages/VictimTrackingMap";
import PoliceLiveMap from "./pages/PoliceLiveMap";
import PoliceTrackingTable from "./pages/PoliceTrackingTable";
import PoliceEvidence from "./pages/PoliceEvidence";
import PoliceTrackingPage from "./pages/PoliceTrackingPage";
import PoliceEvidenceMap from "./pages/PoliceEvidenceMap";
import PoliceDashboard from "./pages/PoliceDashboard";
import PoliceEvidenceDemo from "./pages/PoliceEvidenceDemo";


import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<SOS />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/police" element={<PoliceDashboard />} />
        <Route path="/live/:id" element={<LiveMap />} />
        <Route path="/tracking/:sosId" element={<TrackingMap />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/all-sos" element={<AllSOSAlerts />} />
        <Route path="/tracking/:sosId/victim" element={<VictimTrackingMap />} />
        <Route path="/police/evidence/:sosId" element={<PoliceTrackingTable />} />
        <Route path="/police/evidence" element={<PoliceEvidence />} />
        <Route path="/police/tracking/:sosId" element={<PoliceTrackingPage />} />
        <Route path="/police-evidence/:sosId" element={<PoliceEvidenceMap />} />
        <Route path="/police-evidence-demo" element={<PoliceEvidenceDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
