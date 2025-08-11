import React, { useState, useEffect } from 'react';
import Controls from './panels/Controls';
import MapView from './panels/MapView'; // Import the new MapView component
import { parseCSV } from '../utils/utils.js';

const CharlotteSimulator = () => {
  const [fullWeatherData, setFullWeatherData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [raceRoute, setRaceRoute] = useState(null);
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
      console.log('Race route loaded.');
    } catch (error) {
      console.error('Error reading route file:', error);
    }
  };

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
          <MapView /> {/* Place the MapView component here */}
        </div>
        <div className="main-panel__status-bar"></div>
        <div className="main-panel__weather-bar"></div>
        <div className="main-panel__elevation-profile"></div>
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