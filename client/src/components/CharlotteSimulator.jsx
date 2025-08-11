import React from 'react';
import Controls from './panels/Controls'; // Import the new Controls component

const CharlotteSimulator = () => {
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
        <Controls />
      </div>
    </div>
  );
};

export default CharlotteSimulator;