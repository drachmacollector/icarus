import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
  const [showOnlyMapped, setShowOnlyMapped] = useState(true);
  const [sortOrder, setSortOrder] = useState("default");

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

  const flaresToDisplay = useMemo(() => {
    let result = showOnlyMapped ? flaresWithCoords : filteredFlares;
    
    // Apply sorting
    if (sortOrder === "severity-desc") {
      return [...result].sort((a, b) => {
        const severityA = getSeverityOrder(a.classType);
        const severityB = getSeverityOrder(b.classType);
        return severityB - severityA;
      });
    } else if (sortOrder === "severity-asc") {
      return [...result].sort((a, b) => {
        const severityA = getSeverityOrder(a.classType);
        const severityB = getSeverityOrder(b.classType);
        return severityA - severityB;
      });
    }
    
    return result;
  }, [showOnlyMapped, filteredFlares, flaresWithCoords, sortOrder]);

  function getSeverityOrder(classType) {
    if (!classType) return 0;
    if (classType.startsWith("X")) return 4;
    if (classType.startsWith("M")) return 3;
    if (classType.startsWith("C")) return 2;
    return 1;
  }

  return (
    <div className="status-container">
      <div className="header-section">
        <div className="title-container">
          <h2 className="status-title">Solar Flare Command Center</h2>
          <div className="title-decoration"></div>
        </div>
      </div>

<div className="date-range-controls">
  <div className="notification-area">
    {loading && <div className="loading-notification">Loading flare data...</div>}
    {error && <div className="error-notification">{error}</div>}
  </div>
  
  <div className="controls-right">
    <div className="date-picker-group">
      <div className="date-label">Start Date</div>
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
      <label className="date-label">End Date</label>
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
      Reset Range
    </button>
  </div>
</div>

      <div className="map-layout">
        <div className="map-wrapper">
          <div className="map-header">
            <h3>Solar Activity Map</h3>
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color major"></div>
                <span>X-Class (Major)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color moderate"></div>
                <span>M-Class (Moderate)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color minor"></div>
                <span>C-Class (Minor)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color mild"></div>
                <span>B-Class (Mild)</span>
              </div>
            </div>
          </div>
          
          <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} className="flare-map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {flaresToDisplay.map((flare, idx) => {
              if (flare.lat !== null && flare.lng !== null) {
                const severityClass = getSeverityClass(flare.classType);
                return (
                  <CircleMarker
                    key={idx}
                    center={[flare.lat, flare.lng]}
                    radius={severityClass === "major" ? 8 : 
                            severityClass === "moderate" ? 6 : 
                            severityClass === "minor" ? 5 : 4}
                    className={`flare-marker ${severityClass}`}
                  >
                    <Popup className="flare-popup">
                      <strong>Class:</strong> {flare.classType || "?"} <br />
                      <strong>Peak:</strong> {new Date(flare.peakTime).toUTCString()} <br />
                      <strong>Location:</strong> {toDMS(flare.lat, true)}, {toDMS(flare.lng, false)}
                    </Popup>
                  </CircleMarker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>

        <div className="info-panel">
          <div className="panel-header">
            <h3>Flare Analysis</h3>
            <div className="panel-controls-right">
              <div className="sort-control">
                <label className="control-label">Sort by:</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="sort-select"
                >
                  <option value="default">Default</option>
                  <option value="severity-desc">Severity (High to Low)</option>
                  <option value="severity-asc">Severity (Low to High)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="panel-controls">
            <div className="date-selector">
              <label className="control-label">Select Observation Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Choose a date"
                className="datepicker"
              />
            </div>
            
            <div className="location-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showOnlyMapped}
                  onChange={() => setShowOnlyMapped(!showOnlyMapped)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-text">
                Show only flares with location data ({flaresWithCoords.length})
              </span>
            </div>
          </div>
          
          <div className="panel-stats">
            <div className="stats-card">
              <span className="stats-value">{flaresToDisplay.length}</span>
              <span className="stats-label">Total Flares</span>
            </div>
            <div className="stats-card major">
              <span className="stats-value">
                {flaresToDisplay.filter(f => getSeverityClass(f.classType) === "major").length}
              </span>
              <span className="stats-label">Major</span>
            </div>
            <div className="stats-card moderate">
              <span className="stats-value">
                {flaresToDisplay.filter(f => getSeverityClass(f.classType) === "moderate").length}
              </span>
              <span className="stats-label">Moderate</span>
            </div>
            <div className="stats-card minor">
              <span className="stats-value">
                {flaresToDisplay.filter(f => getSeverityClass(f.classType) === "minor").length}
              </span>
              <span className="stats-label">Minor</span>
            </div>
            <div className="stats-card mild">
              <span className="stats-value">
                {flaresToDisplay.filter(f => getSeverityClass(f.classType) === "mild").length}
              </span>
              <span className="stats-label">Mild</span>
            </div>
          </div>
          
          <div className="flare-grid">
            {flaresToDisplay.map((flare, idx) => {
              const severityClass = getSeverityClass(flare.classType);
              const severityLabel = getSeverityLabel(flare.classType);
              return (
                <div key={idx} className={`flare-card ${severityClass}`}>
                  <div className="flare-card-header">
                    <h4 className="flare-class">Class {flare.classType || "?"}</h4>
                    <span className={`severity ${severityClass}`}>
                      {severityLabel}
                    </span>
                  </div>
                  <div className="flare-details">
                    <div className="detail-group">
                      <span className="detail-label">Peak:</span>
                      <span className="detail-value">
                        {flare.peakTime ? new Date(flare.peakTime).toUTCString() : "Unknown"}
                      </span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{flare.sourceLocation || "NA"}</span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Coordinates:</span>
                      <span className="detail-value">
                        {flare.lat !== null ? toDMS(flare.lat, true) : "Unknown"}, 
                        {flare.lng !== null ? toDMS(flare.lng, false) : "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flare-instruments">
                    <span className="instruments-label">Detected by:</span>
                    {flare.instruments?.map(i => i.displayName).join(", ") || "Unknown"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

{/* ✅ Stylish Home Button (Bottom Left Floating) */}
<Link to="/" style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 1000 }}>
  <button
    style={{
      padding: '0.5rem 1.2rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#fff',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      cursor: 'pointer',
      transition: '0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
    }}
  >
    🏠 Home
  </button>
</Link>

    </div>
  );
}