import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const dotStyle = (color) => ({
  display: 'inline-block',
  width: '12px',
  height: '12px',
  borderRadius: '6px',
  backgroundColor: color,
  marginRight: '0.5rem',
}); 

  return (
    <>
        <div className="legend" >
      <div><span style={dotStyle('red')}></span>X‑Class: Widespread Blackout</div>
      <div><span style={dotStyle('yellow')}></span>M‑Class: Localized Fades</div>
      <div><span style={dotStyle('green')}></span>No Severe Flare</div>
    </div>
    <nav className="navbar">
      <div className="navbar-links">

        <Link
          to="/HeatMapDashboard"
          className={`nav-link ${location.pathname === "/risk" ? "active" : ""}`}
        >
          🚨 HeatMap
        </Link>
        <Link
          to="/CmeTracker"
          className={`nav-link ${location.pathname === "/risk" ? "active" : ""}`}
        >
          🚨 CME
        </Link>
        <Link
          to="/AuroraForecast"
          className={`nav-link ${location.pathname === "/risk" ? "active" : ""}`}
        >
          🚨 Aurora
        </Link>

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
         <Link to="/home" className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}>Home(News))</Link>
        
        
      </div>
    </nav>
    </>
  );
}
