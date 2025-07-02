import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import useFlareData from "./hooks/useFlareData";
import GlobeVisualizer from "./components/GlobeVisualizer";
import Navbar from "./components/Navbar";
import RiskPage from "./pages/risk";
import StatusPage from "./pages/status";
import CmeTracker from './CME/components/CmeTracker';

export default function App() {
  const { flares, loading, error, refresh } = useFlareData();
  const [currentTime, setCurrentTime] = useState(new Date());

  return (
    <Router>
      <div style={{ position: "relative", height: "100vh", width: "100vw", color: "#fff" }}>
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={
              <>
                {loading && (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                    Loading solar flare data...
                  </div>
                )}
                {error && (
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      background: "rgba(255,0,0,0.8)",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                    }}
                  >
                    {error}
                  </div>
                )}
                <GlobeVisualizer flares={flares} currentTime={currentTime} />
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "90%",
                  }}
                >
                  <button
                    onClick={refresh}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem 1rem",
                      background: "#007acc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Refresh Data
                  </button>
                </div>
              </>
            }
          />

          <Route path="/status" element={<StatusPage flares={flares} />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/CmeTracker" element={<CmeTracker />} />
        </Routes>
      </div>
    </Router>
  );
}
