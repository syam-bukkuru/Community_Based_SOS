// frontend/src/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      // ✅ store auth
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user?.role;

      // ✅ ROLE BASED REDIRECT
      if (role === "POLICE") {
        navigate("/police");
      } else {
        navigate("/volunteer-dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>

        <p className="text-sm text-center text-gray-500">
          Login to continue 🚀
        </p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-4 py-3 border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          onClick={submit}
          disabled={!email || !password}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold
                     hover:bg-indigo-700 transition duration-300 shadow-md
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Login
        </button>

      </div>
    </div>
  );
}