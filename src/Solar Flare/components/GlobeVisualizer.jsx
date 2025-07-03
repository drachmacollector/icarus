// src/Solar Flare/components/GlobeVisualizer.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from "react-router-dom";
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { computeSubsolarPoint } from '../utils/geoUtils';
import CmeTracker from '../../CME/components/CmeTracker';
import useFlareData from "../hooks/useFlareData";
import { format } from 'date-fns';
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

  const { flares: fetchedFlares, loading, error } = useFlareData({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined
  });

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

    const worst = fetchedFlares.reduce((acc, f) => {
      if (f.classType?.startsWith('X')) return 'X';
      if (f.classType?.startsWith('M') && acc !== 'X') return 'M';
      if (f.classType?.startsWith('C') && !['X', 'M'].includes(acc)) return 'C';
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
  }, [currentTime, fetchedFlares]);

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

  const isInRange = (date) => {
    if (startDate && endDate) {
      return date >= normStart && date <= normEnd;
    } else if (selectedDate) {
      return isSameDay(date, normSelected);
    }
    return true;
  };

  const filteredFlares = fetchedFlares.filter(f => {
    const flareDate = normalizeDate(new Date(f.peakTime));
    if (!isInRange(flareDate)) return false;
    if (selectedClass !== 'All' && !f.classType?.startsWith(selectedClass)) return false;
    return true;
  });

  const flarePoints = filteredFlares.map(f => {
    let color = 'gray';
    if (f.classType?.startsWith('X')) color = 'red';
    else if (f.classType?.startsWith('M')) color = 'orange';
    else if (f.classType?.startsWith('C')) color = 'green';
    else if (f.classType?.startsWith('B')) color = 'gray';

    return {
      lat: f.lat,
      lng: f.lng,
      size: f.size || 0.3,
      color,
      flare: f
    };
  });

  const flareArcs = filteredFlares.map(f => ({
    startLat: f.lat,
    startLng: f.lng,
    endLat: f.lat + 15,
    endLng: f.lng + 15,
    color: f.classType?.startsWith('X') ? ['red'] : ['orange'],
    flare: f
  }));

  const filteredHeatmap = heatmapData.filter(d => {
    const dataDate = normalizeDate(new Date(d.date));
    return isInRange(dataDate);
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
              onChange={date => {
                setSelectedDate(date);
                setStartDate(null);
                setEndDate(null);
              }}
              dateFormat="yyyy-MM-dd"
              isClearable
              placeholderText="Select date"
              maxDate={new Date()}
            />
          </div>

          <div>
            <label>⏱ Filter by date range:</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              minDate={new Date("2010-01-01")}
              placeholderText="Start Date"
              className="datepicker"
            />
          </div>

          <div className="date-picker-group">
            <label className="date-label">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              minDate={startDate || new Date("2010-01-01")}
              placeholderText="End Date"
              className="datepicker"
            />
          </div>

          <div>
            <label>☀️ Filter by flare class:</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="All">All</option>
              <option value="X">X (Major)</option>
              <option value="M">M (Moderate)</option>
              <option value="C">C (Minor)</option>
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
      </div>
    </div>
  );
}
