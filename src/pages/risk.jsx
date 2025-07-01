// src/pages/risk.jsx
import React from 'react';
import RiskDashboard from '../components/RiskDashboard';
import useFlareData from '../hooks/useFlareData';

export default function RiskPage() {
  const { flares, loading, error } = useFlareData();

  if (loading) return <div style={{ color: 'white', padding: '1rem' }}>Loading risk data...</div>;
  if (error) return <div style={{ color: 'red', padding: '1rem' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '1rem', background: '#000', minHeight: '100vh', color: 'white' }}>
      <h1>Risk Dashboard</h1>
      <RiskDashboard flares={flares} />
    </div>
  );
}
