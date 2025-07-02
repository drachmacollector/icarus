import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import useFlareData from "./Solar Flare/hooks/useFlareData";
import GlobeVisualizer from "./Solar Flare/components/GlobeVisualizer";
import Navbar from "./Navbar/Navbar";
import RiskPage from "./Solar Flare/pages/risk";
import StatusPage from "./Solar Flare/pages/status";
import CmeTracker from './CME/components/CmeTracker';
import News from './news/News'; 
import AuroraForecast from './Aurora/components/AuroraForecast';
import HeatMapGlobe from './HeatMap/components/HeatMapGlobe';
import HeatMapDashboard from './HeatMap/components/HeatMapDashboard';
import Timeline from "./timeline/Timeline";
import Home from "./home/Home";

import './App.css'; // 

export default function App() {
  const { flares, loading, error, refresh } = useFlareData();
  const [currentTime, setCurrentTime] = useState(new Date());

  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>

          <Route path="/" element={<Home />} />

          <Route
            path="/Flare"
            element={<GlobeVisualizer flares={flares} currentTime={currentTime} />
            }/>
          <Route path="/status" element={<StatusPage flares={flares} />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/CmeTracker" element={<CmeTracker />} />
           <Route path="/News" element={<News />} />
          <Route path="/AuroraForecast" element={<AuroraForecast />} />
          <Route path="/HeatMapDashboard" element={<HeatMapDashboard />} />
          <Route path="/timeline" element={<Timeline />} />
        </Routes>
      </div>
    </Router>
  );
}
