import React, {useEffect} from 'react';

const WeatherBar = ({ weatherState }) => {
  // Set default values to prevent errors before the simulation starts
  const {
    temperature = 0,
    dewPoint = 0,
    windSpeed = 0,
    windDirection = 0,
    runnerDirection = 0,
  } = weatherState || {};

  return (
    <div className="weather-bar">
      <div className="weather-bar__metric">
        <span className="weather-bar__label">Wind (mph)</span>
        <span className="weather-bar__value">{windSpeed.toFixed(1)}</span>
      </div>

      <div className="weather-bar__metric">
        <span className="weather-bar__label">Temp (°F)</span>
        <span className="weather-bar__value">{temperature.toFixed(0)}</span>
      </div>

      <div className="weather-bar__metric">
        <span className="weather-bar__label">Dew Point</span>
        <span className="weather-bar__value">{dewPoint.toFixed(0)}</span>
      </div>
      
      <div className="weather-bar__metric">
        <span className="weather-bar__label">Direction</span>
        <div className="weather-bar__viz">
          {/* Runner Icon (Head pointing up) */}
          <svg 
            className="weather-bar__icon" 
            viewBox="0 0 100 100" 
            style={{ transform: `rotate(${runnerDirection}deg)` }}
          >
            <g fill="#A9A9A9">
              <circle cx="50" cy="50" r="25" />
              <polygon points="50,5 65,30 35,30" />
            </g>
          </svg>
          
          {/* Wind Icon (Arrow pointing up) */}
          <svg 
            className="weather-bar__icon" 
            viewBox="0 0 100 100" 
            style={{ transform: `rotate(${windDirection}deg)` }}
          >
            <g fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round">
              <line x1="50" y1="95" x2="50" y2="5" />
              <polyline points="25,30 50,5 75,30" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WeatherBar;