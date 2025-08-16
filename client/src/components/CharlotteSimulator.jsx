import React, { useState, useEffect } from 'react';
import Controls from './panels/Controls';
import MapView from './panels/MapView';
import { parseCSV, calculateAdjustedPace } from '../utils/utils.js';
import { getCoordsFromKML, calculateMileMarkers, getElevationForMileMarkers } from '../utils/geoUtils.js';

const CharlotteSimulator = () => {
  const [fullWeatherData, setFullWeatherData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [raceRoute, setRaceRoute] = useState(null);
  const [mileMarkers, setMileMarkers] = useState(null);
  const [targetPace, setTargetPace] = useState('12:00');
  const [defaultYear] = useState('2024');

  useEffect(() => {
    if (fullWeatherData) {
      handleYearSelect(defaultYear);
    }
  }, [fullWeatherData]);

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

  const handleRouteLoad = async (file) => {
    try {
      const content = await file.text();
      setRaceRoute(content);
      console.log('Route file loaded.');

      const coords = getCoordsFromKML(content);
      if (!coords) return;
      console.log('Coordinates extracted from KML.');

      const markersWithoutElevation = calculateMileMarkers(coords);
      console.log('Mile marker coordinates calculated. Fetching their elevations...');

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
  
  const handlePaceChange = (pace) => {
    setTargetPace(pace);
  };
  
  const handleStartSimulation = (pace) => {
    console.log(`Starting simulation with target pace: ${pace}`);
    // This is where the main animation loop will be triggered.
    // We can test the pace function here:
    if (mileMarkers) {
      const testPaceAtMile10 = calculateAdjustedPace(pace, 10.5, mileMarkers);
      console.log(`Adjusted pace at mile 10.5 would be: ${testPaceAtMile10} seconds/mile.`);
      
      const testPaceAtMile21 = calculateAdjustedPace(pace, 21.0, mileMarkers);
      console.log(`Adjusted pace at mile 21.0 (with fatigue) would be: ${testPaceAtMile21} seconds/mile.`);
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
          onPaceChange={handlePaceChange}
          onStartSimulation={handleStartSimulation}
        />
      </div>
    </div>
  );
};

export default CharlotteSimulator;