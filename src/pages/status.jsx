import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-datepicker/dist/react-datepicker.css";
import "./status.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import useFlareData from "../hooks/useFlareData";

function toDMS(deg, isLat) {
  if (deg === null || deg === undefined) return "Unknown";
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

export default function StatusPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { flares, loading, error } = useFlareData({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined
  });

  const filteredFlares = useMemo(() => {
    if (!selectedDate) return flares;
    return flares.filter(f => new Date(f.peakTime).toDateString() === selectedDate.toDateString());
  }, [flares, selectedDate]);

  const flaresWithCoords = filteredFlares.filter(f => f.lat !== null && f.lng !== null);
  const flaresWithoutCoords = filteredFlares.filter(f => f.lat === null || f.lng === null);

  const uniqueDates = useMemo(() => {
    const dateSet = new Set(flares.map(f => new Date(f.peakTime).toDateString()));
    return [...dateSet].sort((a, b) => new Date(b) - new Date(a));
  }, [flares]);

  const resetDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedDate(null);
  };

  return (
    <div className="status-container">
      <h2 className="status-title">Solar Flare Status Map</h2>

      <div className="date-range-picker">
        <label>Start Date:</label>
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
          minDate={new Date("2010-01-01")}
          placeholderText="Start Date"
        />
        <label>End Date:</label>
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
          minDate={startDate || new Date("2010-01-01")}
          placeholderText="End Date"
        />
        <button className="reset-btn" onClick={resetDateRange}>
          Reset to Last 30 Days
        </button>
      </div>

      {loading && <p>Loading flare data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="map-layout">
        <div className="map-wrapper">
          <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} className="flare-map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {flaresWithCoords.map((flare, idx) => (
              <CircleMarker
                key={idx}
                center={[flare.lat, flare.lng]}
                radius={4}
                pathOptions={{ color: "yellow", fillColor: "yellow", fillOpacity: 1 }}
              >
                <Popup>
                  <strong>Class:</strong> {flare.classType || "?"} <br />
                  <strong>Peak:</strong> {new Date(flare.peakTime).toUTCString()} <br />
                  <strong>Location:</strong> {toDMS(flare.lat, true)}, {toDMS(flare.lng, false)}
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
                <p><strong>Peak:</strong> {new Date(flare.peakTime).toUTCString()}</p>
                <p><strong>Latitude:</strong> {toDMS(flare.lat, true)}</p>
                <p><strong>Longitude:</strong> {toDMS(flare.lng, false)}</p>
                <p><strong>Source:</strong> {flare.sourceLocation || "Unknown"}</p>
                <p><strong>Linked Events:</strong> {flare.linkedEvents?.join(", ") || "None"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
