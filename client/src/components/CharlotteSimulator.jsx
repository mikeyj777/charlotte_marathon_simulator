import React, { useState, useEffect } from 'react';
import Controls from './panels/Controls';
import MapView from './panels/MapView';
import { parseCSV } from '../utils/utils.js';

const CharlotteSimulator = () => {
  const [fullWeatherData, setFullWeatherData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [raceRoute, setRaceRoute] = useState(null);
  const [defaultYear] = useState('2024');

  // This useEffect hook runs whenever `fullWeatherData` changes
  useEffect(() => {
    // If the full dataset has been loaded, filter it by the default year.
    if (fullWeatherData) {
      handleYearSelect(defaultYear);
    }
  }, [fullWeatherData]); // The dependency array: this effect runs when this state changes

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

  const handleRouteLoad = async (file) => {
    try {
      const content = await file.text();
      setRaceRoute(content); // Store KML content
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
    
    // Filter the full dataset to get only the records for the selected year
    const filteredData = fullWeatherData.filter(record => {
      const recordYear = new Date(record.date).getFullYear();
      return recordYear === parseInt(year, 10);
    });
    
    setSimulationData(filteredData); // Set the data that will be used for the simulation
    console.log(`Weather data filtered for ${year}. Found ${filteredData.length} records.`, filteredData.slice(0,5));
  };

  return (
    <div className="charlotte-simulator">
      <div className="charlotte-simulator__main-panel">
        <div className="main-panel__map-view">
          {/* Pass the raceRoute state down as a prop */}
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