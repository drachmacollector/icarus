// src/components/RiskDashboard.jsx
import React from "react";
import { AlertTriangle, Globe, Clock } from "lucide-react";
import "./RiskDashboard.css";

function toDMS(deg, isLat) {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  const direction = deg >= 0
    ? isLat ? "N" : "E"
    : isLat ? "S" : "W";

  return `${degrees}°${minutes}'${seconds}"${direction}`;
}


export default function RiskDashboard({ flares }) {
  const getRiskLevel = () => {
    const hasX = flares.some(f => f.class === "X");
    const hasM = flares.some(f => f.class === "M");
    if (hasX) return { level: "HIGH", className: "risk-badge high", label: "Severe HF disruptions" };
    if (hasM) return { level: "MODERATE", className: "risk-badge moderate", label: "Possible HF radio issues" };
    return { level: "LOW", className: "risk-badge low", label: "Normal HF radio conditions" };
  };

  const { level, className, label } = getRiskLevel();
  const activeCount = flares.length;
  const updatedAt = new Date().toISOString().split("T")[1].split(".")[0]; // HH:MM:SS

  return (
    <div className="risk-container">
      <div className="risk-header">
        <Globe className="icon" />
        <h2>HF Radio Status</h2>
      </div>

      <div className="risk-card">
        <p className="subheading">Current Risk Level</p>
        <div className={className}>
          <AlertTriangle className="icon-sm" />
          <span>{level}</span>
        </div>
        <p className="risk-label">{label}</p>
      </div>

      <div className="blackouts">
        <div className="blackout-title">
          <Globe className="icon-sm" />
          <span>Active Blackouts ({activeCount})</span>
        </div>
        <p className="blackout-info">
          {activeCount === 0 ? "No active blackouts" : `${activeCount} flare events detected`}
        </p>
      </div>

      <div className="last-updated">
        <Clock className="icon-sm" />
        <span>Last updated: {updatedAt} UTC</span>
      </div>


      {/* FLARE DETAILS */}

      {activeCount > 0 && (
        <div className="flare-details">
          <h3>Active Flare Events</h3>
          <ul className="flare-list">
            {flares.map((flare, idx) => (
              <li key={idx} className="flare-item">
                <p><strong>Class:</strong> {flare.classType || "Unknown"}</p>
                <p><strong>Latitude:</strong> {toDMS(flare.lat, true)}</p>
                <p><strong>Longitude:</strong> {toDMS(flare.lng, false)}</p>
                <p><strong>Peak Time:</strong> {new Date(flare.peakTime).toUTCString()}</p>              
            </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
