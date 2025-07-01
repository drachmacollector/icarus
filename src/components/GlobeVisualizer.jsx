// src/components/GlobeVisualizer.jsx
import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { computeSubsolarPoint } from '../utils/geoUtils';

export default function GlobeVisualizer({ flares, currentTime, cityData = [] }) {
  const globeEl = useRef();
  const [subsolar, setSubsolar] = useState({ lat: 0, lng: 0 });

  // Set up hemisphere shading
  const [hemisphereRGB, setHemisphereRGB] = useState('navy');
  const [hemisphereOpacity, setHemisphereOpacity] = useState(0.75);

const rgbMap = {
  green: '0,255,0',
  yellow: '255,255,0',
  red: '255,0,0',
  navy: '0,0,128',
};


  const hemiMeshRef = useRef();
  if (!hemiMeshRef.current) {
    const geom = new THREE.SphereGeometry(1.01, 32, 32, 0, Math.PI);
    const mat = new THREE.MeshBasicMaterial({
      color: `rgba(${rgbMap[hemisphereRGB]}, ${hemisphereOpacity})`,
      side: THREE.DoubleSide,
      transparent: true,
    });
    hemiMeshRef.current = new THREE.Mesh(geom, mat);
  }

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.8;
    }
  }, []);

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

  // Convert flares to arc format
  const flareArcs = flares.map((f) => ({
    startLat: f.markerLat,
    startLng: f.markerLng,
    endLat: f.markerLat + 15, // outward direction
    endLng: f.markerLng + 15,
    color: f.classType === 'X' ? ['red'] : ['orange'],
    flare: f,
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

      // City lights
      pointsData={cityData}
      pointLat="lat"
      pointLng="lng"
      pointColor={() => 'yellow'}
      pointRadius={0.05}
      pointAltitude={0.01}

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
      onArcClick={(a) =>
        alert(`Flare ${a.flare.classType} peaked at ${a.flare.peakTime}`)
      }

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
