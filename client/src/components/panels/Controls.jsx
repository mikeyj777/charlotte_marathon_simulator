import React, { useState, useRef } from 'react';

const Controls = ({ onFileLoad, onRouteLoad, onYearSelect, onPaceChange, onStartSimulation }) => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [weatherFileName, setWeatherFileName] = useState('');
  const [routeName, setRouteName] = useState('');
  const [targetPace, setTargetPace] = useState('12:00'); // Default pace

  const weatherFileRef = useRef(null);
  const routeFileRef = useRef(null);

  const handleLoadWeatherClick = () => weatherFileRef.current.click();
  const handleWeatherFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setWeatherFileName(file.name);
      onFileLoad(file);
    }
  };

  const handleLoadRouteClick = () => routeFileRef.current.click();
  const handleRouteFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRouteName(file.name);
      onRouteLoad(file);
    }
  };
  
  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    onYearSelect(year);
  };

  const handlePaceInputChange = (event) => {
    const pace = event.target.value;
    setTargetPace(pace);
    onPaceChange(pace); // Pass pace up to the parent
  };

  const handleSimulate = () => {
    onStartSimulation(targetPace);
  };

  return (
    <div className="controls-panel">
      <input type="file" ref={weatherFileRef} onChange={handleWeatherFileChange} style={{ display: 'none' }} accept=".csv" />
      <input type="file" ref={routeFileRef} onChange={handleRouteFileChange} style={{ display: 'none' }} accept=".kml,.gpx" />

      <div className="controls-panel__group">
        <label className="controls-panel__label">1. Load Files</label>
        <button className="controls-panel__button--secondary" onClick={handleLoadWeatherClick}>Select Weather Data</button>
        {weatherFileName && <p className="controls-panel__file-name">File: {weatherFileName}</p>}
        <button className="controls-panel__button--secondary" style={{ marginTop: '10px' }} onClick={handleLoadRouteClick}>Select Race Route</button>
        {routeName && <p className="controls-panel__file-name">File: {routeName}</p>}
      </div>

      <div className="controls-panel__group">
        <label htmlFor="year-select" className="controls-panel__label">2. Select Year</label>
        <select id="year-select" className="controls-panel__select" value={selectedYear} onChange={handleYearChange}>
          {/* Year options */}
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
        </select>
      </div>
      
      <div className="controls-panel__group">
        <label htmlFor="pace-input" className="controls-panel__label">3. Target Race Pace (MM:SS)</label>
        <input 
          type="text" 
          id="pace-input" 
          className="controls-panel__input" 
          value={targetPace}
          onChange={handlePaceInputChange}
        />
      </div>

      <button className="controls-panel__button" onClick={handleSimulate}>
        GO!
      </button>
    </div>
  );
};

export default Controls;