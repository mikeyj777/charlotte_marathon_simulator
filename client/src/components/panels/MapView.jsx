import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-kml';
import { parseKML } from '../../utils/geoUtils.js'; // Updated import path

const MapView = ({ raceRoute }) => {
  // ... (the rest of the component code remains exactly the same)
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const kmlLayerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    mapInstanceRef.current = L.map(mapContainerRef.current).setView([35.216636, -80.820670], 12);
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

  useEffect(() => {
    if (!raceRoute || !mapInstanceRef.current) return;
    if (kmlLayerRef.current) {
      mapInstanceRef.current.removeLayer(kmlLayerRef.current);
    }
    const kml = parseKML(raceRoute);
    const kmlLayer = new L.KML(kml, { async: true });
    kmlLayer.on('loaded', (e) => {
      mapInstanceRef.current.fitBounds(e.target.getBounds());
    });
    mapInstanceRef.current.addLayer(kmlLayer);
    kmlLayerRef.current = kmlLayer;
  }, [raceRoute]);

  return (
    <div ref={mapContainerRef} className="map-view-container" />
  );
};

export default MapView;