// src/cme/components/CmeTracker.jsx
import React, { useState } from 'react';
import Globe from 'react-globe.gl';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useCmeData from '../hooks/useCmeData';

export default function CmeTracker() {
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd,   setRangeEnd]   = useState(null);

  const { cmes, loading, error } = useCmeData({
    startDate: rangeStart ? rangeStart.toISOString().slice(0,10) : undefined,
    endDate:   rangeEnd   ? rangeEnd.toISOString().slice(0,10)   : undefined
  });

  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '70%', position: 'relative' }}>
        {loading && <div style={{ position:'absolute',zIndex:10 }}>Loading CMEs…</div>}
        {error   && <div style={{ position:'absolute',zIndex:10, color:'red' }}>{error}</div>}

        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background:'rgba(0,0,0,0.5)', padding: '8px', borderRadius:4 }}>
          <div>
            <label>Start: </label>
            <DatePicker
              selected={rangeStart}
              onChange={setRangeStart}
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div style={{ marginTop: 4 }}>
            <label>End: </label>
            <DatePicker
              selected={rangeEnd}
              onChange={setRangeEnd}
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>

        <Globe
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"

          pointsData={cmes}
          pointLat={d => d.lat}
          pointLng={d => d.lng}
          pointColor={() => 'orange'}
          pointAltitude={0.1}
          pointRadius={0.4}
          onPointClick={setSelected}
        />
      </div>

      <div style={{ width: '30%', overflowY: 'auto', padding: '1rem', background:'#111', color:'#eee' }}>
        <h2>Recent CMEs ({cmes.length})</h2>
        {cmes.map((cme, i) => (
          <div
            key={i}
            onClick={() => setSelected(cme)}
            style={{
              padding: '0.5rem',
              marginBottom: '0.5rem',
              background: selected === cme ? '#333' : '#222',
              cursor: 'pointer'
            }}
          >
            <p><strong>ID:</strong> {cme.activityID}</p>
            <p><strong>Time:</strong> {new Date(cme.startTime).toUTCString()}</p>
            <p><strong>Speed:</strong> {Math.round(cme.analysis.speed)} km/s</p>
            <p><strong>Arrival (est.):</strong> {cme.analysis.arrivalTime}</p>
            <p><strong>Impact:</strong> {cme.analysis.speed > 1000 ? 'High' : 'Moderate/Low'}</p>
            <p><a href={cme.link} target="_blank" rel="noopener noreferrer">Details</a></p>
          </div>
        ))}

        {selected && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid #444', paddingTop: '1rem' }}>
            <h3>Details for {selected.activityID}</h3>
            <pre style={{ fontSize:'0.8rem', whiteSpace:'pre-wrap' }}>
              {JSON.stringify(selected, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}


