import React, { useState, useEffect } from 'react';
import Controls from './panels/Controls';
import MapView from './panels/MapView';
import { parseCSV } from '../utils/utils.js';
import { getElevationsFromKML, calculateMileMarkers } from '../utils/geoUtils.js';

const CharlotteSimulator = () => {
  const [fullWeatherData, setFullWeatherData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [raceRoute, setRaceRoute] = useState(null);
  const [elevationData, setElevationData] = useState(null);
  const [mileMarkers, setMileMarkers] = useState(null);
  const [defaultYear] = useState('2024');

  // This useEffect hook runs whenever `fullWeatherData` changes.
  // It ensures the data is filtered for the default year as soon as it's loaded.
  useEffect(() => {
    if (fullWeatherData) {
      handleYearSelect(defaultYear);
    }
  }, [fullWeatherData]);

  /**
   * Handles loading and parsing the weather data CSV file.
   */
  const handleWeatherLoad = async (file) => {
    try {
      const content = await file.text();
      const parsedData = parseCSV(content);
      setFullWeatherData(parsedData); // This state change will trigger the useEffect
      console.log('Full weather data loaded and parsed.');
    } catch (error) {
      console.error('Error reading weather file:', error);
    }
  };

  /**
   * Handles loading the KML route, then fetching elevation data and calculating mile markers.
   */
  const handleRouteLoad = async (file) => {
    try {
      const content = await file.text();
      setRaceRoute(content);
      console.log('Race route loaded. Fetching elevations...');

      // Get elevation data for the coordinates in the KML
      const elevations = await getElevationsFromKML(content);
      setElevationData(elevations);
      console.log('Elevation data fetched.');

      // If elevations were successfully fetched, calculate the mile markers
      if (elevations) {
        const markers = calculateMileMarkers(elevations);
        setMileMarkers(markers);
        console.log('Mile markers calculated.', markers);
      }

    } catch (error) {
      console.error('Error handling route file:', error);
    }
  };

  /**
   * Filters the full weather dataset based on the selected year.
   */
  const handleYearSelect = (year) => {
    if (!fullWeatherData) {
      console.log('Weather data not loaded yet. Please load a file first.');
      return;
    }
    
    const filteredData = fullWeatherData.filter(record => {
      const recordYear = new Date(record.date).getFullYear();
      return recordYear === parseInt(year, 10);
    });
    
    setSimulationData(filteredData);
    console.log(`Weather data filtered for ${year}. Found ${filteredData.length} records.`, filteredData.slice(0,5));
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