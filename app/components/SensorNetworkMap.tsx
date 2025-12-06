'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { MapRef, ViewState } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Sensor {
  id: string;
  serialNum: string;
  geolocation?: { lat: number; lng: number } | null;
  activationStatus: string;
  param: string;
}

interface SensorNetworkMapProps {
  sensors: Sensor[];
  projectBoundary?: any;
  center?: { lat: number; lng: number };
}

export default function SensorNetworkMap({ sensors, projectBoundary, center }: SensorNetworkMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>({
    longitude: center?.lng || -116.2023,
    latitude: center?.lat || 43.6150,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-300">
        <p className="text-gray-600">Mapbox token not configured</p>
      </div>
    );
  }

  // Generate mock sensor locations if not provided
  const sensorsWithLocations = sensors.map((sensor, idx) => {
    if (sensor.geolocation) {
      return sensor;
    }
    // Generate grid pattern around center
    const gridSize = Math.ceil(Math.sqrt(sensors.length));
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    const offset = 0.01; // ~1km spacing
    return {
      ...sensor,
      geolocation: {
        lat: (center?.lat || 43.6150) + (row - gridSize / 2) * offset,
        lng: (center?.lng || -116.2023) + (col - gridSize / 2) * offset,
      },
    };
  });

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
      >
        {/* Project Boundary */}
        {projectBoundary && projectBoundary.coordinates && (
          <div>
            {/* Render boundary polygon if available */}
          </div>
        )}

        {/* Sensor Markers */}
        {sensorsWithLocations.map((sensor) => (
          <div key={sensor.id}>
            {/* Custom marker */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: '50%',
                top: '50%',
                // Position would be calculated from lat/lng
              }}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                  sensor.activationStatus === 'ACTIVE'
                    ? 'bg-green-500'
                    : sensor.activationStatus === 'PENDING'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
                title={`${sensor.serialNum} - ${sensor.param}`}
              />
            </div>
          </div>
        ))}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200">
        <div className="text-sm font-bold mb-2">Sensor Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white"></div>
            <span>Inactive</span>
          </div>
        </div>
      </div>

      {/* Sensor List Overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200 max-h-64 overflow-y-auto">
        <div className="text-sm font-bold mb-2">Sensor Network ({sensors.length})</div>
        <div className="space-y-1 text-xs">
          {sensorsWithLocations.map((sensor) => (
            <div key={sensor.id} className="flex items-center gap-2 py-1 border-b border-gray-100">
              <div
                className={`w-3 h-3 rounded-full ${
                  sensor.activationStatus === 'ACTIVE'
                    ? 'bg-green-500'
                    : sensor.activationStatus === 'PENDING'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
              />
              <span className="font-mono text-xs">{sensor.serialNum}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

