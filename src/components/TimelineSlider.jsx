// src/components/TimelineSlider.jsx
import React, { useEffect, useRef } from 'react';

export default function TimelineSlider({
  startTime,
  endTime,
  currentTime,
  onTimeChange,
  playing,
  onPlay,
  onPause
}) {
  const intervalRef = useRef();

  // Advance time when playing
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setNextTime();
      }, 1000); // 1 second = 1 minute (or adjust speed)
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const totalMinutes = Math.floor((endTime - startTime) / 60000);
  const currentMinutes = Math.floor((currentTime - startTime) / 60000);

  function setNextTime() {
    let next = new Date(currentTime.getTime() + 60000); // +1 minute
    if (next > endTime) {
      next = startTime;
    }
    onTimeChange(next);
  }

  function handleSliderChange(e) {
    const minutes = Number(e.target.value);
    const newTime = new Date(startTime.getTime() + minutes * 60000);
    onTimeChange(newTime);
  }

  return (
    <div className="timeline-slider" style={{ margin: '1rem' }}>
      <button onClick={playing ? onPause : onPlay}>
        {playing ? 'Pause' : 'Play'}
      </button>
      <input
        type="range"
        min={0}
        max={totalMinutes}
        value={currentMinutes}
        onChange={handleSliderChange}
        style={{ width: '60%', margin: '0 1rem' }}
      />
      <span>{currentTime.toISOString().slice(0,16).replace('T',' ') + ' UTC'}</span>
    </div>
  );
}
