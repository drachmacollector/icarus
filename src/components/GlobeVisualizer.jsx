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

  const rgbMap = {
    green: '0,255,0',
    yellow: '255,255,0',
    red: '255,0,0',
    navy: '0,0,128',
  };

  // Create reusable hemisphere mesh
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

  // Auto-rotate on mount
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.8;
    }
  }, []);

  // Update subsolar point + hemisphere color
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

  // Flare marker pins (your code)
  const pointsData = flares.map(f => ({
    lat: f.lat,
    lng: f.lng,
    size: f.size || 0.3,
    color: f.color || 'orange',
    flare: f
  }));
  console.log("🔥 Points passed to Globe:", pointsData);

  // Flare arcs (teammate's code)
  const flareArcs = flares.map(f => ({
    startLat: f.lat,
    startLng: f.lng,
    endLat: f.lat + 15,
    endLng: f.lng + 15,
    color: f.classType === 'X' ? ['red'] : ['orange'],
    flare: f
  }));

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
      showAtmosphere={true}
      atmosphereColor="blue"
      atmosphereAltitude={0.25}
      backgroundColor="#000000"

      // City lights (optional)
      pointsData={cityData}
      pointLat="lat"
      pointLng="lng"
      pointColor={() => 'yellow'}
      pointRadius={0.05}
      pointAltitude={0.01}

      // Flare pins
      labelsData={pointsData}
      labelLat="lat"
      labelLng="lng"
      labelText={() => ''}
      labelDotRadius="size"
      labelColor="color"
      labelAltitude={0.02}
      onLabelClick={p => alert(`Flare ${p.flare.classType} peaked at ${p.flare.peakTime}`)}

      // Flare arcs
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

      // Hemisphere shading
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
  );
}
