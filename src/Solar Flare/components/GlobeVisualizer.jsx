// src/Solar Flare/components/GlobeVisualizer.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { computeSubsolarPoint } from '../utils/geoUtils';
import useFlareData from "../hooks/useFlareData";
import { format } from 'date-fns';
import './Globe.css';

export default function GlobeVisualizer({
  cityData = [],
  heatmapData = []
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const globeEl = useRef();
  const [subsolar, setSubsolar] = useState({ lat: 0, lng: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate]       = useState(null);
  const [endDate, setEndDate]           = useState(null);
  const [selectedClass, setSelectedClass] = useState('All');

  // Fetch flares
  const { flares: fetchedFlares, loading, error } = useFlareData({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate:   endDate   ? format(endDate,   "yyyy-MM-dd") : undefined
  });

  // Hemisphere mesh (unchanged)
  const hemiMeshRef = useRef();
  useEffect(() => {
    if (!hemiMeshRef.current) {
      const geom = new THREE.SphereGeometry(1.01, 75, 75, 0, Math.PI);
      const mat  = new THREE.MeshBasicMaterial({
        color: 'rgba(0,0,128,0.75)', side: THREE.DoubleSide, transparent: true
      });
      hemiMeshRef.current = new THREE.Mesh(geom, mat);
    }
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.8;
    }
  }, [autoRotate]);

  // Subsolar shading (unchanged)
  useEffect(() => {
    const now = new Date();
    const pt  = computeSubsolarPoint(now);
    setSubsolar(pt);
  }, [fetchedFlares, selectedDate]);

  // Filter by date/class
  const normalize = d => d && new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isSameDay = (a,b) => a && b && a.getTime()===b.getTime();
  const inRange = date => {
    const d = normalize(new Date(date));
    if (selectedDate) return isSameDay(d, normalize(selectedDate));
    if (startDate && endDate) {
      const s = normalize(startDate), e = normalize(endDate);
      return d >= s && d <= e;
    }
    return true;
  };

  const filtered = fetchedFlares.filter(f => {
    if (!inRange(f.peakTime)) return false;
    if (selectedClass!=='All' && !f.classType.startsWith(selectedClass)) return false;
    return f.lat!=null;
  });

  // Build rods as pointsData
  const pointsData = filtered.map(f => {
    const cls = f.classType[0]; // 'X','M','C', etc.
    // define color, length, radius by class
    let color='green', altitude=0.05, radius=0.2;
    if (cls==='X') { color='red';     altitude=0.3; radius=0.5; }
    else if (cls==='M'){ color='yellow'; altitude=0.2; radius=0.4; }
    else if (cls==='C'){ color='greenyellow'; altitude=0.1; radius=0.3; }

    return {
      lat: f.lat,
      lng: f.lng,
      color,
      altitude,
      radius,
      flare: f
    };
  });

  return (
    <div className="globe-container">
      <div className="controls-container">
        <button
          className="control-button"
          onClick={() => navigate('/status')}
        >
          📊 Status Page
        </button>

        <div>
          <label>📅 Exact Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={d => {
              setSelectedDate(d);
              setStartDate(null); setEndDate(null);
            }}
            dateFormat="yyyy-MM-dd"
            isClearable
            placeholderText="Select date"
          />
        </div>

        <div>
          <label>⏱ Date Range:</label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            selectsStart startDate={startDate} endDate={endDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Start"
          />
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            selectsEnd   startDate={startDate} endDate={endDate}
            minDate={startDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="End"
          />
        </div>

        <div>
          <label>☀️ Flare Class:</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            <option>All</option>
            <option>X</option>
            <option>M</option>
            <option>C</option>
          </select>
        </div>
      </div>

      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="#000000"
        showAtmosphere
        atmosphereColor="blue"
        atmosphereAltitude={0.25}

        // rods as pointsData
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude="altitude"
        pointRadius="radius"
        onPointClick={p => alert(`Flare ${p.flare.classType} at ${p.flare.peakTime}`)}

        // Subsolar hemisphere shading
        customLayerData={[subsolar]}
        customThreeObject={() => hemiMeshRef.current}
        customThreeObjectUpdate={(obj, { lat, lng }) => {
          obj.position.setFromSphericalCoords(
            1,
            (90 - lat) * (Math.PI/180),
            (lng + 180) * (Math.PI/180)
          );
          obj.lookAt(obj.position.clone().multiplyScalar(2));
        }}
      />

      {loading && <div className="loading-overlay">Loading flares…</div>}
      {error   && <div className="error-overlay">Error loading data</div>}
    </div>
  );
}
