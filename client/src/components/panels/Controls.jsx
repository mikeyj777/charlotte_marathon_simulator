import React, { useState, useRef } from 'react';

// Helper to convert the slider's 0-100 value to the new 0.5x-100x speed range
const sliderToSpeed = (sliderValue) => {
  const value = parseInt(sliderValue, 10);
  
  if (value === 50) return 10.0; // Default: 10x speed at the halfway mark

  if (value < 50) {
    // Maps the slider range [0, 49] to the speed range [0.5x, 9.9x]
    return 0.5 + (value / 50) * 9.5;
  } else {
    // Maps the slider range [51, 100] to the speed range [10.1x, 100x]
    return 10.0 + ((value - 50) / 50) * 90.0;
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
  const [sliderValue, setSliderValue] = useState(50); // NEW: Default slider position is 50

  const weatherFileRef = useRef(null);
  const routeFileRef = useRef(null);

  // All handler functions (handleLoadWeatherClick, etc.) remain the same
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
      {/* Input groups for file loading and simulation config remain the same */}
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