import { useEffect } from 'react';
import { calculateIncline } from './geoUtils.js'; // Import the new geo utility


/**
 * A simple CSV parser.
 * @param {string} csvText The raw string content of a CSV file.
 * @returns {Array<Object>} An array of objects, where each object represents a row.
 */
export const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    return [];
  }
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    if (values.length !== headers.length) {
      continue;
    }
    const rowObject = {};
    headers.forEach((header, index) => {
      const value = values[index];
      rowObject[header] = !isNaN(value) && value.trim() !== '' ? Number(value) : value;
    });
    data.push(rowObject);
  }
  return data;
};

/**
 * Parses a KML text string into an XML Document.
 * @param {string} kmlText The raw string content of a KML file.
 * @returns {XMLDocument} A parsed XML document.
 */
export const parseKML = (kmlText) => {
  if (!kmlText || typeof kmlText !== 'string') {
    // Return an empty XML document to prevent errors downstream
    kmlText = '<?xml version="1.0" encoding="UTF-8"?>';
  }
  const parser = new DOMParser();
  return parser.parseFromString(kmlText, 'text/xml');
};

/**
 * Converts a pace string "MM:SS" into total seconds.
 * @param {string} paceString - The pace in "MM:SS" format.
 * @returns {number} The total seconds per mile.
 */
const parsePaceToSeconds = (paceString) => {
  const parts = paceString.split(':');
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  return (minutes * 60) + seconds;
};

/**
 * Calculates the runner's actual pace based on target pace, incline, and fatigue.
 * @param {string} targetPace - The runner's target pace ("MM:SS").
 * @param {number} currentMile - The runner's current distance into the race.
 * @param {Object} mileMarkers - The object containing course data.
 * @returns {number} The adjusted pace in seconds per mile.
 */
export const calculateAdjustedPace = (targetPace, currentMile, mileMarkers) => {
  const basePaceInSeconds = parsePaceToSeconds(targetPace);

  // 1. Calculate Incline Penalty (assuming pace time INCREASES with incline)
  const incline = calculateIncline(currentMile, mileMarkers);
  const inclinePenalty = incline > 0 ? incline * 60 : 0; // +1 minute per percentage point

  // 2. Calculate Fatigue Penalty
  let fatiguePenalty = 0;
  if (currentMile >= 24) {
    fatiguePenalty = 90; // +1.5 minutes (90 seconds)
  } else if (currentMile >= 20) {
    fatiguePenalty = 60; // +1 minute (60 seconds)
  }
  
  // 3. Return total adjusted pace
  return basePaceInSeconds + inclinePenalty + fatiguePenalty;
};


/**
 * Finds and interpolates weather data for a specific time from an array of hourly data.
 * @param {Date} clockTime - The current time in the simulation.
 * @param {Array<Object>} weatherData - The array of hourly weather records.
 * @returns {Object|null} An object with the interpolated weather conditions.
 */
export const findCurrentWeather = (clockTime, weatherData) => {
  if (!clockTime || !weatherData || weatherData.length === 0) return null;

  // --- NEW: Helper to ensure consistent property names ---
  const normalizeRecord = (record) => {
    if (!record) return null;
    return {
      temperature: record.temperature_2m_deg_f,
      dewPoint: record.dew_point_2m_deg_f,
      windSpeed: record.wind_speed_10m_mph,
      windDirection: record.wind_direction_10m_deg_from,
    };
  };

  // console.log(`Finding weather for time: ${clockTime.toISOString()}`);
  // console.log(`Weather data records available: ${weatherData.length}`);
  // console.log(`Weather data sample: ${weatherData}`);

  const currentTimeMs = clockTime.getTime();
  
  let prevRecord = null;
  let nextRecord = null;
  for (const record of weatherData) {
    const recordTime = new Date(record.date).getTime();
    if (recordTime <= currentTimeMs) {
      prevRecord = record;
    } else {
      nextRecord = record;
      break;
    }
  }

  // If there's no bracket, return the closest record with normalized keys
  if (!nextRecord) return normalizeRecord(prevRecord);
  if (!prevRecord) return normalizeRecord(nextRecord);
  
  const prevTime = new Date(prevRecord.date).getTime();
  const nextTime = new Date(nextRecord.date).getTime();
  
  // If we land exactly on a record time, return it with normalized keys
  if (currentTimeMs === prevTime) return normalizeRecord(prevRecord);
  if (currentTimeMs === nextTime) return normalizeRecord(nextRecord);

  const totalTimeDiff = nextTime - prevTime;
  if (totalTimeDiff === 0) return normalizeRecord(prevRecord);
  const timeIntoSegment = currentTimeMs - prevTime;
  const ratio = timeIntoSegment / totalTimeDiff;

  const interpolate = (key) => prevRecord[key] + (nextRecord[key] - prevRecord[key]) * ratio;
  const interpolateAngle = (key) => {
    const d = Math.abs(nextRecord[key] - prevRecord[key]);
    if (d > 180) {
      if (nextRecord[key] > prevRecord[key]) {
        return (prevRecord[key] + (nextRecord[key] - 360 - prevRecord[key]) * ratio + 360) % 360;
      } else {
        return (prevRecord[key] + (nextRecord[key] + 360 - prevRecord[key]) * ratio) % 360;
      }
    } else {
      return interpolate(key);
    }
  };
  
  return {
    temperature: interpolate('temperature_2m_deg_f'),
    dewPoint: interpolate('dew_point_2m_deg_f'),
    windSpeed: interpolate('wind_speed_10m_mph'),
    windDirection: interpolateAngle('wind_direction_10m_deg_from'),
  };
};