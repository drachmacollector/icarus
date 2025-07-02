// src/pages/Timeline.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import './Timeline.css';


import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaSun, FaBolt, FaRadiationAlt, FaGlobe, FaCircleNotch } from "react-icons/fa";

const API_KEY = "7xojuNa1rk1mpSTQ5ZPG1oD60Yo4FvKUOuvIfn3w";
const BASE_URL = "https://api.nasa.gov/DONKI";

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30); // Default: last 30 days

  const endpoints = {
    flares: "FLR",
    cmes: "CME",
    gst: "GST",
    hss: "HSS",
  };

  const loadEvents = async () => {
    setLoading(true);
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    try {
      const [flaresRes, cmesRes, gstRes, hssRes] = await Promise.all([
        axios.get(`${BASE_URL}/${endpoints.flares}?startDate=${startDate}&endDate=${endDate}&api_key=${API_KEY}`),
        axios.get(`${BASE_URL}/${endpoints.cmes}?startDate=${startDate}&endDate=${endDate}&api_key=${API_KEY}`),
        axios.get(`${BASE_URL}/${endpoints.gst}?startDate=${startDate}&endDate=${endDate}&api_key=${API_KEY}`),
        axios.get(`${BASE_URL}/${endpoints.hss}?startDate=${startDate}&endDate=${endDate}&api_key=${API_KEY}`),
      ]);

      const solarFlares = flaresRes.data.map(event => ({
        date: event.peakTime?.split("T")[0] || "Unknown",
        title: "Solar Flare",
        description: `Class: ${event.classType || "N/A"}, Source: ${event.sourceLocation || "Unknown"}`,
        icon: <FaSun />,
        color: "#FFD700",
        link: `https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/FLR/${event.flrID}`,
      }));

      const cmes = cmesRes.data.map(event => ({
        date: event.startTime?.split("T")[0] || "Unknown",
        title: "Coronal Mass Ejection (CME)",
        description: `Note: ${event.note || "No notes"}`,
        icon: <FaCircleNotch />,
        color: "#4db8ff",
        link: `https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/${event.cmeAnalyses?.[0]?.cmeID || ""}`,
      }));

      const geomagneticStorms = gstRes.data.map(event => ({
        date: event.startTime?.split("T")[0] || "Unknown",
        title: "Geomagnetic Storm",
        description: `Kp Index: ${(event.kpIndex ?? []).map(k => k.kpIndex).join(", ") || "N/A"}`,
        icon: <FaBolt />,
        color: "#e67e22",
        link: `https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/GST/${event.gstID}`,
      }));

      const auroras = hssRes.data.map(event => ({
        date: event.eventTime?.split("T")[0] || "Unknown",
        title: "Aurora Event (HSS)",
        description: `Instruments: ${(event.instruments ?? []).map(i => i.displayName).join(", ") || "N/A"}`,
        icon: <FaRadiationAlt />,
        color: "#00e1ff",
        link: `https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/HSS/${event.hssID}`,
      }));

      const allEvents = [...solarFlares, ...cmes, ...geomagneticStorms, ...auroras].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setEvents(allEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [days]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📅 Space Weather Timeline</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>Show events from:</label>
        <select value={days} onChange={e => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {loading ? (
        <div className="loader">🚀 Loading space events...</div>
      ) : (
        <VerticalTimeline>
          {events.map((event, index) => (
            <VerticalTimelineElement
              key={index}
              date={event.date}
              iconStyle={{ background: event.color, color: "#fff" }}
              icon={event.icon}
              contentStyle={{ borderTop: `4px solid ${event.color}` }}
            >
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  🔗 View Event Source
                </a>
              )}
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      )}
    </div>
  );
};

export default Timeline;
