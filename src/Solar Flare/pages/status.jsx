import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-datepicker/dist/react-datepicker.css";
import "./status.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import useFlareData from "../hooks/useFlareData";
import useCmeData from "../../cme/hooks/useCmeData";

function toDMS(deg, isLat) {
  if (deg === null || deg === undefined) return "Unknown";
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutes = Math.floor((absolute - degrees) * 60);
  const seconds = Math.floor(((absolute - degrees) * 60 - minutes) * 60);
  const direction = isLat ? (deg >= 0 ? "N" : "S") : (deg >= 0 ? "E" : "W");
  return `${degrees}°${minutes}'${seconds}" ${direction}`;
}

export default function StatusPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showOnlyMapped, setShowOnlyMapped] = useState(true);
  const [sortOrder, setSortOrder] = useState("default");
  const [showCMEs, setShowCMEs] = useState(false);

  const { flares, loading, error } = useFlareData({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined
  });

  const { cmes, loading: loadingCMEs, error: errorCMEs } = useCmeData({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined
  });

  const filteredFlares = useMemo(() => {
    if (!selectedDate) return flares;
    return flares.filter(f => new Date(f.peakTime).toDateString() === selectedDate.toDateString());
  }, [flares, selectedDate]);

  const flaresWithCoords = filteredFlares.filter(f => f.lat !== null && f.lng !== null);

  const resetDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedDate(null);
  };

  const getSeverityClass = (classType) => {
    if (!classType) return "mild";
    if (classType.startsWith("X")) return "major";
    if (classType.startsWith("M")) return "moderate";
    if (classType.startsWith("C")) return "minor";
    return "mild";
  };

  const getSeverityLabel = (classType) => {
    if (!classType) return "Mild";
    if (classType.startsWith("X")) return "Major";
    if (classType.startsWith("M")) return "Moderate";
    if (classType.startsWith("C")) return "Minor";
    return "Mild";
  };

  const getSeverityOrder = (classType) => {
    if (!classType) return 0;
    if (classType.startsWith("X")) return 4;
    if (classType.startsWith("M")) return 3;
    if (classType.startsWith("C")) return 2;
    return 1;
  };

  const flaresToDisplay = useMemo(() => {
    let result = showOnlyMapped ? flaresWithCoords : filteredFlares;
    if (showCMEs) result = result.filter(f => f.isCME);
    if (sortOrder === "severity-desc") {
      return [...result].sort((a, b) => getSeverityOrder(b.classType) - getSeverityOrder(a.classType));
    } else if (sortOrder === "severity-asc") {
      return [...result].sort((a, b) => getSeverityOrder(a.classType) - getSeverityOrder(b.classType));
    }
    return result;
  }, [showOnlyMapped, filteredFlares, flaresWithCoords, sortOrder, showCMEs]);

  const cmesToDisplay = useMemo(() => cmes || [], [cmes]);

  const mapData = showCMEs ? cmesToDisplay : flaresToDisplay;

  return (
    <div className="status-container">
      <div className="title-date-controls">
        <div className="header-section">
          <h2 className="status-title">Solar Flare Command Center</h2>
        </div>

        <div className="notification-area">
          {loading && <div className="loading-notification">Loading data...</div>}
          {error && <div className="error-notification">{error}</div>}
        </div>

        <div className="controls-right">
          <div className="date-picker-group">
            <label>Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              minDate={new Date("2010-01-01")}
              placeholderText="Start Date"
              className="datepicker"
            />
          </div>
          <div className="date-picker-group">
            <label>End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              minDate={startDate || new Date("2010-01-01")}
              placeholderText="End Date"
              className="datepicker"
            />
          </div>
          <button className="reset-btn" onClick={resetDateRange}>
            Reset Range (Last 30 days)
          </button>
        </div>
      </div>

      <div className="map-layout">
        <div className="map-wrapper">
          <div className="map-header">
            <h3>Solar Activity Map</h3>
            <div className="map-legend">
              <div className="legend-item"><div className="legend-color major" />X-Class (Major)</div>
              <div className="legend-item"><div className="legend-color moderate" />M-Class (Moderate)</div>
              <div className="legend-item"><div className="legend-color minor" />C-Class (Minor)</div>
              <div className="legend-item"><div className="legend-color mild" />B-Class (Mild)</div>
            </div>
          </div>

          <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} className="flare-map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {mapData.map((event, idx) => (
              event.lat !== null && event.lng !== null && (
                <CircleMarker
                  key={idx}
                  center={[event.lat, event.lng]}
                  radius={
                    showCMEs ? 6 :
                      getSeverityClass(event.classType) === "major" ? 8 :
                      getSeverityClass(event.classType) === "moderate" ? 6 :
                      getSeverityClass(event.classType) === "minor" ? 5 : 4
                  }
                  color={
                    showCMEs
                      ? event.analysis?.speed > 1000 ? "red" :
                        event.analysis?.speed > 500 ? "orange" : "green"
                      : getSeverityClass(event.classType) === "major" ? "red" :
                        getSeverityClass(event.classType) === "moderate" ? "orange" :
                        getSeverityClass(event.classType) === "minor" ? "green" : "gray"
                  }
                  fillOpacity={0.5}
                >
                  <Popup>
                    {showCMEs ? (
                      <>
                        <strong>ID:</strong> {event.activityID} <br />
                        <strong>Speed:</strong> {Math.round(event.analysis?.speed || 0)} km/s <br />
                        <strong>Start:</strong> {new Date(event.startTime).toUTCString()} <br />
                      </>
                    ) : (
                      <>
                        <strong>Class:</strong> {event.classType || "?"} <br />
                        <strong>Peak:</strong> {new Date(event.peakTime).toUTCString()} <br />
                        <strong>Location:</strong> {toDMS(event.lat, true)}, {toDMS(event.lng, false)}
                      </>
                    )}
                  </Popup>
                </CircleMarker>
              )
            ))}
          </MapContainer>
        </div>

        <div className="info-panel">
          <div className="panel-header">
            <h3>Flare Analysis</h3>
            <div className="panel-controls-right">
              <label>Sort by:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
                <option value="default">Default</option>
                <option value="severity-desc">Severity (High to Low)</option>
                <option value="severity-asc">Severity (Low to High)</option>
              </select>
            </div>
          </div>

          <div className="panel-controls">
            <div className="date-selector">
              <label>Select Observation Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Choose a date"
                className="datepicker"
              />
            </div>

            <div className="location-toggle">
              <label>
                <input type="checkbox" checked={showOnlyMapped} onChange={() => setShowOnlyMapped(!showOnlyMapped)} />
                Show only flares with location data ({flaresWithCoords.length})
              </label>
            </div>

            <div className="location-toggle">
              <label>
                <input type="checkbox" checked={showCMEs} onChange={() => setShowCMEs(!showCMEs)} />
                Show CME activity
              </label>
            </div>
          </div>

          <div className="panel-stats">
            <div className="stats-header">Solar Flares</div>
            <div className="stats-card">
              <span className="stats-value">{flaresToDisplay.length}</span>
              <span className="stats-label">Total Flares</span>
            </div>
            {["major", "moderate", "minor", "mild"].map(severity => (
              <div className={`stats-card ${severity}`} key={`flare-${severity}`}>
                <span className="stats-value">
                  {flaresToDisplay.filter(f => getSeverityClass(f.classType) === severity).length}
                </span>
                <span className="stats-label">{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>
              </div>
            ))}
            <div className="stats-header">CMEs</div>
            <div className="stats-card">
              <span className="stats-value">{cmesToDisplay.length}</span>
              <span className="stats-label">Total CMEs</span>
            </div>
          </div>

          <div className="flare-grid">
            {showCMEs ? (
              cmesToDisplay.map((cme, idx) => (
                <div key={idx} className="flare-card moderate">
                  <div className="flare-card-header">
                    <h4>CME Event</h4>
                    <span className="severity moderate">
                      {cme.analysis?.speed > 1000 ? "High" :
                       cme.analysis?.speed > 500 ? "Moderate" : "Low"}
                    </span>
                  </div>
                  <div className="flare-details">
                    <div><strong>Start:</strong> {new Date(cme.startTime).toUTCString()}</div>
                    <div><strong>Speed:</strong> {Math.round(cme.analysis?.speed || 0)} km/s</div>
                    <div><strong>Arrival:</strong> {cme.analysis?.arrivalTime || "?"}</div>
                  </div>
                  <a href={cme.link} target="_blank" rel="noreferrer">🔗 CME Details</a>
                </div>
              ))
            ) : (
              flaresToDisplay.map((flare, idx) => {
                const severityClass = getSeverityClass(flare.classType);
                const severityLabel = getSeverityLabel(flare.classType);
                return (
                  <div key={idx} className={`flare-card ${severityClass}`}>
                    <div className="flare-card-header">
                      <h4>{flare.classType || "Unknown"}</h4>
                      <span className={`severity ${severityClass}`}>{severityLabel}</span>
                    </div>
                    <div className="flare-details">
                      <div><strong>Peak:</strong> {new Date(flare.peakTime).toUTCString()}</div>
                      <div><strong>Location:</strong> {toDMS(flare.lat, true)}, {toDMS(flare.lng, false)}</div>
                      <div><strong>Source:</strong> {flare.source || "Unknown"}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
