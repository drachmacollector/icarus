// src/components/CmeTooltip.jsx
import React from 'react';

export default function CmeTooltip({ cme, screenPos, onClose }) {
  if (!cme || !screenPos) return null;

  const style = {
    position: 'absolute',
    left: screenPos.x,
    top: screenPos.y,
    transform: 'translate(-50%, -100%)',
    background: 'rgba(0,0,0,0.9)',
    color: '#fff',
    padding: '0.75rem',
    borderRadius: '6px',
    pointerEvents: 'auto',
    maxWidth: 260,
    zIndex: 2000,
    fontSize: '0.85rem',
    lineHeight: 1.3
  };

  return (
    <div style={style}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 4, right: 6,
          background: 'transparent', border: 'none',
          color: '#888', cursor: 'pointer', fontSize: '1.1rem'
        }}
      >×</button>

      <h4 style={{ margin: '0 0 0.5rem', color: '#4da6ff' }}>
        📄 {cme.activityID}
      </h4>

      <p><strong>Catalog:</strong> {cme.catalog}</p>
      <p><strong>Start:</strong> {new Date(cme.startTime).toUTCString()}</p>
      <p><strong>Submitted:</strong> {new Date(cme.submissionTime).toUTCString()}</p>

      <p>
        <strong>Location:</strong> {cme.sourceLocation || 'N/A'}<br/>
        <strong>Region #:</strong> {cme.activeRegionNum || 'N/A'}
      </p>

      <p>
        <strong>Instruments:</strong><br/>
        {(cme.instruments || []).map(i => i.displayName).join(', ') || 'N/A'}
      </p>

      <hr style={{ borderColor: '#333', margin: '0.5rem 0' }}/>

      <p><strong>Analysis:</strong></p>
      {cme.analysis ? (
        <>
          <p>• Speed: {Math.round(cme.analysis.speed)} km/s</p>
          <p>• Lat/Lon: {cme.analysis.latitude.toFixed(1)}, {cme.analysis.longitude.toFixed(1)}</p>
          <p>• Arrival: {cme.analysis.arrivalTime}</p>
        </>
      ) : (
        <p>N/A</p>
      )}

      <p>
        <strong>Linked Events:</strong><br/>
        {(cme.linkedEvents || []).map(e => e.activityID).join(', ') || 'None'}
      </p>

      {cme.note && (
        <p><strong>Note:</strong><br/>{cme.note}</p>
      )}

      <a
        href={cme.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#4da6ff', display:'block', marginTop:'0.5rem' }}
      >
        🔗 Full NASA Details
      </a>
    </div>
  );
}
