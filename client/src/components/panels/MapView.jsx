import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const MapView = () => {
  // Refs to hold the map container DOM element and the map instance
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Prevents map from being initialized more than once
    if (mapInstanceRef.current) {
      return;
    }

    // Initialize the map
    // A zoom level of 10 is approximately 15-20 miles in view distance.
    mapInstanceRef.current = L.map(mapContainerRef.current).setView(
      [35.216636, -80.820670], // Charlotte Lat/Long
      10
    );

    // Add the tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);

    // Cleanup function to run when the component is unmounted
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div ref={mapContainerRef} className="map-view-container" />
  );
};

export default MapView;