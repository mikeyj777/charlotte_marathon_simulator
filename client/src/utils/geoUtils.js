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
 * Extracts an array of coordinate objects from KML text.
 * @param {string} kmlText The raw string content of a KML file.
 * @returns {Array<{latitude: number, longitude: number}>|null} An array of coordinate objects.
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
    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  }).filter(loc => !isNaN(loc.latitude) && !isNaN(loc.longitude));
};

const haversineDistance = (p1, p2) => {
  const R = 3958.8; // Earth's radius in miles
  const rad = (x) => x * Math.PI / 180;
  const dLat = rad(p2.latitude - p1.latitude);
  const dLon = rad(p2.longitude - p1.longitude);
  const lat1 = rad(p1.latitude);
  const lat2 = rad(p2.latitude);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculates GPS coordinates for each 0.1-mile marker along a route.
 * @param {Array<{latitude: number, longitude: number}>} points - An array of GPS points.
 * @returns {Object} An object where keys are distances and values are {latitude, longitude}.
 */
export const calculateMileMarkers = (points) => {
  if (!points || points.length < 2) return {};

  const markers = { '0.0': { latitude: points[0].latitude, longitude: points[0].longitude } };
  let totalDistance = 0;
  let nextMarker = 0.1;

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];
    if (!prevPoint || !currentPoint) continue;
    const segmentDistance = haversineDistance(prevPoint, currentPoint);
    if (segmentDistance === 0) continue;
    
    while (totalDistance + segmentDistance >= nextMarker) {
      const distanceToMarker = nextMarker - totalDistance;
      const ratio = distanceToMarker / segmentDistance;
      const markerLat = prevPoint.latitude + (currentPoint.latitude - prevPoint.latitude) * ratio;
      const markerLon = prevPoint.longitude + (currentPoint.longitude - prevPoint.longitude) * ratio;
      markers[nextMarker.toFixed(1)] = { latitude: markerLat, longitude: markerLon };
      nextMarker += 0.1;
    }
    totalDistance += segmentDistance;
  }
  return markers;
};

/**
 * Takes a dictionary of mile markers and fetches elevation for each one.
 * @param {Object} markers - The output of calculateMileMarkers.
 * @returns {Promise<Object|null>} A promise that resolves to the final markers object with elevation data in feet.
 */
export const getElevationForMileMarkers = async (markers) => {
  if (!markers || Object.keys(markers).length === 0) return null;

  const locations = Object.values(markers);
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
        latitude: markers[key].latitude,
        longitude: markers[key].longitude,
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
 * @param {number} currentMile - The runner's current distance into the race.
 * @param {Object} mileMarkers - The object containing coordinate and elevation data for the course.
 * @returns {number} The incline percentage. Positive for uphill, negative for downhill.
 */
export const calculateIncline = (currentMile, mileMarkers) => {
  if (!mileMarkers || currentMile < 0) return 0;

  // Find the key for the marker just before the current position
  const prevMarkerKey = (Math.floor(currentMile * 10) / 10).toFixed(1);
  // Find the key for the marker just after the current position
  const nextMarkerKey = (Math.ceil(currentMile * 10) / 10).toFixed(1);

  const prevPoint = mileMarkers[prevMarkerKey];
  const nextPoint = mileMarkers[nextMarkerKey];

  // If we're at the very start, end, or can't find the points, assume flat terrain.
  if (!prevPoint || !nextPoint || prevMarkerKey === nextMarkerKey) {
    return 0;
  }

  // Rise: difference in elevation (in feet)
  const rise = nextPoint.elevation_ft - prevPoint.elevation_ft;
  // Run: distance between markers is always 0.1 miles, converted to feet
  const run = 0.1 * 5280; // 528 feet

  const incline = (rise / run) * 100;
  return incline;
};