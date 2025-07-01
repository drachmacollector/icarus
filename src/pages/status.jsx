import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-datepicker/dist/react-datepicker.css";
import "./status.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

function toDMS(deg, isLat) {
  if (deg === null || deg === undefined) return "Unknown";
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  let direction = isLat ? (deg >= 0 ? "N" : "S") : (deg >= 0 ? "E" : "W");
  return `${degrees}°${minutes}'${seconds}" ${direction}`;
}

export default function StatusPage({ flares }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showUnmapped, setShowUnmapped] = useState(false);

  const filteredFlares = selectedDate
    ? flares.filter(f => {
        const flareDate = new Date(f.peakTime).toDateString();
        return flareDate === selectedDate.toDateString();
      })
    : flares;

  const mappedFlares = filteredFlares.filter(f => f.lat !== null && f.lng !== null);
  const unmappedFlares = filteredFlares.filter(f => f.lat === null || f.lng === null);

  const uniqueDates = [...new Set(flares.map(f => new Date(f.peakTime).toDateString()))]
    .sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="status-container">
      <h2 className="status-title">Solar Flare Status Map</h2>
      <div className="map-layout">
        <div className="map-wrapper">
          <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} className="flare-map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {mappedFlares.map((flare, idx) => (
              <CircleMarker
                key={idx}
                center={[flare.lat, flare.lng]}
                radius={4}
                pathOptions={{ color: "yellow", fillColor: "yellow", fillOpacity: 1 }}
              >
                <Popup>
                  <strong>Class:</strong> {flare.classType || "?"} <br />
                  <strong>Peak:</strong> {flare.peakTime} <br />
                  <strong>Lat/Lng:</strong> {flare.lat}, {flare.lng}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="info-panel">
          <p>Select a date to view solar flares from that day:</p>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Choose a date"
            className="datepicker"
          />

          <div className="flare-date-list">
            <h4>Flare History</h4>
            <ul>
              {uniqueDates.map((dateStr, idx) => (
                <li key={idx}>
                  <button
                    className={`flare-date-btn ${selectedDate?.toDateString() === dateStr ? "selected" : ""}`}
                    onClick={() => setSelectedDate(new Date(dateStr))}
                  >
                    {dateStr}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <label style={{ marginTop: "10px", display: "block" }}>
            <input
              type="checkbox"
              checked={showUnmapped}
              onChange={() => setShowUnmapped(!showUnmapped)}
              style={{ marginRight: "5px" }}
            />
            Show flares with no location data ({unmappedFlares.length})
          </label>

          <p style={{ marginTop: "10px" }}>
            Showing {mappedFlares.length + (showUnmapped ? unmappedFlares.length : 0)} flare(s){" "}
            {selectedDate ? `on ${format(selectedDate, "yyyy-MM-dd")}` : "(all dates)"}
          </p>

          <div className="flare-grid">
            {[...mappedFlares, ...(showUnmapped ? unmappedFlares : [])].map((flare, idx) => (
              <div key={idx} className="flare-card">
                <h4 className="flare-class">
                  Class {flare.classType || "?"}
                  <span className={`severity ${flare.classType === "X" ? "major" : "minor"}`}>
                    {flare.classType === "X" ? "Major" : "Minor"}
                  </span>
                </h4>
                <p><strong>Peak:</strong> {flare.peakTime ? new Date(flare.peakTime).toUTCString() : "Unknown"}</p>
                <p><strong>End:</strong> {flare.endTime ? new Date(flare.endTime).toUTCString() : "Unknown"}</p>
                <p><strong>Location (Heliographic):</strong> {flare.sourceLocation || "NA"}</p>
                <p><strong>Latitude:</strong> {flare.lat !== null ? toDMS(flare.lat, true) : "Unknown"}</p>
                <p><strong>Longitude:</strong> {flare.lng !== null ? toDMS(flare.lng, false) : "Unknown"}</p>
                <p><strong>Raw Coordinates:</strong> {flare.lat ?? "?"}, {flare.lng ?? "?"}</p>
                <p><strong>Instruments:</strong> {flare.instruments?.map(i => i.displayName).join(", ") || "NA"}</p>
                <p><strong>Linked Events:</strong> {flare.linkedEvents?.map(e => e.activityID).join(", ") || "None"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
