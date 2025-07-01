import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-datepicker/dist/react-datepicker.css";
import "./status.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

export default function StatusPage({ flares }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const filteredFlares = selectedDate
    ? flares.filter(f => {
        const flareDate = new Date(f.peakTime).toDateString();
        return flareDate === selectedDate.toDateString();
      })
    : flares;

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

          <p style={{ marginTop: "10px" }}>
            Showing {filteredFlares.length} flare(s){" "}
            {selectedDate ? `on ${format(selectedDate, "yyyy-MM-dd")}` : "(all dates)"}
          </p>

          <div className="flare-cards">
            {filteredFlares.map((flare, idx) => (
              <div key={idx} className="flare-card">
                <h4 className="flare-class">Class {flare.classType}</h4>
                <p><strong>Start:</strong> {flare.startTime}</p>
                <p><strong>Peak:</strong> {flare.peakTime}</p>
                <p><strong>Location:</strong> {flare.lat}, {flare.lng}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
