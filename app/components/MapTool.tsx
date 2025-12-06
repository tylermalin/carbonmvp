'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { MapRef, ViewState } from 'react-map-gl/mapbox';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token - set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file
// For development, you can get a free token from https://account.mapbox.com/
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  console.warn('Mapbox access token not found. Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file');
}

interface MapToolProps {
  onBoundaryChange: (boundary: string | null, hectares?: number) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Calculate hectares from GeoJSON polygon coordinates using spherical excess formula
function calculateHectaresFromPolygon(geometry: any): number {
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates || !geometry.coordinates[0]) {
    return 0;
  }

  const coordinates = geometry.coordinates[0]; // First ring (exterior)
  if (coordinates.length < 3) {
    return 0;
  }

  // Calculate area using spherical excess formula (more accurate for lat/lng)
  const R = 6371000; // Earth's radius in meters
  let area = 0;
  
  // Convert coordinates to radians
  const radCoords = coordinates.map(([lon, lat]: [number, number]) => [
    lon * Math.PI / 180,
    lat * Math.PI / 180
  ]);

  // Calculate spherical excess using the formula for polygon area on a sphere
  for (let i = 0; i < radCoords.length - 1; i++) {
    const [lon1, lat1] = radCoords[i];
    const [lon2, lat2] = radCoords[i + 1];
    
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  // Handle the last point connecting back to the first
  const [lon1, lat1] = radCoords[radCoords.length - 2];
  const [lon2, lat2] = radCoords[0];
  area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));

  area = Math.abs(area * R * R / 2);
  
  // Convert from square meters to hectares (1 hectare = 10,000 square meters)
  const hectares = area / 10000;
  
  return Math.round(hectares * 100) / 100; // Round to 2 decimal places
}

export default function MapTool({ onBoundaryChange, initialCenter, initialZoom }: MapToolProps) {
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewState, setViewState] = useState<ViewState>({
    longitude: initialCenter?.[1] || -116.2023,
    latitude: initialCenter?.[0] || 43.6150,
    zoom: initialZoom || 12,
  });
  const [hasPolygon, setHasPolygon] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    
    // Event handlers
    const onDrawCreate = () => {
      if (!drawRef.current) return;
      const features = drawRef.current.getAll();
      if (features.features.length > 0) {
        const polygon = features.features[0];
        const coordinates = JSON.stringify(polygon.geometry);
        const hectares = calculateHectaresFromPolygon(polygon.geometry);
        onBoundaryChange(coordinates, hectares);
        setHasPolygon(true);
      }
    };

    const onDrawUpdate = () => {
      if (!drawRef.current) return;
      const features = drawRef.current.getAll();
      if (features.features.length > 0) {
        const polygon = features.features[0];
        const coordinates = JSON.stringify(polygon.geometry);
        const hectares = calculateHectaresFromPolygon(polygon.geometry);
        onBoundaryChange(coordinates, hectares);
        setHasPolygon(true);
      } else {
        onBoundaryChange(null, 0);
        setHasPolygon(false);
      }
    };

    const onDrawDelete = () => {
      onBoundaryChange(null, 0);
      setHasPolygon(false);
    };

    // Wait for map to be fully loaded
    const initializeDraw = () => {
      if (drawRef.current) {
        try {
          map.removeControl(drawRef.current);
        } catch (e) {
          // Control might not exist yet
        }
      }
      
      // Initialize Mapbox Draw
      const draw = new MapboxDraw({
        displayControlsDefault: true,
        controls: {
          point: false,
          line_string: false,
          polygon: true,
          trash: true,
        },
        defaultMode: 'simple_select',
      });

      map.addControl(draw);
      drawRef.current = draw;

      // Add event listeners
      map.on('draw.create', onDrawCreate);
      map.on('draw.update', onDrawUpdate);
      map.on('draw.delete', onDrawDelete);
    };

    if (map.loaded()) {
      initializeDraw();
    } else {
      map.once('load', initializeDraw);
    }

    return () => {
      // Remove event listeners
      map.off('draw.create', onDrawCreate);
      map.off('draw.update', onDrawUpdate);
      map.off('draw.delete', onDrawDelete);
      
      // Remove draw control
      if (drawRef.current) {
        try {
          map.removeControl(drawRef.current);
        } catch (e) {
          // Ignore errors during cleanup
        }
        drawRef.current = null;
      }
    };
  }, [onBoundaryChange]);

  const handleSearch = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!searchQuery.trim() || !mapRef.current || !MAPBOX_ACCESS_TOKEN) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setViewState({
          ...viewState,
          longitude: lng,
          latitude: lat,
          zoom: 14,
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const clearPolygon = () => {
    if (drawRef.current && mapRef.current) {
      drawRef.current.deleteAll();
      onBoundaryChange(null, 0);
      setHasPolygon(false);
    }
  };

  const startDrawing = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar - Using div instead of form to avoid nesting */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e as any);
            }
          }}
          placeholder="Search for an address or location..."
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="px-6 py-2 bg-malama-primary text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md"
        >
          Search
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-96 w-full rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg">
        {MAPBOX_ACCESS_TOKEN ? (
          <>
            <Map
              ref={mapRef}
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/satellite-v9"
              attributionControl={false}
            >
              {/* Drawing controls will be added via MapboxDraw */}
            </Map>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600">
            <div className="text-center p-6">
              <p className="font-semibold mb-2">Mapbox Token Required</p>
              <p className="text-sm">Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file</p>
              <p className="text-xs mt-2 text-gray-500">
                Get a free token at{' '}
                <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  account.mapbox.com
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Drawing Instructions Overlay */}
        {!hasPolygon && (
          <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg border-2 border-malama-primary max-w-xs z-10">
            <p className="text-sm font-semibold text-malama-primary mb-2">
              Draw Your Project Boundary
            </p>
            <p className="text-xs text-gray-700 mb-3">
              Click the button below to start drawing, then click on the map to create your polygon boundary. Hectares will be automatically calculated.
            </p>
            <button
              onClick={startDrawing}
              className="w-full px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md text-sm"
            >
              Start Drawing Polygon
            </button>
          </div>
        )}

        {/* Clear Polygon Button */}
        {hasPolygon && (
          <div className="absolute top-4 right-4">
            <button
              onClick={clearPolygon}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md text-sm"
            >
              Clear Boundary
            </button>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {hasPolygon ? (
          <>
            <span className="text-green-600 font-semibold">✓</span>
            <span className="text-gray-700">Project boundary defined</span>
          </>
        ) : (
          <>
            <span className="text-gray-400">○</span>
            <span className="text-gray-500">No boundary drawn yet</span>
          </>
        )}
      </div>
    </div>
  );
}

