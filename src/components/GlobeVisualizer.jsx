// src/components/GlobeVisualizer.jsx
import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { computeSubsolarPoint } from '../utils/geoUtils';

export default function GlobeVisualizer({ flares, currentTime }) {
  const globeEl = useRef();
  const [subsolar, setSubsolar] = useState({ lat: 0, lng: 0 });
  const [hemisphereColor, setHemisphereColor] = useState('rgba(0,255,0,0.2)');

  // Recompute subsolar point & hemisphere color whenever time or flares change
  useEffect(() => {
    // 1. Subsolar point for currentTime
    const pt = computeSubsolarPoint(currentTime);
    setSubsolar(pt);

    // 2. Determine worst severity among active flares
    const worst = flares.reduce((acc, f) => {
      if (f.classType === 'X') return 'X';
      if (f.classType === 'M' && acc !== 'X') return 'M';
      return acc;
    }, null);

    // 3. Pick color: green (none), yellow (M), red (X)
    let color;
    if (worst === 'X') color = 'rgba(255,0,0,0.3)';
    else if (worst === 'M') color = 'rgba(255,255,0,0.3)';
    else color = 'rgba(0,255,0,0.2)';
    setHemisphereColor(color);

  }, [currentTime, flares]);

  // Build point data for flare markers
  const pointsData = flares.map(f => ({
    lat: f.markerLat,
    lng: f.markerLng,
    size: f.classType === 'X' ? 1.5 : 1,
    color: f.classType === 'X' ? 'red' : 'yellow',
    flare: f
  }));

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      backgroundColor="#000011"
      // Hemisphere shading
      customLayerData={[subsolar]}
      customThreeObject={() => {
        // create a half‑sphere mesh at origin, then translate to subsolar point
        const geometry = new THREE.SphereGeometry(1.01, 32, 32, 0, Math.PI);
        const material = new THREE.MeshBasicMaterial({
          color: hemisphereColor,
          side: THREE.DoubleSide,
          transparent: true,
        });
        return new THREE.Mesh(geometry, material);
      }}
      customThreeObjectUpdate={(obj, d) => {
        // orient and position hemisphere to subsolar lat/lng
        const { lat, lng } = d;
        obj.position.setFromSphericalCoords(
          1, 
          (90 - lat) * (Math.PI / 180),
          (lng + 180) * (Math.PI / 180)
        );
        // point it outward
        obj.lookAt(obj.position.clone().multiplyScalar(2));
      }}

      // Flare markers
      pointsData={pointsData}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointAltitude={0.02}
      pointRadius="size"
      onPointHover={(point) => {
        if (point) globeEl.current.controls().autoRotate = false;
      }}
      onPointClick={(point) => {
        // Could trigger a detailed panel here
        alert(`Flare ${point.flare.classType} at ${point.flare.peakTime}`);
      }}
    />
  );
}
