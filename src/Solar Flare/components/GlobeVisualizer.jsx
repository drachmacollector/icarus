// src/components/GlobeVisualizer.jsx
import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { computeSubsolarPoint } from '../utils/geoUtils';

export default function GlobeVisualizer({ flares, currentTime, cityData = [] }) {
  const globeEl = useRef();
  const [subsolar, setSubsolar] = useState({ lat: 0, lng: 0 });
  const [hemisphereRGB, setHemisphereRGB] = useState('navy');
  const [hemisphereOpacity, setHemisphereOpacity] = useState(0.75);
  const [autoRotate, setAutoRotate] = useState(true); // ✅ New state for toggle

  const rgbMap = {
    green: '0,255,0',
    yellow: '255,255,0',
    red: '255,0,0',
    navy: '0,0,128',
  };

  // Hemisphere mesh
  const hemiMeshRef = useRef();
  if (!hemiMeshRef.current) {
    const geom = new THREE.SphereGeometry(1.01, 75, 75, 0, Math.PI);
    const mat = new THREE.MeshBasicMaterial({
      color: `rgb(${rgbMap[hemisphereRGB]})`,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: hemisphereOpacity
    });
    hemiMeshRef.current = new THREE.Mesh(geom, mat);
  }

  // Auto-rotate handler
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = autoRotate;
      globeEl.current.controls().autoRotateSpeed = 0.8;
    }
  }, [autoRotate]);

  // Subsolar + hemisphere color
  useEffect(() => {
    const pt = computeSubsolarPoint(currentTime);
    setSubsolar(pt);

    const worst = flares.reduce((acc, f) => {
      if (f.classType === 'X') return 'X';
      if (f.classType === 'M' && acc !== 'X') return 'M';
      return acc;
    }, null);

    let rgbColor = 'navy';
    let opacity = 0.75;

    if (worst === 'X') {
      rgbColor = 'red';
      opacity = 0.3;
    } else if (worst === 'M') {
      rgbColor = 'yellow';
      opacity = 0.3;
    }

    setHemisphereRGB(rgbColor);
    setHemisphereOpacity(opacity);

    hemiMeshRef.current.material.color.set(`rgb(${rgbMap[rgbColor]})`);
    hemiMeshRef.current.material.opacity = opacity;
    hemiMeshRef.current.material.needsUpdate = true;
  }, [currentTime, flares]);

  // Flares as points
  const pointsData = flares.map(f => ({
    lat: f.lat,
    lng: f.lng,
    size: f.size || 0.3,
    color: f.color || 'orange',
    flare: f
  }));

  // Arcs
  const flareArcs = flares.map(f => ({
    startLat: f.lat,
    startLng: f.lng,
    endLat: f.lat + 15,
    endLng: f.lng + 15,
    color: f.classType === 'X' ? ['red'] : ['orange'],
    flare: f
  }));

  return (
  <div style={{ position: 'relative', height: '100%', width: '100%' }}>
    <Globe
      ref={globeEl}
      globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
      showAtmosphere={true}
      atmosphereColor="blue"
      atmosphereAltitude={0.25}
      backgroundColor="#000000"

      pointsData={cityData}
      pointLat="lat"
      pointLng="lng"
      pointColor={() => 'yellow'}
      pointRadius={0.05}
      pointAltitude={0.01}

      labelsData={pointsData}
      labelLat="lat"
      labelLng="lng"
      labelText={() => ''}
      labelDotRadius="size"
      labelColor="color"
      labelAltitude={0.02}
      onLabelClick={p => alert(`Flare ${p.flare.classType} peaked at ${p.flare.peakTime}`)}

      arcsData={flareArcs}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor="color"
      arcDashLength={0.01}
      arcDashGap={0}
      arcStroke={1.2}
      arcAltitude={0.3}
      onArcClick={(a) => alert(`Flare ${a.flare.classType} peaked at ${a.flare.peakTime}`)}

      customLayerData={[subsolar]}
      customThreeObject={() => hemiMeshRef.current}
      customThreeObjectUpdate={(obj, { lat, lng }) => {
        obj.position.setFromSphericalCoords(
          1,
          (90 - lat) * (Math.PI / 180),
          (lng + 180) * (Math.PI / 180)
        );
        obj.lookAt(obj.position.clone().multiplyScalar(2));
      }}
    />

    {/* 💎 Top center floating Pause/Resume button */}
    <div style={{
      position: 'absolute',
      top: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
    }}>
      <button
        onClick={() => setAutoRotate(prev => !prev)}
        style={{
          padding: '0.5rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          color: '#fff',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        {autoRotate ? '⏸ Pause Rotation' : '▶ Resume Rotation'}
      </button>
    </div>
  </div>
);
}