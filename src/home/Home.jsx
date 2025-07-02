// src/pages/Home.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

const API_KEY = 'uUyuflFaKFRMYjTibVoz0aQ04GxdWieHkp9f8rjH'; // Replace with your actual API key
const BASE_URL = "https://api.nasa.gov/DONKI";

const endpoints = {
  solarFlares: "FLR",
  cmes: "CME",
  geomagneticStorms: "GST",
  aurora: "HSS",
  radioBlackouts: "RBE",
};

const fetchData = async (endpoint) => {
  const today = new Date().toISOString().split('T')[0];
const startDate = today;
const endDate = today;

  const url = `${BASE_URL}/${endpoint}?startDate=${startDate}&endDate=${endDate}&api_key=${'uUyuflFaKFRMYjTibVoz0aQ04GxdWieHkp9f8rjH'}`;
  const { data } = await axios.get(url);
  return data;
};

const Home = () => {
  const [solarFlares, setSolarFlares] = useState([]);
  const [cmes, setCmes] = useState([]);
  const [geoStorms, setGeoStorms] = useState([]);
  const [aurora, setAurora] = useState([]);
  const [radioBlackouts, setRadioBlackouts] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setSolarFlares(await fetchData(endpoints.solarFlares));
        setCmes(await fetchData(endpoints.cmes));
        setGeoStorms(await fetchData(endpoints.geomagneticStorms));
        setAurora(await fetchData(endpoints.aurora));
        setRadioBlackouts(await fetchData(endpoints.radioBlackouts));
      } catch (err) {
        console.error("Error fetching DONKI data:", err);
      }
    };
    loadAll();
  }, []);

  const renderList = (items, renderItem) =>
    items.length > 0 ? (
      items.map(renderItem)
    ) : (
      <p className="no-data">No recent data available.</p>
    );

  return (
    <div className="container">
      <h1>🌌 Space Weather Home</h1>
      <section>
        <h2>🔆 Solar Flares</h2>
        {renderList(solarFlares, (item, i) => (
          <div key={i} className="card">
            <p>
              <strong>Class:</strong> {item.classType}
            </p>
            <p>
              <strong>Peak Time:</strong> {item.peakTime}
            </p>
            <p>
              <strong>Source:</strong> {item.sourceLocation}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2>☄️ CMEs</h2>
        {renderList(cmes, (item, i) => (
          <div key={i} className="card">
            <p>
              <strong>Start Time:</strong> {item.startTime}
            </p>
            <p>
              <strong>Note:</strong> {item.note}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2>🌍 Geomagnetic Storms</h2>
        {renderList(geoStorms, (item, i) => (
          <div key={i} className="card">
            <p>
              <strong>Start Time:</strong> {item.startTime}
            </p>
            <p>
              <strong>Kp Index:</strong>{" "}
              {item.kpIndex?.map((k) => k.kpIndex).join(", ")}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2>🌈 Aurora Events (HSS)</h2>
        {renderList(aurora, (item, i) => (
          <div key={i} className="card">
            <p>
              <strong>Event Time:</strong> {item.eventTime}
            </p>
            <p>
              <strong>Instruments:</strong>{" "}
              {item.instruments?.map((inst) => inst.displayName).join(", ")}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2>📡 Radio Blackouts</h2>
        {renderList(radioBlackouts, (item, i) => (
          <div key={i} className="card">
            <p>
              <strong>Start Time:</strong> {item.startTime}
            </p>
            <p>
              <strong>Class:</strong> {item.classType}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
