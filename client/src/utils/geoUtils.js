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
 * Extracts coordinates from KML and fetches their elevation from the Open-Elevation API.
 * @param {string} kmlText The raw string content of a KML file.
 * @returns {Promise<Array<Object>|null>} A promise that resolves to an array of location objects with elevation.
 */
export const getElevationsFromKML = async (kmlText) => {
  if (!kmlText) return null;
  try {
    const kmlDoc = parseKML(kmlText);
    const coordinatesNode = kmlDoc.querySelector('coordinates');
    if (!coordinatesNode) return null;
    const coordinatesString = coordinatesNode.textContent;
    const locations = coordinatesString.trim().split(/\s+/).map(coordString => {
      const [longitude, latitude] = coordString.split(',');
      return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    }).filter(loc => !isNaN(loc.latitude) && !isNaN(loc.longitude));
    if (locations.length === 0) return null;
    const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ locations })
    });
    if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching or parsing elevation data:", error);
    return null;
  }
};

/**
 * Calculates the distance between two GPS coordinates in miles using the Haversine formula.
 * @param {{latitude: number, longitude: number}} p1 - First point.
 * @param {{latitude: number, longitude: number}} p2 - Second point.
 * @returns {number} Distance in miles.
 */
const haversineDistance = (p1, p2) => {
  const R = 3958.8; // Earth's radius in miles
  const rad = (x) => x * Math.PI / 180;

  const dLat = rad(p2.latitude - p1.latitude);
  const dLon = rad(p2.longitude - p1.longitude);
  const lat1 = rad(p1.latitude);
  const lat2 = rad(p2.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Calculates GPS coordinates for each 0.1-mile marker along a route.
 * @param {Array<{latitude: number, longitude: number}>} points - An array of GPS points from the route.
 * @returns {Object} An object where keys are distances (e.g., "0.1", "0.2") and values are coordinate objects.
 */
export const calculateMileMarkers = (points) => {
  if (!points || points.length < 2) return {};

  const markers = { '0.0': { latitude: points[0].latitude, longitude: points[0].longitude } };
  let totalDistance = 0;
  let nextMarker = 0.1;

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];
    const segmentDistance = haversineDistance(prevPoint, currentPoint);
    
    // Check if the next marker falls within the current segment
    while (totalDistance + segmentDistance >= nextMarker) {
      const distanceToMarker = nextMarker - totalDistance;
      const ratio = distanceToMarker / segmentDistance;
      
      // Interpolate the coordinates for the marker
      const markerLat = prevPoint.latitude + (currentPoint.latitude - prevPoint.latitude) * ratio;
      const markerLon = prevPoint.longitude + (currentPoint.longitude - prevPoint.longitude) * ratio;

      markers[nextMarker.toFixed(1)] = { latitude: markerLat, longitude: markerLon };
      nextMarker += 0.1;
    }
    
    totalDistance += segmentDistance;
  }

  return markers;
};