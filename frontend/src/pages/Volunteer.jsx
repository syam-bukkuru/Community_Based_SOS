// client/src/pages/Volunteer.jsx
import { useState } from "react";
import api from "../api";

export default function Volunteer() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [eligibility, setEligibility] = useState("");

  const isAlreadyVolunteer = user?.isVolunteer;

  const submit = async () => {
    await api.post(
      "/volunteer/opt-in",
      { eligibility },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    alert("You are now a volunteer");

    // optional: update localStorage to reflect volunteer status immediately
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, isVolunteer: true })
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">

        <h2 className="text-2xl font-bold text-center text-gray-800">
          {isAlreadyVolunteer ? "Volunteer Guidelines" : "Become a Volunteer"}
        </h2>

        <p className="text-sm text-center text-gray-500">
          Help your community during emergencies 🚨
        </p>

        {/* ---------------- GUIDELINES ---------------- */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
          <p className="font-semibold text-indigo-700">
            Key Responsibilities of a Volunteer
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Reach the victim location safely and calmly</li>
            <li>Share live location only after accepting an SOS</li>
            <li>Provide basic first aid if trained</li>
            <li>Do NOT put yourself in danger</li>
            <li>Coordinate with police or emergency services</li>
            <li>Stay with the victim until help arrives</li>
            <li>Respect victim privacy and dignity</li>
          </ul>
        </div>

        {/* ---------------- ALREADY A VOLUNTEER ---------------- */}
        {isAlreadyVolunteer && (
          <div className="text-center text-green-600 font-semibold">
            ✅ You are already registered as a volunteer
          </div>
        )}

        {/* ---------------- OPT-IN FORM (ONLY IF NOT VOLUNTEER) ---------------- */}
        {!isAlreadyVolunteer && (
          <>
            {/* Eligibility */}
            <select
              className="w-full px-4 py-3 border rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={e => setEligibility(e.target.value)}
              value={eligibility}
            >
              <option value="">Select Eligibility</option>
              <option>Student</option>
              <option>NCC</option>
              <option>NSS</option>
              <option>Police Aspirant</option>
              <option>Other</option>
            </select>

            {/* Submit Button */}
            <button
              onClick={submit}
              disabled={!eligibility}
              className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 shadow-md
                ${
                  eligibility
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              Become Volunteer
            </button>
          </>
        )}

        {/* Footer note */}
        <p className="text-xs text-center text-gray-400">
          Volunteers are notified only during emergencies in their city
        </p>

      </div>
    </div>
  );
}
