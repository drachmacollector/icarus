import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <video autoPlay loop muted className="bg-video">
        <source src="/earth2.mp4" type="video/mp4" />
      </video>

      <div className="overlay-content">
        <h1>Icarus</h1>
        <p>Mapping solar fury & auroral beauty across the Earth's skies</p>
      </div>
      
    </div>
  );
};

export default Home;
