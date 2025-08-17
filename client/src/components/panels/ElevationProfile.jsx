import React, { useState, useEffect, useMemo } from 'react';

// Define SVG constants, including padding for axes
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 150;
// --- CHANGE IS HERE: Increased left and right padding ---
const PADDING = { top: 10, right: 30, bottom: 25, left: 60 };

const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

const ElevationProfile = ({ mileMarkers, currentMile }) => {
  const [pathData, setPathData] = useState("M 0 0");
  const [markerPosition, setMarkerPosition] = useState({ cx: 0, cy: 0 });
  const [xAxisLabels, setXAxisLabels] = useState([]);

  const chartMetrics = useMemo(() => {
    if (!mileMarkers || Object.keys(mileMarkers).length < 2) return null;
    
    const elevations = Object.values(mileMarkers).map(m => m.elevation_ft);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    const elevationRange = maxElev - minElev || 1;
    
    const distances = Object.keys(mileMarkers).map(Number);
    const totalDistance = Math.max(...distances);
    
    return { minElev, maxElev, elevationRange, totalDistance };
  }, [mileMarkers]);

  // Effect to build the chart path and X-axis labels
  useEffect(() => {
    if (!mileMarkers || !chartMetrics) {
      setPathData(`M ${PADDING.left},${CHART_HEIGHT + PADDING.top} L ${SVG_WIDTH - PADDING.right},${CHART_HEIGHT + PADDING.top}`);
      return;
    }

    const { minElev, elevationRange, totalDistance } = chartMetrics;

    const points = Object.entries(mileMarkers).map(([dist, data]) => {
      const x = PADDING.left + (dist / totalDistance) * CHART_WIDTH;
      const y = PADDING.top + CHART_HEIGHT - ((data.elevation_ft - minElev) / elevationRange) * CHART_HEIGHT;
      return `${x},${y}`;
    });

    const firstPoint = PADDING.left + "," + (CHART_HEIGHT + PADDING.top);
    const lastPoint = (PADDING.left + CHART_WIDTH) + "," + (CHART_HEIGHT + PADDING.top);
    setPathData(`M ${firstPoint} L ${points.join(" L ")} L ${lastPoint} Z`);

    const labels = [];
    for (let i = 0; i <= totalDistance; i += 5) {
      labels.push(Math.floor(i));
    }
    if (totalDistance % 5 !== 0) labels.push(totalDistance.toFixed(1));
    setXAxisLabels(labels);

  }, [mileMarkers, chartMetrics]);

  // Effect to update the runner's marker position
  useEffect(() => {
    if (!currentMile || !mileMarkers || !chartMetrics) {
      setMarkerPosition({ cx: PADDING.left, cy: CHART_HEIGHT + PADDING.top });
      return;
    }

    const { minElev, elevationRange, totalDistance } = chartMetrics;
    const prevMarkerKey = (Math.floor(currentMile * 10) / 10).toFixed(1);
    const nextMarkerKey = (Math.ceil(currentMile * 10) / 10).toFixed(1);
    const prevPoint = mileMarkers[prevMarkerKey];
    const nextPoint = mileMarkers[nextMarkerKey];
    if (!prevPoint) return;
    
    let currentElevation = prevPoint.elevation_ft;
    if (prevPoint && nextPoint && prevMarkerKey !== nextMarkerKey) {
        const ratio = (currentMile - parseFloat(prevMarkerKey)) / 0.1;
        currentElevation = prevPoint.elevation_ft + (nextPoint.elevation_ft - prevPoint.elevation_ft) * ratio;
    }

    const cx = PADDING.left + (currentMile / totalDistance) * CHART_WIDTH;
    const cy = PADDING.top + CHART_HEIGHT - ((currentElevation - minElev) / elevationRange) * CHART_HEIGHT;

    setMarkerPosition({ cx, cy });
  }, [currentMile, mileMarkers, chartMetrics]);

  return (
    <div className="elevation-profile">
      <svg className="elevation-profile__svg" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
        <path className="elevation-profile__path" d={pathData} />
        
        {chartMetrics && (
          <>
            <text x={PADDING.left - 8} y={PADDING.top + 5} className="elevation-profile__axis-label elevation-profile__axis-label--y">
              {Math.round(chartMetrics.maxElev)} ft
            </text>
            <text x={PADDING.left - 8} y={PADDING.top + CHART_HEIGHT} className="elevation-profile__axis-label elevation-profile__axis-label--y">
              {Math.round(chartMetrics.minElev)} ft
            </text>
          </>
        )}
        
        {chartMetrics && xAxisLabels.map(mile => (
          <text 
            key={mile}
            x={PADDING.left + (mile / chartMetrics.totalDistance) * CHART_WIDTH} 
            y={SVG_HEIGHT - PADDING.bottom + 15}
            className="elevation-profile__axis-label elevation-profile__axis-label--x"
          >
            {mile}
          </text>
        ))}

        <circle className="elevation-profile__marker" cx={markerPosition.cx} cy={markerPosition.cy} r="8" />
      </svg>
    </div>
  );
};

export default ElevationProfile;