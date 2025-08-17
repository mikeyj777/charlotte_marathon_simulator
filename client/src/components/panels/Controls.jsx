import React, { useState, useRef } from 'react';

// Helper to convert the slider's 0-100 value to a 0.5x-10x speed multiplier
const sliderToSpeed = (sliderValue) => {
  const value = parseInt(sliderValue, 10);
  if (value === 25) return 1.0; // Real-time at the 1/4 mark

  if (value < 25) {
    // Maps the slider range [0, 24] to the speed range [0.5x, 0.9x]
    return 0.5 + (value / 24) * 0.4;
  } else {
    // Maps the slider range [26, 100] to the speed range [1.1x, 20.0x]
    return 1.0 + ((value - 25) / 75) * 20.0;
  }
};

const Controls = ({ 
  isRunning,
  onFileLoad, 
  onRouteLoad, 
  onYearSelect, 
  onPaceChange,
  onStartTimeChange,
  onSpeedChange,
  onStartSimulation,
  onPauseSimulation,
  onResetSimulation  
}) => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [weatherFileName, setWeatherFileName] = useState('');
  const [routeName, setRouteName] = useState('');
  const [targetPace, setTargetPace] = useState('12:00');
  const [startTime, setStartTime] = useState('07:20');
  const [sliderValue, setSliderValue] = useState(25);

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

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    onYearSelect(e.target.value);
  };
  
  const handlePaceInputChange = (e) => {
    setTargetPace(e.target.value);
    onPaceChange(e.target.value);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    onStartTimeChange(e.target.value);
  };
  
  const handleSpeedChange = (e) => {
    const value = e.target.value;
    setSliderValue(value);
    const speed = sliderToSpeed(value);
    onSpeedChange(speed);
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
        <label className="controls-panel__label">2. Configure Simulation</label>
        <label htmlFor="year-select" className="controls-panel__sub-label">Year</label>
        <select id="year-select" className="controls-panel__select" value={selectedYear} onChange={handleYearChange}>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
        </select>
        <label htmlFor="start-time" className="controls-panel__sub-label">Start Time</label>
        <input type="time" id="start-time" className="controls-panel__input" value={startTime} onChange={handleStartTimeChange} />
        <label htmlFor="pace-input" className="controls-panel__sub-label">Target Pace (MM:SS)</label>
        <input type="text" id="pace-input" className="controls-panel__input" value={targetPace} onChange={handlePaceInputChange} />
      </div>

      <div className="controls-panel__group">
        <label className="controls-panel__label">
          Speed: {sliderToSpeed(sliderValue).toFixed(1)}x
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderValue}
          className="controls-panel__slider"
          onChange={handleSpeedChange}
        />
      </div>

      <div className="controls-panel__actions">
        {isRunning ? (
          <>
            <button 
              className="controls-panel__button controls-panel__button--pause" 
              onClick={onPauseSimulation}
            >
              PAUSE
            </button>
            <button 
              className="controls-panel__button controls-panel__button--reset" 
              onClick={onResetSimulation}
            >
              RESET
            </button>
          </>
        ) : (
          <button 
            className="controls-panel__button controls-panel__button--go" 
            onClick={() => onStartSimulation(targetPace)}
          >
            GO!
          </button>
        )}
      </div>
    </div>
  );
};

export default Controls;