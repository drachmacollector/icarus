import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/News" className={`nav-link ${location.pathname === "/News" ? "active" : ""}`}>
          News
        </Link>
        <Link to="/Flare" className={`nav-link ${location.pathname === "/Flare" ? "active" : ""}`}>
          Solar Flares
        </Link>
        <Link to="/CmeTracker" className={`nav-link ${location.pathname === "/CmeTracker" ? "active" : ""}`}>
          Coronal Mass Ejections (CME)
        </Link>
        <Link to="/HeatMapDashboard" className={`nav-link ${location.pathname === "/HeatMapDashboard" ? "active" : ""}`}>
          Heat Map
        </Link>
        <Link to="/AuroraForecast" className={`nav-link ${location.pathname === "/risk" ? "active" : ""}`}>
          Aurora
        </Link>
        <Link to="/Timeline" className={`nav-link ${location.pathname === "/Timeline" ? "active" : ""}`}>
          Timeline
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