import React, { useState, useEffect, useRef } from 'react';
import Controls from './panels/Controls';
import MapView from './panels/MapView';
import StatusBar from './panels/StatusBar';
import ElevationProfile from './panels/ElevationProfile';
import { parseCSV, calculateAdjustedPace } from '../utils/utils.js';
import { getCoordsFromKML, calculateMileMarkers, getElevationForMileMarkers, getPositionForMile, calculateIncline } from '../utils/geoUtils.js';

const CharlotteSimulator = () => {
  const [fullWeatherData, setFullWeatherData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [raceRoute, setRaceRoute] = useState(null);
  const [mileMarkers, setMileMarkers] = useState(null);
  const [targetPace, setTargetPace] = useState('12:00');
  const [startTime, setStartTime] = useState('07:20');
  const [speedMultiplier, setSpeedMultiplier] = useState(10.0);
  const [defaultYear] = useState('2024');
  const [isRunning, setIsRunning] = useState(false);
  const [runnerPosition, setRunnerPosition] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);

  const animationFrameId = useRef(null);
  const previousTimestamp = useRef(null);
  const simulationState = useRef({ totalDistance: 0, raceTime: 0 });
  const lastUiUpdateTime = useRef(0);
  const raceStartDate = useRef(null);

  useEffect(() => {
    const simulationStep = (timestamp) => {
      if (!previousTimestamp.current) {
        previousTimestamp.current = timestamp;
        animationFrameId.current = requestAnimationFrame(simulationStep);
        return;
      }

      const deltaTime = (timestamp - previousTimestamp.current) / 1000;
      const effectiveDeltaTime = deltaTime * speedMultiplier;
      simulationState.current.raceTime += effectiveDeltaTime;

      const currentDistance = simulationState.current.totalDistance;
      const currentPace = calculateAdjustedPace(targetPace, currentDistance, mileMarkers);
      const distanceThisFrame = (1 / currentPace) * effectiveDeltaTime;
      simulationState.current.totalDistance += distanceThisFrame;

      if (timestamp - lastUiUpdateTime.current > 250) {
        const newPosition = getPositionForMile(simulationState.current.totalDistance, mileMarkers);
        setRunnerPosition(newPosition);
        
        const currentClockTime = new Date(raceStartDate.current.getTime() + (simulationState.current.raceTime * 1000));
        const incline = calculateIncline(currentDistance, mileMarkers);
        
        // --- CHANGE IS HERE ---
        setCurrentStatus({
          clockTime: currentClockTime,
          elapsedTime: simulationState.current.raceTime, // Pass the elapsed time
          mile: currentDistance,
          pace: currentPace,
          incline: incline,
        });
        
        lastUiUpdateTime.current = timestamp;
      }
      
      const totalCourseMiles = parseFloat(Object.keys(mileMarkers).pop());
      if (simulationState.current.totalDistance >= totalCourseMiles) {
        setIsRunning(false);
        const finalPosition = getPositionForMile(totalCourseMiles, mileMarkers);
        setRunnerPosition(finalPosition);
        console.log('Simulation finished!');
        return;
      }

      previousTimestamp.current = timestamp;
      animationFrameId.current = requestAnimationFrame(simulationStep);
    };

    if (isRunning && mileMarkers) {
      animationFrameId.current = requestAnimationFrame(simulationStep);
    }
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [isRunning, mileMarkers, targetPace, speedMultiplier]);

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
  
  const handlePaceChange = (pace) => setTargetPace(pace);
  const handleStartTimeChange = (time) => setStartTime(time);
  const handleSpeedChange = (speed) => setSpeedMultiplier(speed);

  const handleStartSimulation = (pace) => {
    if (!mileMarkers || Object.keys(mileMarkers).length === 0) {
      alert("Please load a valid KML race route file first.");
      return;
    }
    
    if (simulationState.current.totalDistance === 0) {
      console.log(`Starting simulation with target pace: ${pace}`);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0, 0);
      raceStartDate.current = startDate;
      const startPosition = getPositionForMile(0, mileMarkers);
      setRunnerPosition(startPosition);
    } else {
      console.log('Resuming simulation...');
    }
    
    setTargetPace(pace);
    previousTimestamp.current = null;
    setIsRunning(true);
  };
  
  const handlePauseSimulation = () => {
    console.log('Pausing simulation...');
    setIsRunning(false);
  };

  const handleResetSimulation = () => {
    console.log('Resetting simulation...');
    setIsRunning(false);
    simulationState.current = { totalDistance: 0, raceTime: 0 };
    const startPosition = getPositionForMile(0, mileMarkers);
    setRunnerPosition(startPosition);
    setCurrentStatus(null);
    previousTimestamp.current = null;
  };

  return (
    <div className="charlotte-simulator">
      <div className="charlotte-simulator__main-panel">
        <div className="main-panel__map-view">
          <MapView raceRoute={raceRoute} runnerPosition={runnerPosition} />
        </div>
        <div className="main-panel__status-bar">
          <StatusBar status={currentStatus} />
        </div>
        <div className="main-panel__weather-bar"></div>
        <div className="main-panel__elevation-profile">
          <ElevationProfile 
            mileMarkers={mileMarkers}
            currentMile={currentStatus?.mile}
          />
        </div>
      </div>
      <div className="charlotte-simulator__control-panel">
        <Controls
          isRunning={isRunning}
          onFileLoad={handleWeatherLoad}
          onRouteLoad={handleRouteLoad}
          onYearSelect={handleYearSelect}
          onPaceChange={handlePaceChange}
          onStartTimeChange={handleStartTimeChange}
          onSpeedChange={handleSpeedChange}
          onStartSimulation={handleStartSimulation}
          onPauseSimulation={handlePauseSimulation}
          onResetSimulation={handleResetSimulation}
        />
      </div>
    </div>
  );
};

export default CharlotteSimulator;