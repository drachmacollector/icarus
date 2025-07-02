// src/HeatMap/components/HeatMapGlobe.jsx
import React from 'react';
import Globe from 'react-globe.gl';
// import useHeatmapData from '../hooks/useHeatmapData';

// export default function HeatMapGlobe({ startDate, endDate }) {
//   // get merged points
//   const { points } = useHeatmapData({ startDate, endDate });

export default function HeatMapGlobe({ points }) {

  return (
    <Globe
      style={{ width: '100%', height: '100vh' }}
      globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundColor="rgba(0,0,0,0)"

      // heatmap layer
        heatmapsData={
          points && points.length
            ? [{ 
                points,
                bandwidth: 4, 
                weight: d => d.weight,
                lat:    d => d.lat,
                lng:    d => d.lng,
                baseAltitude: 0.01,
                topAltitude:  0.2
              }]
            : []
        }
      // must tell Globe how to access your props
      heatmapPoints="points"
      heatmapPointLat="lat"
      heatmapPointLng="lng"
      heatmapPointWeight="weight"
      heatmapBandwidth="bandwidth"
      heatmapBaseAltitude="baseAltitude"
      heatmapTopAltitude="topAltitude"
      heatmapsTransitionDuration={500}
    />
  );
}
