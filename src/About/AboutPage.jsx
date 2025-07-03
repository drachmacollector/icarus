import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./AboutPage.css";
import {
  FaNewspaper,
  FaSun,
  FaGlobe,
  FaFireAlt,
  FaMagic,
  FaStream,
  FaArrowUp
} from "react-icons/fa";

const features = [
  {
    icon: <FaNewspaper />,
    title: "Space News Feed",
    description:
      "Curated headlines and updates from NASA, ESA, and trusted sources.",
    api: "NASA Breaking News RSS Feed, ESA Space News Feed"
  },
  {
    icon: <FaFireAlt />,
    title: "Solar Flare Tracker",
    description:
      "Real-time flare detection with mapped locations on a 3D globe.",
    api: "NASA DONKI API - Solar Flares"
  },
  {
    icon: <FaSun />,
    title: "CME Visualizer",
    description:
      "Animated trajectory and risk estimation of Coronal Mass Ejections.",
    api: "NASA DONKI API - CME Endpoint"
  },
  {
    icon: <FaMagic />,
    title: "Aurora Forecast",
    description:
      "Dynamic aurora ring animations based on NOAA Kp Index.",
    api: "NOAA SWPC Kp Index API"
  },
  {
    icon: <FaGlobe />,
    title: "Global Heatmap",
    description:
      "Visual heatmaps of radiation and geomagnetic disturbances.",
    api: "NOAA Real-Time Geomagnetic Data"
  },
  {
    icon: <FaStream />,
    title: "Interactive Timeline",
    description:
      "Scroll through solar activity history and predictions.",
    api: "NASA DONKI API, Custom Time Series Data"
  }
];

const scientificTerms = [
  {
    term: "Solar Flare",
    definition:
      "A sudden burst of radiation from the sun, often linked with sunspots. Can disrupt radio communications.",
    link: "https://solarscience.msfc.nasa.gov/flares.shtml"
  },
  {
    term: "CME (Coronal Mass Ejection)",
    definition:
      "Huge plasma explosions from the sun's corona. Can hit Earth's magnetic field and cause geomagnetic storms.",
    link: "https://www.swpc.noaa.gov/phenomena/coronal-mass-ejections"
  },
  {
    term: "Kp Index",
    definition:
      "A planetary index measuring geomagnetic activity on a scale from 0 (calm) to 9 (extreme).",
    link: "https://www.swpc.noaa.gov/products/planetary-k-index"
  },
  {
    term: "Aurora",
    definition:
      "Colorful light displays in the sky caused by charged solar particles interacting with Earth's magnetic field.",
    link: "https://www.swpc.noaa.gov/phenomena/aurora"
  },
  {
    term: "Geomagnetic Storm",
    definition:
      "A disturbance in Earth’s magnetosphere caused by solar wind and CMEs. Can affect GPS, power grids, and satellites.",
    link: "https://www.swpc.noaa.gov/phenomena/geomagnetic-storms"
  },
  {
    term: "DONKI API",
    definition:
      "NASA’s “Database Of Notifications, Knowledge, Information” for space weather events.",
    link: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/"
  }
];

const AboutPage = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800 });

    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="about-container">
      <section className="hero">
        <h1>🚀 Radio Blackout Dashboard</h1>
        <p>
          A next-gen space weather dashboard visualizing solar events in real
          time — with 3D animations, predictive analytics, and global impact
          overlays.
        </p>
      </section>

      {features.map((feature, index) => (
        <section className="feature" data-aos="fade-up" key={index}>
          <div className="icon">{feature.icon}</div>
          <div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
            <p className="api-line">
              📡 <strong>Powered by:</strong> {feature.api}
            </p>
          </div>
        </section>
      ))}

      <section className="explain-section" data-aos="fade-up">
        <h2>🔬 Scientific Terms Explained</h2>
        <ul>
          {scientificTerms.map((item, idx) => (
            <li key={idx}>
              <strong>{item.term}:</strong> {item.definition}{" "}
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                Learn More ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      {showScroll && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <FaArrowUp />
        </button>
      )}

      <footer className="footer">
        Built with 🚀 passion and 📡 science.
      </footer>
    </div>
  );
};

export default AboutPage;
