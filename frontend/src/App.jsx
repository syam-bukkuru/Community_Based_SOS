// frontend/src/App.jsx
// <Route path="/tracking/:sosId" element={<TrackingTable />} /> 


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
        <Route path="/live/:id" element={<LiveMap />} />
        <Route path="/tracking/:sosId" element={<TrackingMap />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/all-sos" element={<AllSOSAlerts />} />
        <Route path="/tracking/:sosId/victim" element={<VictimTrackingMap />} />
        <Route path="/police/map/:sosId" element={<PoliceLiveMap />} />
        <Route path="/police/evidence/:sosId" element={<PoliceTrackingTable />} />
        <Route path="/police/evidence" element={<PoliceEvidence />} />
        <Route path="/police/tracking/:sosId" element={<PoliceTrackingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
