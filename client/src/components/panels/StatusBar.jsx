import React from 'react';

// Formats a Date object into a clock time string like "07:21:30 AM"
const formatClockTime = (date) => {
  if (!date) return "--:--:--"; // Default display before simulation starts
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Formats total seconds into a pace string like "12:30"
const formatPace = (totalSeconds) => {
  if (totalSeconds === 0) return "--:--";
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const paddedSeconds = seconds.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
};

const StatusBar = ({ status }) => {
  const { 
    clockTime = null, 
    mile = 0, 
    pace = 0, 
    incline = 0 
  } = status || {};

  return (
    <div className="status-bar">
      <div className="status-bar__metric">
        <span className="status-bar__label">Time</span>
        <span className="status-bar__value">{formatClockTime(clockTime)}</span>
      </div>
      <div className="status-bar__metric">
        <span className="status-bar__label">Mile</span>
        <span className="status-bar__value">{mile.toFixed(2)}</span>
      </div>
      <div className="status-bar__metric">
        <span className="status-bar__label">Pace</span>
        <span className="status-bar__value">{formatPace(pace)}/mi</span>
      </div>
      <div className="status-bar__metric">
        <span className="status-bar__label">Incline</span>
        <span className="status-bar__value">{incline.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default StatusBar;