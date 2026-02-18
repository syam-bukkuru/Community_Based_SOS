// frontend/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const submit = async () => {
    await api.post("/auth/register", form);
    navigate("/login"); // ✅ redirect after register
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        <p className="text-sm text-center text-gray-500">
          Register to access emergency services 🚨
        </p>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          className="w-full px-4 py-3 border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-4 py-3 border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full px-4 py-3 border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />

        {/* City */}
        <select
          className="w-full px-4 py-3 border rounded-lg bg-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={e => setForm({ ...form, city: e.target.value })}
        >
          <option value="">Select City</option>
          <option>Gudivada</option>
          <option>Gudlavalleru</option>
        </select>

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        {/* Register Button */}
        <button
          onClick={submit}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold
                     hover:bg-indigo-700 transition duration-300 shadow-md"
        >
          Register
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}
