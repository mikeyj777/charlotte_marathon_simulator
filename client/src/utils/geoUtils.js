/**
 * Parses a KML text string into an XML Document.
 * @param {string} kmlText The raw string content of a KML file.
 * @returns {XMLDocument} A parsed XML document.
 */
export const parseKML = (kmlText) => {
  if (!kmlText || typeof kmlText !== 'string') {
    kmlText = '<?xml version="1.0" encoding="UTF-8"?>';
  }
  const parser = new DOMParser();
  return parser.parseFromString(kmlText, 'text/xml');
};

/**
 * Extracts an array of {lat, lng} coordinate objects from KML text.
 * @param {string} kmlText The raw string content of a KML file.
 * @returns {Array<{lat: number, lng: number}>|null} An array of coordinate objects.
 */
export const getCoordsFromKML = (kmlText) => {
  if (!kmlText) return null;
  const kmlDoc = parseKML(kmlText);
  const coordinatesNode = kmlDoc.querySelector('coordinates');
  if (!coordinatesNode) {
    console.error("No <coordinates> tag found in KML file.");
    return null;
  }
  const coordinatesString = coordinatesNode.textContent;
  return coordinatesString.trim().split(/\s+/).map(coordString => {
    const [longitude, latitude] = coordString.split(',');
    return { lat: parseFloat(latitude), lng: parseFloat(longitude) };
  }).filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng));
};

/**
 * Calculates the distance between two GPS coordinates in miles using the Haversine formula.
 */
const haversineDistance = (p1, p2) => {
  const R = 3958.8; // Earth's radius in miles
  const rad = (x) => x * Math.PI / 180;
  const dLat = rad(p2.lat - p1.lat);
  const dLon = rad(p2.lng - p1.lng);
  const lat1 = rad(p1.lat);
  const lat2 = rad(p2.lat);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculates GPS coordinates for each interval along a route.
 * @param {Array<{lat: number, lng: number}>} points - An array of GPS points.
 * @param {number} [interval=0.1] - The distance interval in miles.
 * @returns {Object} An object where keys are distances and values are {lat, lng}.
 */
export const calculateMileMarkers = (points, interval = 0.1) => {
  if (!points || points.length < 2) return {};

  const precision = interval.toString().split('.')[1]?.length || 1;
  const markers = { '0.0': { lat: points[0].lat, lng: points[0].lng } };
  let totalDistance = 0;
  let nextMarker = interval;

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];
    if (!prevPoint || !currentPoint) continue;
    const segmentDistance = haversineDistance(prevPoint, currentPoint);
    if (segmentDistance === 0) continue;
    
    while (totalDistance + segmentDistance >= nextMarker) {
      const distanceToMarker = nextMarker - totalDistance;
      const ratio = distanceToMarker / segmentDistance;
      const markerLat = prevPoint.lat + (currentPoint.lat - prevPoint.lat) * ratio;
      const markerLon = prevPoint.lng + (currentPoint.lng - prevPoint.lng) * ratio;
      markers[nextMarker.toFixed(precision)] = { lat: markerLat, lng: markerLon };
      nextMarker += interval;
    }
    totalDistance += segmentDistance;
  }
  return markers;
};

/**
 * Takes a dictionary of mile markers and fetches elevation for each one.
 */
export const getElevationForMileMarkers = async (markers) => {
  if (!markers || Object.keys(markers).length === 0) return null;
  const locations = Object.values(markers).map(marker => ({
    latitude: marker.lat,
    longitude: marker.lng
  }));
  try {
    const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ locations })
    });
    if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
    const data = await response.json();
    const elevationResults = data.results;
    const finalMarkers = {};
    Object.keys(markers).forEach((key, index) => {
      finalMarkers[key] = {
        lat: markers[key].lat,
        lng: markers[key].lng,
        elevation_ft: (elevationResults[index]?.elevation ?? 0) * 3.28084
      };
    });
    return finalMarkers;
  } catch (error) {
    console.error("Error fetching elevation for mile markers:", error);
    return null;
  }
};

/**
 * Estimates the current incline percentage based on the runner's position on the course.
 */
export const calculateIncline = (currentMile, mileMarkers) => {
  if (!mileMarkers || currentMile < 0 || Object.keys(mileMarkers).length < 2) return 0;

  const precision = Object.keys(mileMarkers)[1].split('.')[1]?.length || 1;
  const multiplier = Math.pow(10, precision);

  const prevMarkerKey = (Math.floor(currentMile * multiplier) / multiplier).toFixed(precision);
  const nextMarkerKey = (Math.ceil(currentMile * multiplier) / multiplier).toFixed(precision);

  const prevPoint = mileMarkers[prevMarkerKey];
  const nextPoint = mileMarkers[nextMarkerKey];
  
  if (!prevPoint || !nextPoint || prevMarkerKey === nextMarkerKey) {
    return 0;
  }

  const rise = nextPoint.elevation_ft - prevPoint.elevation_ft;
  const run = (parseFloat(nextMarkerKey) - parseFloat(prevMarkerKey)) * 5280;
  
  if (run === 0) return 0;

  const incline = (rise / run) * 100;
  return incline;
};

/**
 * Calculates the compass bearing from one GPS point to another.
 */
export const calculateBearing = (point1, point2) => {
  if (!point1 || !point2 || (point1.lat === point2.lat && point1.lng === point2.lng)) {
    return 0;
  }

  const toRadians = (deg) => deg * Math.PI / 180;
  const toDegrees = (rad) => rad * 180 / Math.PI;

  const lat1 = toRadians(point1.lat);
  const lng1 = toRadians(point1.lng);
  const lat2 = toRadians(point2.lat);
  const lng2 = toRadians(point2.lng);

  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
};

/**
 * Calculates the compass bearing for the route segment at a given mile.
 */
export const getDirectionForMile = (currentMile, mileMarkers) => {
  if (!mileMarkers || Object.keys(mileMarkers).length < 2) return 0;

  const precision = Object.keys(mileMarkers)[1].split('.')[1]?.length || 1;
  const multiplier = Math.pow(10, precision);

  const prevMarkerKey = (Math.floor(currentMile * multiplier) / multiplier).toFixed(precision);
  const nextMarkerKey = (Math.ceil(currentMile * multiplier) / multiplier).toFixed(precision);
  
  const prevPoint = mileMarkers[prevMarkerKey];
  const nextPoint = mileMarkers[nextMarkerKey];

  if (!prevPoint || !nextPoint) return 0;
  
  return calculateBearing(prevPoint, nextPoint);
};

/**
 * Interpolates the {lat, lng} for a specific mile distance along the route.
 */
export const getPositionForMile = (targetMile, mileMarkers) => {
  if (!mileMarkers || targetMile < 0 || Object.keys(mileMarkers).length < 2) return null;

  const markerKeys = Object.keys(mileMarkers).map(parseFloat).sort((a, b) => a - b);
  const precision = markerKeys[1] ? markerKeys[1].toString().split('.')[1]?.length || 1 : 1;
  const multiplier = Math.pow(10, precision);

  if (targetMile > markerKeys[markerKeys.length - 1]) {
    const lastKey = markerKeys[markerKeys.length - 1].toFixed(precision);
    return mileMarkers[lastKey];
  }
  
  const prevMarkerKey = (Math.floor(targetMile * multiplier) / multiplier).toFixed(precision);
  const nextMarkerKey = (Math.ceil(targetMile * multiplier) / multiplier).toFixed(precision);
  
  const prevPoint = mileMarkers[prevMarkerKey];
  const nextPoint = mileMarkers[nextMarkerKey];
  
  if (!prevPoint || !nextPoint || prevMarkerKey === nextMarkerKey) {
    return prevPoint || nextPoint || null;
  }
  
  const segmentMiles = parseFloat(nextMarkerKey) - parseFloat(prevMarkerKey);
  const distanceIntoSegment = targetMile - parseFloat(prevMarkerKey);
  
  if (segmentMiles === 0) return prevPoint;

  const ratio = distanceIntoSegment / segmentMiles;
  const lat = prevPoint.lat + (nextPoint.lat - prevPoint.lat) * ratio;
  const lng = prevPoint.lng + (nextPoint.lng - prevPoint.lng) * ratio;
  return { lat: lat, lng: lng };
};