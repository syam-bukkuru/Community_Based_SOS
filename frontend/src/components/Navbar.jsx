// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white">
      <h1 className="font-bold text-lg">SOS Prototype</h1>

      {/* Welcome text */}
      {token && user && (
        <div className="text-sm text-gray-300">
          Welcome {user.name}, {user.city}
        </div>
      )}

      <div className="flex gap-4">
        <Link to="/">SOS</Link>

        {!token && <Link to="/register">Register</Link>}
        {!token && <Link to="/login">Login</Link>}

        {token && <Link to="/volunteer-dashboard">Dashboard</Link>}
        {token && <Link to="/volunteer">Become Volunteer</Link>}

        {token && (
          <button onClick={logout} className="text-red-400">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
