// src/App.jsx
import React, { useState, useEffect } from 'react';
import useFlareData from './hooks/useFlareData';
import GlobeVisualizer from './components/GlobeVisualizer';
import TimelineSlider from './components/TimelineSlider';
import Legend from './components/Legend';

export default function App() {
  // Fetch and store flare events
  const { flares, loading, error, refresh } = useFlareData();

  // Time state: currentTime drives globe shading & markers
  const [currentTime, setCurrentTime] = useState(new Date());
  const [playing, setPlaying] = useState(false);

  // Define the 24‑hour window for playback
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

  // Auto‑advance currentTime when playing
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = new Date(prev.getTime() + 60 * 1000); // +1 minute
        return next > endTime ? startTime : next;
      });
    }, 1000); // 1 second real time = 1 minute sim time
    return () => clearInterval(interval);
  }, [playing, startTime, endTime]);

  // Filter flares up to currentTime (and only M/X classes)
  const activeFlares = flares
    .filter(f => {
      const t = new Date(f.peakTime);
      return (f.classType === 'M' || f.classType === 'X') && t <= currentTime;
    });

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <Legend />

      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', color: '#fff'
        }}>
          Loading solar flare data...
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(255,0,0,0.8)', color: '#fff',
          padding: '0.5rem 1rem', borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <GlobeVisualizer
        flares={flares}
        currentTime={currentTime}
      />

      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%'
      }}>
        <TimelineSlider
          startTime={startTime}
          endTime={endTime}
          currentTime={currentTime}
          onTimeChange={setCurrentTime}
          playing={playing}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <button
          onClick={refresh}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#007acc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
