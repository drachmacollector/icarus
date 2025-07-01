// src/components/Legend.jsx
import React from 'react';

const dotStyle = (color) => ({
  display: 'inline-block',
  width: '12px',
  height: '12px',
  borderRadius: '6px',
  backgroundColor: color,
  marginRight: '0.5rem',
});

export default function Legend() {
  return (
    <div className="legend" style={{
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      background: 'rgba(255,255,255,0.8)',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      fontSize: '0.9rem',
      zIndex: 10
    }}>
      <div><span style={dotStyle('red')}></span>X‑Class: Widespread Blackout</div>
      <div><span style={dotStyle('yellow')}></span>M‑Class: Localized Fades</div>
      <div><span style={dotStyle('green')}></span>No Severe Flare</div>
    </div>
  );
}
