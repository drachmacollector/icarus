// src/aurora/components/AuroraForecast.jsx
import React, { useState } from 'react';
import useAuroraData from '../hooks/useAuroraData';
import AuroraGlobe from './AuroraGlobe';
import AuroraTimeline from './AuroraTimeline';

export default function AuroraForecast() {
  const { kpForecast, loading, error } = useAuroraData();
  const [selected, setSelected] = useState(null);

  // Default to first hour if none selected
  const active = selected || kpForecast[0];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#000' }}>
      <div style={{ flex:'1 1 auto', position:'relative' }}>
        {loading && <div style={{ position:'absolute', top:10, left:10, color:'white' }}>Loading…</div>}
        {error   && <div style={{ position:'absolute', top:10, left:10, color:'red' }}>{error}</div>}
        <AuroraGlobe kpEntry={active} />
      </div>
      <div style={{
        padding: '1rem',
        background:'#111',
        color:'#eee',
        display:'flex',
        alignItems:'center'
      }}>
        <AuroraTimeline kpForecast={kpForecast} onSelectHour={setSelected} />
      </div>
    </div>
  );
}
