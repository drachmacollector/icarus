// src/Solar Flare/components/GlobeVisualizer.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { computeSubsolarPoint } from '../utils/geoUtils';
import CmeTracker from '../../CME/components/CmeTracker';
import './Globe.css';

export default function GlobeVisualizer({
  flares,
  currentTime,
  cityData = [],
  heatmapData = []
}) {
  const location = useLocation();
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

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const normalizeDate = (date) => {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const normSelected = normalizeDate(selectedDate);
  const normStart = normalizeDate(startDate);
  const normEnd = normalizeDate(endDate);

  const filteredFlares = flares.filter(f => {
    const flareDate = new Date(f.peakTime);
    const normFlareDate = normalizeDate(flareDate);

    if (selectedDate && !isSameDay(normFlareDate, normSelected)) return false;
    if (startDate && normFlareDate < normStart) return false;
    if (endDate && normFlareDate > normEnd) return false;
    if (selectedClass !== 'All' && selectedClass !== 'B' && f.classType !== selectedClass) return false;

    return true;
  });

  const flarePoints = filteredFlares.map(f => ({
    lat: f.lat,
    lng: f.lng,
    size: f.size || 0.3,
    color: f.classType === 'X' ? 'red' : f.classType === 'M' ? 'orange' : 'yellow',
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
    const dataDate = normalizeDate(new Date(d.date));
    if (selectedDate && !isSameDay(dataDate, normSelected)) return false;
    if (startDate && dataDate < normStart) return false;
    if (endDate && dataDate > normEnd) return false;
    return true;
  });

  const heatPoints = filteredHeatmap.map(d => {
    const intensity = Math.max(0, Math.min(1, d.intensity ?? 0));
    let color = 'yellow';
    if (intensity > 0.75) color = 'red';
    else if (intensity > 0.5) color = 'orange';
    else if (intensity > 0) color = 'green';

    return {
      lat: d.lat,
      lng: d.lng,
      size: intensity * 0.4,
      color
    };
  });

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {showMode === 'flares' && (
        <div className="controls-container">
          <div>
            <label>📅 Filter by exact date:</label>
            <DatePicker
              className="datepicker-input"
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
              selectsRange
              className="datepicker-input"
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setStartDate(update[0]);
                setEndDate(update[1]);
              }}
              isClearable
              dateFormat="yyyy-MM-dd"
              placeholderText="Select date range"
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
              <option value="B">B (Mild)</option>
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
        <CmeTracker selectedDate={selectedDate ? selectedDate.toISOString().slice(0, 10) : null} />
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
  );
}
