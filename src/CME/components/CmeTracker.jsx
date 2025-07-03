// src/components/CmeTracker.jsx
import React, { useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useCmeData from '../hooks/useCmeData';
import CmeTooltip from './cmeTooltip';

export default function CmeTracker() {
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd]     = useState(null);
  const [selected, setSelected]     = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  const globeRef = useRef();

  const { cmes, loading, error } = useCmeData({
    startDate: rangeStart ? rangeStart.toISOString().slice(0,10) : undefined,
    endDate:   rangeEnd   ? rangeEnd.toISOString().slice(0,10)   : undefined
  });

  // Handle point click: use the mouse event to position tooltip
  const handlePointClick = (cme, event) => {
    setSelected(cme);
    setTooltipPos({
      x: event.clientX,
      y: event.clientY
    });
  };

  // Reset date filters
  const resetDates = () => {
    setRangeStart(null);
    setRangeEnd(null);
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Globe */}
        <Globe
          ref={globeRef}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={cmes}
          pointLat={d => d.lat}
          pointLng={d => d.lng}
          pointColor={d => {
            const speed = d.analysis.speed;
            if (speed > 1000) return 'red';
            if (speed > 500) return 'yellow';
            return 'green';
          }}
          pointAltitude={d => {
            const speed = d.analysis.speed;
            if (speed > 1000) return 0.3;
            if (speed > 500) return 0.15;
            return 0.1;
          }}
          pointRadius={d => {
            const speed = d.analysis.speed;
            if (speed > 1000) return 0.5;
            if (speed > 500) return 0.35;
            return 0.25;
          }}
          onPointClick={handlePointClick}
        />


      {/* Tooltip */}
      <CmeTooltip
        cme={selected}
        screenPos={tooltipPos}
        onClose={() => setSelected(null)}
      />

      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: 10, left: 10,
        width: '28%', maxHeight: '95%',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        padding: '1rem',
        borderRadius: 8,
        overflowY: 'auto',
        color: '#eee',
        backdropFilter: 'blur(6px)'
      }}>
        {/* Date Range */}
        <div style={{ marginBottom: '1rem' }}>
          <label>📅 Start Date:</label><br/>
          <DatePicker
            selected={rangeStart}
            onChange={setRangeStart}
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            placeholderText="Select start date"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>📅 End Date:</label><br/>
          <DatePicker
            selected={rangeEnd}
            onChange={setRangeEnd}
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            placeholderText="Select end date"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={resetDates}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            background: '#007acc',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Reset to 30 Days
        </button>

        {/* Loading/Error */}
        {loading && <p>Loading CMEs…</p>}
        {error   && <p style={{ color: 'red' }}>{error}</p>}

        {/* CME List */}
        <h3 style={{ marginTop: '1rem' }}>
          ☄️ Recent CMEs ({cmes.length})
        </h3>
        {cmes.map((cme, i) => (
          <div
            key={i}
            onClick={() => handlePointClick(cme)}
            style={{
              padding: '0.5rem',
              marginBottom: '0.5rem',
              background: selected === cme ? '#444' : '#222',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <p><strong>ID:</strong> {cme.activityID}</p>
            <p><strong>Time:</strong> {new Date(cme.startTime).toUTCString()}</p>
            <p><strong>Speed:</strong> {Math.round(cme.analysis.speed)} km/s</p>
            <p>
              <strong>Impact:</strong>{' '}
              {cme.analysis.speed > 1000 ? (
                <span style={{ color: 'red' }}>High</span>
              ) : cme.analysis.speed > 500 ? (
                <span style={{ color: 'yellow' }}>Moderate</span>
              ) : (
                <span style={{ color: 'green' }}>Low</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
