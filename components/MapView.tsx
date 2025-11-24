import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocationResult } from '../types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MP_BOUNDS } from '../constants';
import { Crosshair } from 'lucide-react';

// Fix for default Leaflet marker icons in React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to create colored icons
const createColorIcon = (color: string) => L.icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Mapping category IDs to Marker Colors
const CATEGORY_ICONS: Record<string, L.Icon> = {
    vegetables: createColorIcon('green'),
    fruits: createColorIcon('red'),
    grains: createColorIcon('gold'),
};

const FALLBACK_ICON = createColorIcon('blue');
const TEMP_ICON = createColorIcon('black'); // Distinct from others
const MARKER_VISIBILITY_THRESHOLD = 13; // Markers disappear if zoomed out further than this

// Helper to get tailwind classes for badges based on category
const getCategoryColorClass = (type: string) => {
    switch(type) {
        case 'vegetables': return 'bg-green-100 text-green-800 border-green-200';
        case 'fruits': return 'bg-red-100 text-red-800 border-red-200';
        case 'grains': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
};

interface MapViewProps {
  selectedLocation: LocationResult | null;
  savedLocations?: LocationResult[];
  onMapClick?: (lat: number, lng: number) => void;
  tempLocation?: [number, number] | null;
  onMarkerClick?: (location: LocationResult) => void;
}

// Component to handle map resizing issues when mounting
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        // Trigger a resize calculation to ensure tiles render correctly
        // This fixes issues when switching from Auth page to Map page
        const timeout = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timeout);
    }, [map]);
    return null;
};

// Helper component to programmatically move the map
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    // Double check validity before flying
    if (!isNaN(center[0]) && !isNaN(center[1])) {
        map.flyTo(center, zoom, {
            duration: 1.5,
            easeLinearity: 0.25
        });
    }
  }, [center, zoom, map]);

  return null;
};

// Helper to handle map events (click and zoom tracking)
const MapEvents: React.FC<{ 
    onClick?: (lat: number, lng: number) => void;
    onZoomChange: (zoom: number) => void;
}> = ({ onClick, onZoomChange }) => {
  const map = useMapEvents({
    click(e) {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    },
    zoomend() {
        onZoomChange(map.getZoom());
    }
  });
  return null;
};

// Recenter Control Button Component
const RecenterControl = () => {
    const map = useMap();
    // Zoom level 13 provides approximately a 3.5km - 5km view radius depending on latitude
    const RECENTER_ZOOM = 13;
  
    const handleRecenter = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent map click
      
      if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const { latitude, longitude } = position.coords;
                  if (!isNaN(latitude) && !isNaN(longitude)) {
                      map.flyTo([latitude, longitude], RECENTER_ZOOM, {
                          animate: true,
                          duration: 1.5
                      });
                  }
              },
              (error) => {
                  console.warn("Geolocation failed or denied:", error);
                  // Fallback to Primary Location (VIT Bhopal)
                  map.flyTo(DEFAULT_CENTER, RECENTER_ZOOM, {
                      animate: true,
                      duration: 1.5
                  });
              },
              { enableHighAccuracy: true, timeout: 5000 }
          );
      } else {
          map.flyTo(DEFAULT_CENTER, RECENTER_ZOOM, {
               animate: true,
               duration: 1.5
          });
      }
    };
  
    return (
      <div className="absolute bottom-6 right-4 z-[999]">
          <button 
              onClick={handleRecenter}
              className="bg-white p-3 rounded-full shadow-xl border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all focus:outline-none"
              title="Recenter to My Location (3.5km radius)"
          >
              <Crosshair size={24} />
          </button>
      </div>
    );
};

export const MapView: React.FC<MapViewProps> = ({ 
    selectedLocation, 
    savedLocations = [], 
    onMapClick,
    tempLocation,
    onMarkerClick
}) => {
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  
  // Robust coordinate parsing to prevent crashes
  const getSafePosition = (loc: LocationResult): [number, number] | null => {
      if (!loc || !loc.lat || !loc.lon) return null;
      const lat = parseFloat(loc.lat);
      const lon = parseFloat(loc.lon);
      if (isNaN(lat) || isNaN(lon)) return null;
      return [lat, lon];
  };

  const selectedPos = selectedLocation ? getSafePosition(selectedLocation) : null;
  
  // Determine map center with fallback chain
  // Priority: Selected Location -> Temp Location -> Default Center
  const centerPos: [number, number] = selectedPos 
    || tempLocation 
    || DEFAULT_CENTER;

  // Final NaN check for centerPos to be absolutely safe
  const safeCenter: [number, number] = (isNaN(centerPos[0]) || isNaN(centerPos[1])) 
    ? DEFAULT_CENTER 
    : centerPos;

  const zoom = selectedLocation ? 16 : DEFAULT_ZOOM;

  return (
    <MapContainer 
      center={DEFAULT_CENTER} 
      zoom={DEFAULT_ZOOM} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false} 
      className="h-full w-full z-0 outline-none" // Explicit tailwind classes for size
      maxBounds={MP_BOUNDS} // Restrict panning to MP
      maxBoundsViscosity={1.0} // "Solid" bounce back
      minZoom={6} // Prevent zooming out too far
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapResizer />
      <MapController center={safeCenter} zoom={zoom} />
      
      <RecenterControl />

      <MapEvents onClick={onMapClick} onZoomChange={setCurrentZoom} />

      {/* Render Saved/DB Locations - Only when zoomed in */}
      {currentZoom >= MARKER_VISIBILITY_THRESHOLD && savedLocations.map((loc) => {
         const pos = getSafePosition(loc);
         if (!pos) return null; // Skip invalid locations

         const markerIcon = CATEGORY_ICONS[loc.type] || FALLBACK_ICON;
         const badgeClass = getCategoryColorClass(loc.type);

         return (
            <Marker 
                key={loc.place_id} 
                position={pos}
                icon={markerIcon}
                eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                    click: () => onMarkerClick && onMarkerClick(loc)
                }}
            >
                <Popup className="font-sans" closeButton={false}>
                    <div className="p-1 min-w-[160px]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}>
                                {loc.type || 'Vendor'}
                            </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 leading-tight">{loc.address?.road || loc.display_name.split(',')[0]}</h3>
                        
                        {/* Items Preview */}
                        {loc.items && loc.items.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {loc.items.slice(0, 3).map((item, i) => {
                                    // Handle string vs object item
                                    const name = typeof item === 'string' ? item : item.name;
                                    const price = typeof item !== 'string' && item.price ? ` (${item.price})` : '';
                                    return (
                                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                            {name}{price}
                                        </span>
                                    );
                                })}
                                {loc.items.length > 3 && (
                                    <span className="text-[10px] text-gray-400 pl-1">+{loc.items.length - 3} more</span>
                                )}
                            </div>
                        )}

                        <p className="text-[10px] text-gray-500 mt-2 leading-3">{loc.display_name}</p>
                        <div className="mt-2 text-[10px] text-blue-600 font-bold">Click for details</div>
                    </div>
                </Popup>
            </Marker>
         );
      })}

      {/* Render User Selected Search Result - Always visible regardless of zoom */}
      {selectedLocation && selectedPos && (
        <Marker position={selectedPos}>
          <Popup className="font-sans">
            <div className="p-1">
                <h3 className="font-bold text-sm">{selectedLocation.address?.road || selectedLocation.display_name.split(',')[0]}</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedLocation.display_name}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Render Temp Picked Location */}
      {tempLocation && !selectedLocation && !isNaN(tempLocation[0]) && !isNaN(tempLocation[1]) && (
          <Marker position={tempLocation} icon={TEMP_ICON}>
             <Popup className="font-sans" autoPan={false}>
                 <div className="p-1">
                     <p className="text-xs font-bold text-gray-900">New Vendor Location</p>
                 </div>
             </Popup>
          </Marker>
      )}
    </MapContainer>
  );
};