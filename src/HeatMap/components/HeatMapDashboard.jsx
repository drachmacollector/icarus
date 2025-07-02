// src/HeatMap/components/HeatMapDashboard.jsx
import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useFlareData from '../../Solar Flare/hooks/useFlareData';
import useCmeData from '../../CME/hooks/useCmeData';
import { buildHeatmapPoints } from '../utils/heatmapUtils';
import HeatMapGlobe from './HeatMapGlobe';
import './Heatmap.css';

export default function HeatMapDashboard() {
  // Date range state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Toggles
  const [showFlares, setShowFlares] = useState(true);
  const [showCmes, setShowCmes] = useState(true);

  // Load raw data
  const { flares } = useFlareData({
    startDate: startDate?.toISOString().slice(0, 10),
    endDate: endDate?.toISOString().slice(0, 10)
  });
  const { cmes } = useCmeData({
    startDate: startDate?.toISOString().slice(0, 10),
    endDate: endDate?.toISOString().slice(0, 10)
  });

  // Combine data based on toggles
  const points = useMemo(() => {
    const f = showFlares ? flares : [];
    const c = showCmes ? cmes : [];
    return buildHeatmapPoints(f, c);
  }, [flares, cmes, showFlares, showCmes]);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* === Heatmap Controls Overlay === */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        padding: '1rem',
        borderRadius: '12px',
        color: '#fff',
        width: '250px',
        fontSize: '0.9rem',
        backdropFilter: 'blur(6px)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Heatmap Controls</h3>

        <div style={{ marginBottom: 12 }}>
          <label>Start Date:</label><br />
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Last 30 days"
            maxDate={new Date()}
            className="datepicker-input"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>End Date:</label><br />
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Today"
            maxDate={new Date()}
            className="datepicker-input"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={showFlares}
            onChange={() => setShowFlares(v => !v)}
            id="flr"
          />
          <label htmlFor="flr" style={{ marginLeft: 6 }}>Show Solar Flares ({flares.length})</label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={showCmes}
            onChange={() => setShowCmes(v => !v)}
            id="cme"
          />
          <label htmlFor="cme" style={{ marginLeft: 6 }}>Show CMEs ({cmes.length})</label>
        </div>

        <div style={{ marginTop: 16 }}>
          <strong>Total points:</strong> {points.length}
        </div>
      </div>

      {/* === HeatMap Globe === */}
      <HeatMapGlobe points={points} />
    </div>
  );
}
