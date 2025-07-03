// src/components/CmeTracker.jsx
import React, { useState } from 'react';
import Globe from 'react-globe.gl';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useCmeData from '../hooks/useCmeData';

export default function CmeTracker() {
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd]     = useState(null);
  const [selected, setSelected]     = useState(null);

  const { cmes, loading, error } = useCmeData({
    startDate: rangeStart ? rangeStart.toISOString().slice(0, 10) : undefined,
    endDate:   rangeEnd   ? rangeEnd.toISOString().slice(0, 10)   : undefined
  });

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Globe with dynamic CME rods */}
      <Globe
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={cmes}
        pointLat={d => d.lat}
        pointLng={d => d.lng}

        // Color by severity
        pointColor={d =>
          d.analysis.speed > 1000 ? 'red' : 'orange'
        }

        // Taller rods for high‐impact
        pointAltitude={d =>
          d.analysis.speed > 1000 ? 0.2 : 0.1
        }

        // Slightly thicker rods for high‐impact
        pointRadius={d =>
          d.analysis.speed > 1000 ? 0.5 : 0.3
        }

        onPointClick={setSelected}
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
            onClick={() => setSelected(cme)}
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
            <p><strong>Arrival:</strong> {cme.analysis.arrivalTime}</p>
            <p>
              <strong>Impact:</strong>{' '}
              {cme.analysis.speed > 1000 ? (
                <span style={{ color: 'red' }}>High</span>
              ) : (
                <span style={{ color: 'orange' }}>Moderate/Low</span>
              )}
            </p>
            <p>
              <a
                href={cme.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4da6ff' }}
              >
                🔗 Details
              </a>
            </p>
          </div>
        ))}

        {/* Selected CME Details */}
        {selected && (
          <div style={{
            marginTop: '1rem',
            borderTop: '1px solid #444',
            paddingTop: '1rem'
          }}>
            <h4>📄 Details for {selected.activityID}</h4>
            <pre style={{
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              color: '#ccc'
            }}>
              {JSON.stringify(selected, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
