import React, { useState, useEffect } from 'react';
import Controls from './panels/Controls';
import MapView from './panels/MapView';
import { parseCSV } from '../utils/utils.js';
import { getCoordsFromKML, calculateMileMarkers, getElevationForMileMarkers } from '../utils/geoUtils.js';

const CharlotteSimulator = () => {
  const [fullWeatherData, setFullWeatherData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [raceRoute, setRaceRoute] = useState(null);
  const [mileMarkers, setMileMarkers] = useState(null);
  const [defaultYear] = useState('2024');

  useEffect(() => {
    if (fullWeatherData) {
      handleYearSelect(defaultYear);
    }
  }, [fullWeatherData]);

  const handleRouteLoad = async (file) => {
    try {
      const content = await file.text();
      setRaceRoute(content); // Set KML text for the map overlay
      console.log('Route file loaded.');

      // Step 1: Get coordinates from the KML file.
      const coords = getCoordsFromKML(content);
      if (!coords) return;
      console.log('Coordinates extracted from KML.');

      // Step 2: Calculate the lat/lon for each mile marker.
      const markersWithoutElevation = calculateMileMarkers(coords);
      console.log('Mile marker coordinates calculated. Fetching their elevations...');

      // Step 3: Make a single API call to get elevation for only the markers.
      const finalMarkers = await getElevationForMileMarkers(markersWithoutElevation);
      setMileMarkers(finalMarkers);
      console.log('Final mile markers with elevation created.', finalMarkers);

    } catch (error) {
      console.error('Error handling route file:', error);
    }
  };

  const handleYearSelect = (year) => {
    if (!fullWeatherData) return;
    const filteredData = fullWeatherData.filter(record => 
      new Date(record.date).getFullYear() === parseInt(year, 10)
    );
    setSimulationData(filteredData);
    console.log(`Weather data filtered for ${year}.`);
  };

  const handleWeatherLoad = async (file) => {
    try {
      const content = await file.text();
      const parsedData = parseCSV(content);
      setFullWeatherData(parsedData); 
      console.log('Full weather data loaded and parsed.');
    } catch (error) {
      console.error('Error reading weather file:', error);
    }
  };

  return (
    <div className="charlotte-simulator">
      <div className="charlotte-simulator__main-panel">
        <div className="main-panel__map-view">
          <MapView raceRoute={raceRoute} />
        </div>
        <div className="main-panel__status-bar">
          {/* StatusBar component will go here */}
        </div>
        <div className="main-panel__weather-bar">
          {/* WeatherBar component will go here */}
        </div>
        <div className="main-panel__elevation-profile">
          {/* ElevationProfile component will go here */}
        </div>
      </div>

      <div className="charlotte-simulator__control-panel">
        <Controls
          onFileLoad={handleWeatherLoad}
          onRouteLoad={handleRouteLoad}
          onYearSelect={handleYearSelect}
        />
      </div>
    </div>
  );
};

export default CharlotteSimulator;