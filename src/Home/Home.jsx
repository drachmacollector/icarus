import React, { useEffect } from 'react';
import './Home.css';

const Home = () => {
  useEffect(() => {
    const video = document.getElementById('bgVideo');
    if (video) {
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = video.duration / 2;
      });
    }
  }, []);

  return (
    <div className="home-container">
      <video id="bgVideo" autoPlay loop muted className="bg-video">
        <source src="/earth2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="overlay-content">
        <h1>Icarus</h1>
        <p>Mapping solar fury & auroral beauty across the Earth's skies</p>
      </div>
    </div>
  );
};

export default Home;
