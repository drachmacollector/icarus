// src/hooks/useFlareData.js
import { useState, useEffect, useCallback } from 'react';
import { fetchFlareData } from '../utils/api';
import { defaultStartDateUTC, defaultEndDateUTC } from '../utils/timeUtils';
import { mapHelioToEarth } from '../utils/geoUtils';

/**
 * Custom hook to fetch, cache, and refresh DONKI Solar Flare data.
 */
export default function useFlareData() {
  const [flares, setFlares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch raw flare events
      const data = await fetchFlareData({
        startDate: defaultStartDateUTC(),
        endDate: defaultEndDateUTC(),
        catalog: 'ALL',       // default catalog per spec
        classType: 'ALL',     // fetch all classes, we'll filter downstream
        apiKey: 'DEMO_KEY'    // replace with your NASA API key
      });

      // Map each event to include marker lat/lng on Earth
      const processed = data.map(event => {
        // Convert heliographic coords into (lat,lng) on globe
        const [helioLat, helioLon] = event.sourceLocation
          .split(',')
          .map(s => parseFloat(s.trim()));
        const { lat, lng } = mapHelioToEarth(helioLat, helioLon);

        return {
          ...event,
          markerLat: lat,
          markerLng: lng
        };
      });

      setFlares(processed);
    } catch (err) {
      console.error('Error fetching flare data:', err);
      setError('Failed to load solar flare data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Expose refresh to manually re-fetch
  const refresh = () => {
    loadData();
  };

  return { flares, loading, error, refresh };
}
