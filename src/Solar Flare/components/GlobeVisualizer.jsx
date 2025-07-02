// src/Solar Flare/components/GlobeVisualizer.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { computeSubsolarPoint } from '../utils/geoUtils';
import HeatMapDashboard from '../../HeatMap/components/HeatMapDashboard';
import CmeTracker from '../../CME/components/CmeTracker';
import './Globe.css';


export default function GlobeVisualizer({
  flares,
  currentTime,
  cityData = [],
  heatmapData = []
}) {
  const globeEl = useRef();
  const [subsolar, setSubsolar] = useState({ lat: 0, lng: 0 });
  const [hemisphereRGB, setHemisphereRGB] = useState('navy');
  const [hemisphereOpacity, setHemisphereOpacity] = useState(0.75);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showMode, setShowMode] = useState('flares');

  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedClass, setSelectedClass] = useState('All');

  const rgbMap = {
    green: '0,255,0',
    yellow: '255,255,0',
    red: '255,0,0',
    navy: '0,0,128',
  };

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

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = autoRotate;
      globeEl.current.controls().autoRotateSpeed = 0.8;
    }
  }, [autoRotate]);

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

  const selectedDateStr = selectedDate ? selectedDate.toISOString().slice(0, 10) : null;

  const filteredFlares = flares.filter(f => {
    const flareDate = new Date(f.peakTime);
    if (selectedDate && f.peakTime.slice(0, 10) !== selectedDateStr) return false;
    if (startDate && flareDate < startDate) return false;
    if (endDate && flareDate > endDate) return false;
    if (selectedClass !== 'All' && f.classType !== selectedClass) return false;
    return true;
  });

  const flarePoints = filteredFlares.map(f => ({
    lat: f.lat,
    lng: f.lng,
    size: f.size || 0.3,
    color: f.classType === 'X' ? 'red' : f.classType === 'M' ? 'orange' : 'green',
    flare: f
  }));

  const flareArcs = filteredFlares.map(f => ({
    startLat: f.lat,
    startLng: f.lng,
    endLat: f.lat + 15,
    endLng: f.lng + 15,
    color: f.classType === 'X' ? ['red'] : ['orange'],
    flare: f
  }));

  const filteredHeatmap = heatmapData.filter(d => {
    const dataDate = new Date(d.date);
    if (selectedDate && d.date.slice(0, 10) !== selectedDateStr) return false;
    if (startDate && dataDate < startDate) return false;
    if (endDate && dataDate > endDate) return false;
    return true;
  });

  const heatPoints = filteredHeatmap.map(d => {
    const intensity = Math.max(0, Math.min(1, d.intensity ?? 0));
    let color = 'green';
    if (intensity > 0.75) color = 'red';
    else if (intensity > 0.5) color = 'orange';
    else if (intensity > 0.25) color = 'yellow';

    return {
      lat: d.lat,
      lng: d.lng,
      size: intensity * 0.4,
      color
    };
  });

  return (
    <>
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {showMode === 'flares' && (
        <div className="controls-container">
          <div>
            <label>📅 Filter by exact date:</label>
            <DatePicker
              color="black"
              className="datepicker-input"
              style={{ width: '100%' }}
              selected={selectedDate}
              onChange={setSelectedDate}
              dateFormat="yyyy-MM-dd"
              isClearable
              placeholderText="Select date"
              maxDate={new Date()}
            />
          </div>

          <div>
            <label>⏱ Filter by date range:</label>
            <DatePicker
              className="datepicker-input"
              style={{ width: '100%' }}
              color="black"
              selectsRange
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Start date"
              maxDate={new Date()}
            />
            <DatePicker
            className="datepicker-input"
              style={{ width: '100%' }}
              color="black"
              selectsRange
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="End date"
              maxDate={new Date()}
            />
          </div>

          <div>
            <label>☀️ Filter by flare class:</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="All">All</option>
              <option value="X">X (Major)</option>
              <option value="M">M (Moderate)</option>
              <option value="C">C (Minor)</option>
              <option value="C">B (Mild)</option>
            </select>
          </div>
        </div>
        
      )}
      {showMode === 'flares' && (
        <Globe
          ref={globeEl}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
          showAtmosphere
          atmosphereColor="blue"
          atmosphereAltitude={0.25}
          backgroundColor="#000000"

          labelsData={flarePoints}
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
          onArcClick={a => alert(`Flare ${a.flare.classType} peaked at ${a.flare.peakTime}`)}

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
      )}

      {showMode === 'heatmap' && (
        <Globe
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
          showAtmosphere
          atmosphereColor="blue"
          atmosphereAltitude={0.25}
          backgroundColor="#000000"
          labelsData={heatPoints}
          labelLat="lat"
          labelLng="lng"
          labelText={() => ''}
          labelDotRadius="size"
          labelColor="color"
          labelAltitude={0.02}
        />
      )}

      {showMode === 'cme' && (
        <CmeTracker selectedDate={selectedDateStr} />
      )}

      <div className="top-buttons">
        {showMode === 'flares' && (
          <button onClick={() => setAutoRotate(prev => !prev)} className="control-button">
            {autoRotate ? '⏸ Pause Rotation' : '▶ Resume Rotation'}
          </button>
        )}
              <Link
                to="/status"
                className={`nav-link ${location.pathname === "/status" ? "active" : ""}`}
              >
                🗺️ Status Map
              </Link>
      </div>
    </div>
    </>
  );
}
