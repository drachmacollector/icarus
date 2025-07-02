// src/HeatMap/components/HeatMapDashboard.jsx
import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useFlareData from '../../Solar Flare/hooks/useFlareData';
import useCmeData from '../../CME/hooks/useCmeData';
import { buildHeatmapPoints } from '../utils/heatmapUtils';
import HeatMapGlobe from './HeatMapGlobe';

export default function HeatMapDashboard() {
  // Date range state
  const [startDate, setStartDate] = useState(null);
  const [endDate,   setEndDate]   = useState(null);

  // Toggles
  const [showFlares, setShowFlares] = useState(true);
  const [showCmes,   setShowCmes]   = useState(true);

  // Load raw data
  const { flares } = useFlareData({
    startDate: startDate?.toISOString().slice(0,10),
    endDate:   endDate  ?.toISOString().slice(0,10)
  });
  const { cmes }   = useCmeData({
    startDate: startDate?.toISOString().slice(0,10),
    endDate:   endDate  ?.toISOString().slice(0,10)
  });

  // Build the points based on toggles
  const points = useMemo(() => {
    const f = showFlares ? flares : [];
    const c = showCmes   ? cmes   : [];
    return buildHeatmapPoints(f, c);
  }, [flares, cmes, showFlares, showCmes]);

  return (
    <div style={{ display:'flex', height:'100vh' }}>
      {/* <aside style={{
        width: 250, padding: 16, background:'#111', color:'#eee', overflowY:'auto'
      }}>
        <h3>Heatmap Controls</h3>

        <div style={{ marginBottom:12 }}>
          <label>Start Date:</label><br/>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Last 30 days"
            maxDate={new Date()}
          />
        </div>

        <div style={{ marginBottom:12 }}>
          <label>End Date:</label><br/>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Today"
            maxDate={new Date()}
          />
        </div>

        <div style={{ marginBottom:12 }}>
          <input
            type="checkbox"
            checked={showFlares}
            onChange={() => setShowFlares(v => !v)}
            id="flr"
          />
          <label htmlFor="flr" style={{ marginLeft:4 }}>Show Solar Flares ({flares.length})</label>
        </div>

        <div style={{ marginBottom:12 }}>
          <input
            type="checkbox"
            checked={showCmes}
            onChange={() => setShowCmes(v => !v)}
            id="cme"
          />
          <label htmlFor="cme" style={{ marginLeft:4 }}>Show CMEs ({cmes.length})</label>
        </div>

        <div style={{ marginTop:20 }}>
          <strong>Total points:</strong> {points.length}
        </div>
      </aside> */}

      <main style={{ flex:'1 1 auto', position:'relative' }}>
        <HeatMapGlobe points={points} />
      </main>
    </div>
  );
}
