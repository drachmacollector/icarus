// src/aurora/components/AuroraTimeline.jsx
import React from 'react';

export default function AuroraTimeline({ kpForecast, onSelectHour }) {
  return (
    <div className="aurora-timeline" style={{ display:'flex', gap:8 }}>
      {kpForecast.map((entry, i) => {
        const height = (entry.kp / 9) * 100;
        const alert = entry.kp >= 5;
        return (
          <div
            key={i}
            onClick={() => onSelectHour(entry)}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              width: 30
            }}
          >
            <div 
              style={{
                height: `${height}%`,
                background: alert ? '#7fffd4' : '#005f73',
                transition: 'background 0.5s'
              }}
            />
            <small style={{ color:'#eee' }}>
              {new Date(entry.timeTag).getUTCHours()}h
            </small>
          </div>
        );
      })}
    </div>
  );
}
