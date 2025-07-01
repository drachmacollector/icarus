// src/components/FlareTooltip.jsx
import React from 'react';

export default function FlareTooltip({ flare }) {
  return (
    <div className="flare-tooltip" style={{
      background: 'white',
      padding: '0.5rem',
      borderRadius: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      fontSize: '0.85rem'
    }}>
      <div><strong>Flare ID:</strong> {flare.flrID}</div>
      <div><strong>Class:</strong> {flare.classType}</div>
      <div><strong>Peak:</strong> {new Date(flare.peakTime).toISOString().slice(0,16).replace('T',' ') + ' UTC'}</div>
      <div>
        <strong>Location:</strong> {flare.sourceLocation || 'n/a'}
      </div>
    </div>
  );
}
