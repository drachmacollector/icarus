import React from "react";
import { AlertTriangle, Globe, Clock } from "lucide-react";
import "./RiskDashboard.css";

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
    </div>
  );
}
