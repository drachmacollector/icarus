// src/components/RiskDashboard.jsx
import React from "react";
import { AlertTriangle, Globe, Clock, Activity, CloudLightning, AirVent } from "lucide-react";
import "./RiskDashboard.css";

export default function RiskDashboard({ flares, forecast }) {
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

      {/* Forecast Section */}
      <div className="forecast">
        <div className="forecast-title">
          <CloudLightning className="icon-sm" />
          <span>Forecast</span>
        </div>
        <p className="forecast-info">
          {forecast?.summary || "Stable conditions expected for next 6–12 hours."}
        </p>
      </div>

      {/* Impact Summary */}
      <div className="impact-summary">
        <div className="impact-title">
          <Activity className="icon-sm" />
          <span>Impact Summary</span>
        </div>
        <ul className="impact-list">
          <li>HF Communications: {level === "LOW" ? "Nominal" : "Degraded"}</li>
          <li>Navigation (GPS): {level === "HIGH" ? "Possible signal loss" : "Stable"}</li>
          <li>Polar Routes: {level !== "LOW" ? "Risk of signal fade" : "No disruption"}</li>
        </ul>
      </div>

      {/* Aviation Sector Impact */}
      <div className="aviation-impact">
        <div className="aviation-title">
          <AirVent className="icon-sm" />
          <span>Aviation Sectors Affected</span>
        </div>
        <p className="aviation-info">
          {level === "LOW" && "No aviation impact expected."}
          {level === "MODERATE" && "Equatorial and polar HF routes may experience partial fadeouts."}
          {level === "HIGH" && "Widespread signal loss on transpolar and high-frequency routes likely."}
        </p>
      </div>

      {/* Last Updated */}
      <div className="last-updated">
        <Clock className="icon-sm" />
        <span>Last updated: {updatedAt} UTC</span>
      </div>

      {activeCount > 0 && (
        <div className="flare-list">
          {/* Optional flare list UI */}
        </div>
      )}
    </div>
  );
}
