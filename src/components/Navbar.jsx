import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link
          to="/risk"
          className={`nav-link ${location.pathname === "/risk" ? "active" : ""}`}
        >
          🚨 Risk Dashboard
        </Link>

        <Link
          to="/status"
          className={`nav-link ${location.pathname === "/status" ? "active" : ""}`}
        >
          🗺️ Status Map
        </Link>
      </div>
    </nav>
  );
}
