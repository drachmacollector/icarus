// src/aurora/components/AuroraForecast.jsx
import React, { useState } from 'react';
import useAuroraData from '../hooks/useAuroraData';
import AuroraGlobe from './AuroraGlobe';
import AuroraTimeline from './AuroraTimeline';
import './AuroraForecast.css';

export default function AuroraForecast() {
  const { kpForecast, loading, error } = useAuroraData();
  const [selected, setSelected] = useState(null);

  // Default to first hour if none selected
  const active = selected || kpForecast[0];

  return (
    <div className="aurora-container">
      <div className="aurora-globe-section">
        {loading && <div className="aurora-status">Loading…</div>}
        {error && <div className="aurora-status error">{error}</div>}
        <AuroraGlobe kpEntry={active} />
      </div>

      <div className="aurora-timeline-section">
        <div className="aurora-timeline-header">
          <h3>Kp Index Forecast Timeline</h3>
          <p>Click a bar to see aurora strength for that hour.</p>
        </div>
        <AuroraTimeline kpForecast={kpForecast} onSelectHour={setSelected} />
        <div className="aurora-footer">
          <a 
            href="https://www.swpc.noaa.gov/products/planetary-k-index" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Learn more about Aurora Forecasts →
          </a>
        </div>
      </div>
    </div>
  );
}
