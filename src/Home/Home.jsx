import React from 'react';
import './Home.css';
import earthVideo from '../../public/earth2.mp4'; // adjust path as needed

const Home = () => {
  return (
    <div className="home-container">
      <video autoPlay loop muted className="bg-video">
        <source src={earthVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="overlay-content">
        <h1>Planet <br /> Earth</h1>
      </div>
    </div>
  );
};

export default Home;
