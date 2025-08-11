import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-kml'; // Import the KML plugin

const MapView = ({ raceRoute }) => {
  // Refs for the container, map instance, and the KML layer
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const kmlLayerRef = useRef(null);

  // Effect for initializing the map (runs only once)
  useEffect(() => {
    if (mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapContainerRef.current).setView(
      [35.216636, -80.820670],
      12 // User-adjusted zoom level
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Effect for adding the KML overlay (runs when raceRoute changes)
  useEffect(() => {
    if (!raceRoute || !mapInstanceRef.current) return;

    // Remove any existing KML layer before adding a new one
    if (kmlLayerRef.current) {
      mapInstanceRef.current.removeLayer(kmlLayerRef.current);
    }
    
    // The plugin expects a URL, so we create a virtual one from our KML text
    const blob = new Blob([raceRoute], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);

    // Create the KML layer
    const kmlLayer = new L.KML(url, { async: true });

    kmlLayer.on('loaded', (e) => {
      // Once loaded, fit the map's view to the route's bounds
      mapInstanceRef.current.fitBounds(e.target.getBounds());
    });
    
    // Add the layer to the map and save a reference to it for cleanup
    mapInstanceRef.current.addLayer(kmlLayer);
    kmlLayerRef.current = kmlLayer;
    
  }, [raceRoute]); // Dependency array: this runs when raceRoute changes

  return (
    <div ref={mapContainerRef} className="map-view-container" />
  );
};

export default MapView;