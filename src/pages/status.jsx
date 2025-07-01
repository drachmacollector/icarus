import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-datepicker/dist/react-datepicker.css";
import "./status.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

function toDMS(deg, isLat) {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  let direction = "";
  if (isLat) {
    direction = deg >= 0 ? "N" : "S";
  } else {
    direction = deg >= 0 ? "E" : "W";
  }
  return `${degrees}°${minutes}'${seconds}" ${direction}`;
}

export default function StatusPage({ flares }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const filteredFlares = selectedDate
    ? flares.filter(f => {
        const flareDate = new Date(f.peakTime).toDateString();
        return flareDate === selectedDate.toDateString();
      })
    : flares;

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
            {filteredFlares.map((flare, idx) => (
              <CircleMarker
                key={idx}
                center={[flare.lat, flare.lng]}
                radius={4}
                pathOptions={{ color: "yellow", fillColor: "yellow", fillOpacity: 1 }}
              >
                <Popup>
                  <strong>Class:</strong> {flare.classType} <br />
                  <strong>Peak:</strong> {flare.peakTime} <br />
                  <strong>Location:</strong> {flare.lat}, {flare.lng}
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

          <p style={{ marginTop: "10px" }}>
            Showing {filteredFlares.length} flare(s){" "}
            {selectedDate ? `on ${format(selectedDate, "yyyy-MM-dd")}` : "(all dates)"}
          </p>

          <div className="flare-grid">
            {filteredFlares.map((flare, idx) => (
              <div key={idx} className="flare-card">
                <h4 className="flare-class">
                  Class {flare.classType || "?"}
                  <span className={`severity ${flare.classType === "X" ? "major" : "minor"}`}>
                    {flare.classType === "X" ? "Major" : "Minor"}
                  </span>
                </h4>
                <p><strong>Start:</strong> {flare.startTime || "Unknown"}</p>
                <p><strong>Peak:</strong> {new Date(flare.peakTime).toUTCString()}</p>
                <p><strong>Latitude:</strong> {toDMS(flare.lat, true)}</p>
                <p><strong>Longitude:</strong> {toDMS(flare.lng, false)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
