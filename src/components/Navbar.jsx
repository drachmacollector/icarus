import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css"; // ← Import the CSS file

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
      </div>
    </nav>
  );
}
