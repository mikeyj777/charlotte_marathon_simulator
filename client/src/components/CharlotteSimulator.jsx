import React, { useState } from 'react';
import Controls from './panels/Controls';
import { parseCSV } from '../utils/utils.js'; // Import the new parser

const CharlotteSimulator = () => {
  // This state will now hold the PARSED weather data (an array of objects).
  const [weatherData, setWeatherData] = useState(null);

  // This function now parses the data before setting the state.
  const handleWeatherLoad = async (file) => {
    try {
      const content = await file.text();
      const parsedData = parseCSV(content); // Use the utility function
      setWeatherData(parsedData); // Store the structured data

      console.log('Parsed Data (first 5 rows):', parsedData.slice(0, 5));

    } catch (error) {
      console.error('Error reading or parsing file:', error);
      setWeatherData(null);
    }
  };

  return (
    <div className="charlotte-simulator">
      {/* Left panel for all visualizations */}
      <div className="charlotte-simulator__main-panel">
        <div className="main-panel__map-view">
          {/* MapView component will go here */}
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

      {/* Right panel for all user controls */}
      <div className="charlotte-simulator__control-panel">
        <Controls onFileLoad={handleWeatherLoad} />
      </div>
    </div>
  );
};

export default CharlotteSimulator;