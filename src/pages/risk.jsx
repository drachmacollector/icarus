// src/pages/risk.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import RiskDashboard from '../components/RiskDashboard';
import useFlareData from '../hooks/useFlareData';

export default function RiskPage() {
  const { flares, loading, error } = useFlareData();

  if (loading) return <div style={{ color: 'white', padding: '1rem' }}>Loading risk data...</div>;
  if (error) return <div style={{ color: 'red', padding: '1rem' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '1rem', background: '#000', minHeight: '100vh', color: 'white', position: 'relative' }}>
      <h1>Risk Dashboard</h1>
      <RiskDashboard flares={flares} />

      {/* ✅ Home Button Fixed to Bottom-Left */}
      <Link to="/">
        <button style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          padding: '0.5rem 1rem',
          background: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000
        }}>
          🏠 Home
        </button>
      </Link>
    </div>
  );
}
