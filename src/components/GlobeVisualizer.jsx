// src/components/GlobeVisualizer.jsx
import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';               // ← add this
 import { computeSubsolarPoint } from '../utils/geoUtils';

 export default function GlobeVisualizer({ flares, currentTime }) {
   const globeEl = useRef();
   const [subsolar, setSubsolar] = useState({ lat: 0, lng: 0 });
const [hemisphereRGB, setHemisphereRGB] = useState('green');
const [hemisphereOpacity, setHemisphereOpacity] = useState(0.2);
const rgbMap = {
  green: '0,255,0',
  yellow: '255,255,0',
  red: '255,0,0',
};


   // Memoize a single hemi‑mesh so we don’t recreate on every render
   const hemiMeshRef = useRef();
   if (!hemiMeshRef.current) {
     const geom = new THREE.SphereGeometry(1.01, 32, 32, 0, Math.PI);
     const mat = new THREE.MeshBasicMaterial({
       color: `rgba(${rgbMap[hemisphereRGB]}, ${hemisphereOpacity})`
,
       side: THREE.DoubleSide,
       transparent: true,
     });
     hemiMeshRef.current = new THREE.Mesh(geom, mat);
   }

useEffect(() => {
  const pt = computeSubsolarPoint(currentTime);
  setSubsolar(pt);

  const worst = flares.reduce((acc, f) => {
    if (f.classType === 'X') return 'X';
    if (f.classType === 'M' && acc !== 'X') return 'M';
    return acc;
  }, null);

let rgbColor = 'green';
let opacity = 0.2;

if (worst === 'X') {
  rgbColor = 'red';
  opacity = 0.3;
} else if (worst === 'M') {
  rgbColor = 'yellow';
  opacity = 0.3;
}

setHemisphereRGB(rgbColor);
setHemisphereOpacity(opacity);

hemiMeshRef.current.material.color.setStyle(rgbColor);
hemiMeshRef.current.material.opacity = opacity;
hemiMeshRef.current.material.needsUpdate = true;

}, [currentTime, flares]);


const pointsData = flares.map(f => {
  console.log('👉 flare object:', f);  // verify keys
  return {
    lat: f.lat,
    lng: f.lng,
    size: f.size || 0.3,
    color: f.color || 'orange',
    flare: f
  };
});

   console.log("🔥 Points passed to Globe:", pointsData);


   return (
     <Globe
       ref={globeEl}
       globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
       backgroundColor="#000011"

       // Custom hemisphere layer
       customLayerData={[subsolar]}
       customThreeObject={(d) => hemiMeshRef.current}
       customThreeObjectUpdate={(obj, { lat, lng }) => {
         obj.position.setFromSphericalCoords(
           1,
           (90 - lat) * (Math.PI / 180),
           (lng + 180) * (Math.PI / 180)
         );
         obj.lookAt(obj.position.clone().multiplyScalar(2));
       }}

       // Flare points
       pointsData={pointsData}
       pointLat="lat"
       pointLng="lng"
       pointColor="color"
       pointAltitude={0.02}
       pointRadius="size"
       onPointClick={(p) =>
         alert(`Flare ${p.flare.classType} peaked at ${p.flare.peakTime}`)
       }
     />
   );
}
