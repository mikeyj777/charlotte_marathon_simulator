import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-kml';
import { parseKML } from '../../utils/geoUtils.js';

const MapView = ({ raceRoute, runnerPosition }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const kmlLayerRef = useRef(null);
  const runnerMarkerRef = useRef(null);

  // Effect for initializing the map
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

  // Effect for adding the KML overlay
  useEffect(() => {
    if (!raceRoute || !mapInstanceRef.current) return;
    if (kmlLayerRef.current) {
      mapInstanceRef.current.removeLayer(kmlLayerRef.current);
    }
    try {
      const kml = parseKML(raceRoute);
      const kmlLayer = new L.KML(kml, { async: true });
      kmlLayer.on('loaded', (e) => {
        mapInstanceRef.current.fitBounds(e.target.getBounds());
      });
      mapInstanceRef.current.addLayer(kmlLayer);
      kmlLayerRef.current = kmlLayer;
    } catch (error) {
      console.error("Failed to process KML layer. The KML file may contain invalid coordinate data.", error);
    }
  }, [raceRoute]);

  // Effect for updating the runner marker
  useEffect(() => {
    if (!mapInstanceRef.current || !runnerPosition) return;
    if (!runnerMarkerRef.current) {
      runnerMarkerRef.current = L.circleMarker(runnerPosition, {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#007bff',
        fillOpacity: 1,
      }).addTo(mapInstanceRef.current);
    } else {
      runnerMarkerRef.current.setLatLng(runnerPosition);
    }
  }, [runnerPosition]);

  return (
    <div ref={mapContainerRef} className="map-view-container" />
  );
};

export default MapView;