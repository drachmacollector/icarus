// src/aurora/components/AuroraGlobe.jsx
import React, { useMemo } from 'react';
import Globe from 'react-globe.gl';
import { kpToLatitudeBoundary } from '../utils/auroraUtils';
import { Link } from 'react-router-dom'; // <-- Import this

/**
 * Linearly interpolate between two hex colors.
 * t ∈ [0,1]
 */
function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16),
        bh = parseInt(b.slice(1), 16),
        ar = ah >> 16, ag = (ah >> 8) & 0xFF, ab = ah & 0xFF,
        br = bh >> 16, bg = (bh >> 8) & 0xFF, bb = bh & 0xFF;
  const rr = Math.round(ar + (br - ar) * t),
        rg = Math.round(ag + (bg - ag) * t),
        rb = Math.round(ab + (bb - ab) * t);
  return `#${((1<<24) + (rr<<16) + (rg<<8) + rb).toString(16).slice(1)}`;
}

/**
 * Map Kp [0–9] to a color: green → purple → white
 */
function getAuroraColor(kp) {
  if (kp <= 5) {
    // 0→5: green to purple
    return lerpColor('#33ff33', '#9933ff', kp / 5);
  } else {
    // 5→9: purple to white
    return lerpColor('#9933ff', '#ffffff', (kp - 5) / 4);
  }
}

export default function AuroraGlobe({ kpEntry }) {
  const pointsData = useMemo(() => {
    if (!kpEntry) return [];
    const { kp } = kpEntry;
    const boundary = kpToLatitudeBoundary(kp);
    const pts = [];
    for (let i = 0; i < 90; i++) {
      const lng = (i / 90) * 360 - 180;
      pts.push({ lat:  boundary, lng, kp });
      pts.push({ lat: -boundary, lng, kp });
    }
    return pts;
  }, [kpEntry]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Globe
        style={{ width: '100%', height: '100%' }}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={true}
        atmosphereColor="rgba(100,150,255,0.2)"

        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor={d => getAuroraColor(d.kp)}
        pointAltitude={d => 0.01 + (d.kp / 9) * 0.05}
        pointRadius={d => 0.2 + (d.kp / 9) * 0.8}
        pointsTransitionDuration={800}
      />

      {/* ✅ Home Button - Bottom Left */}
      <Link to="/" style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 1000 }}>
        <button
          style={{
            padding: '0.5rem 1.2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            transition: '0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          🌞 Flares
        </button>
      </Link>
    </div>
  );
}
