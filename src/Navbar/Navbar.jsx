import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-links">
<<<<<<< HEAD
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
          Home
        </Link>
=======
  <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
    Home
  </Link>
  <Link to="/News" className={`nav-link ${location.pathname === "/News" ? "active" : ""}`}>
    News
  </Link>
  <Link to="/Flare" className={`nav-link ${location.pathname === "/Flare" ? "active" : ""}`}>
    Solar Flares
  </Link>
  <Link to="/CmeTracker" className={`nav-link ${location.pathname === "/CmeTracker" ? "active" : ""}`}>
    Coronal Mass Ejections (CME)
  </Link>
  <Link to="/Status" className={`nav-link ${location.pathname === "/Status" ? "active" : ""}`}>
    Status
  </Link>
  <Link to="/HeatMapDashboard" className={`nav-link ${location.pathname === "/HeatMapDashboard" ? "active" : ""}`}>
    Heat Map
  </Link>
  <Link to="/AuroraForecast" className={`nav-link ${location.pathname === "/risk" ? "active" : ""}`}>
    Auroras
  </Link>
  <Link to="/Timeline" className={`nav-link ${location.pathname === "/Timeline" ? "active" : ""}`}>
    Timeline
  </Link>
</div>
>>>>>>> 0032b9db6ab8114a97d3dbb887cba7a66bc026b2

        <Link to="/News" className={`nav-link ${location.pathname === "/News" ? "active" : ""}`}>
          News
        </Link>

        {/* Dropdown Start */}
        <div
          className="dropdown"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span className="nav-link dropdown-toggle">
            Solar Activity ▾
          </span>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/Flare" className="dropdown-item">Solar Flares</Link>
              <Link to="/CmeTracker" className="dropdown-item">Coronal Mass Ejections</Link>
              <Link to="/HeatMapDashboard" className="dropdown-item">Heat Map</Link>
              <Link to="/AuroraForecast" className="dropdown-item">Auroras</Link>
            </div>
          )}
        </div>
        {/* Dropdown End */}

        <Link to="/Status" className={`nav-link ${location.pathname === "/Status" ? "active" : ""}`}>
          Status
        </Link>

        <Link to="/Timeline" className={`nav-link ${location.pathname === "/Timeline" ? "active" : ""}`}>
          Timeline
        </Link>

        <Link to="/AboutPage" className={`nav-link ${location.pathname === "/AboutPage" ? "active" : ""}`}>
          About
        </Link>
      </div>
    </nav>
  );
}
