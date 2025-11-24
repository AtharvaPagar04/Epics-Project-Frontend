import React, { useState, useCallback, useMemo } from 'react';
import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { DetailPanel } from './components/DetailPanel';
import { AuthPage } from './components/AuthPage';
import { LocationResult, User } from './types';
import { CATEGORIES } from './constants';
import { Menu, Search, X } from 'lucide-react';
import { SAVED_LOCATIONS } from './db/locations';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // --- Main App Logic ---
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Right Side Detail Panel State
  const [selectedShop, setSelectedShop] = useState<LocationResult | null>(null);

  // Custom Location Logic
  const [savedLocations, setSavedLocations] = useState<LocationResult[]>(SAVED_LOCATIONS);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [tempCoords, setTempCoords] = useState<[number, number] | null>(null);

  const handleLocationSelect = useCallback((location: LocationResult) => {
    setSelectedLocation(location);
    setSelectedShop(null); // Close right panel if picking from search
    // On mobile, close the sidebar when a location is picked to show the map
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  }, []);

  const handleStartPicking = useCallback(() => {
      setSidebarOpen(false);
      setSelectedShop(null);
      setIsPickingLocation(true);
      // Reset any previous temp coords so user has to click again
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
      if (isPickingLocation) {
          setTempCoords([lat, lng]);
          setIsPickingLocation(false);
          setSidebarOpen(true);
      } else {
          // If clicking background map (not marker), close right panel
          setSelectedShop(null);
      }
  }, [isPickingLocation]);

  const handleMarkerClick = useCallback((location: LocationResult) => {
      setSelectedShop(location);
      // Optionally close left sidebar on mobile to make room
      if (window.innerWidth < 768) {
          setSidebarOpen(false);
      }
  }, []);

  const handleCancelPicking = useCallback(() => {
      setIsPickingLocation(false);
      setSidebarOpen(true);
  }, []);

  const handleSaveNewLocation = useCallback((location: LocationResult) => {
      setSavedLocations(prev => [...prev, location]);
      setTempCoords(null); // Clear temp marker
      
      // Auto-select the new location
      setSelectedLocation(location);
  }, []);

  const handleCategoryClick = useCallback((categoryId: string) => {
      setSelectedCategory(prev => prev === categoryId ? null : categoryId);
      // If we select a category, deselect specific location so we can see the map view
      setSelectedLocation(null);
      setSelectedShop(null);
  }, []);

  // Filter locations based on selected category
  const filteredLocations = useMemo(() => {
      if (!selectedCategory) return savedLocations;
      return savedLocations.filter(loc => loc.type === selectedCategory);
  }, [savedLocations, selectedCategory]);


  // --- Auth Flow Checks ---
  if (!user) {
      return <AuthPage onLogin={setUser} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapView 
            selectedLocation={selectedLocation} 
            savedLocations={filteredLocations}
            onMapClick={handleMapClick}
            tempLocation={tempCoords}
            onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* Picking Mode Banner */}
      {isPickingLocation && (
          <div className="absolute top-6 left-0 right-0 z-40 flex justify-center pointer-events-none animate-bounce-short">
              <div className="bg-white/95 backdrop-blur shadow-xl rounded-full px-6 py-3 border-2 border-blue-500 pointer-events-auto flex items-center gap-4">
                  <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm">Tap on the map</span>
                      <span className="text-xs text-gray-500">Select a location for your new place</span>
                  </div>
                  <button 
                    onClick={handleCancelPicking}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                  >
                      <X size={20} />
                  </button>
              </div>
          </div>
      )}

      {/* Floating UI Container */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col sm:flex-row justify-between">
        
        {/* Sidebar (Left Panel) */}
        <div 
          className={`
            pointer-events-auto
            bg-white shadow-xl h-full flex flex-col transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'w-full sm:w-[400px] translate-x-0' : 'w-0 -translate-x-full opacity-0'}
            absolute sm:relative z-20 border-r border-gray-200
          `}
        >
            <Sidebar 
                onLocationSelect={handleLocationSelect} 
                onClose={() => setSidebarOpen(false)}
                onStartPickingLocation={handleStartPicking}
                pickedLocation={tempCoords}
                onSaveNewLocation={handleSaveNewLocation}
                user={user}
                onLogout={() => setUser(null)}
                savedLocations={savedLocations}
            />
        </div>

        {/* Floating Search Bar (Visible when sidebar is closed AND not picking location) */}
        {!sidebarOpen && !isPickingLocation && (
             <div className="pointer-events-auto absolute top-4 left-4 z-30 w-[calc(100%-32px)] sm:w-[360px] animate-fadeIn">
                 <div 
                    onClick={() => setSidebarOpen(true)}
                    className="bg-white rounded-full shadow-xl p-2 pl-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200 group"
                 >
                     <button className="text-gray-500 group-hover:text-gray-700">
                        <Menu size={20} />
                     </button>
                     <div className="flex-1">
                        <span className="text-gray-700 font-medium text-sm">Search Google Maps</span>
                     </div>
                     <div className="w-px h-6 bg-gray-200"></div>
                     <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                        <Search size={18} />
                     </button>
                 </div>
             </div>
        )}

        {/* Top Category Pills (Floating) - Hide during picking */}
        {!isPickingLocation && (
            <div className={`
                pointer-events-auto
                absolute
                transition-all duration-300 ease-in-out
                ${sidebarOpen 
                    ? 'hidden sm:flex left-[410px] top-4' // Desktop: Pushed right. Mobile: Hidden (sidebar covers)
                    : 'flex top-[80px] left-4 sm:top-4 sm:left-[390px]' // Desktop: Next to floating bar. Mobile: Below floating bar
                }
                right-0
                items-center gap-2 overflow-x-auto pr-4 pb-2 hide-scrollbar z-20
            `}>
                {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                        <button 
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`
                                shadow-sm hover:shadow-md px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all hover:-translate-y-0.5 border
                                ${isActive 
                                    ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-200' 
                                    : 'bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-gray-50 border-gray-200/50'
                                }
                            `}
                        >
                            <span className={isActive ? 'text-white' : ''}>{cat.icon}</span>
                            {cat.label}
                            {isActive && <X size={14} className="ml-1 opacity-75" />}
                        </button>
                    );
                })}
            </div>
        )}

        {/* Right Detail Panel - Only renders if selectedShop is present, but always mounted for transition */}
        <div className="pointer-events-auto z-50">
            <DetailPanel 
                location={selectedShop} 
                isOpen={!!selectedShop}
                onClose={() => setSelectedShop(null)} 
            />
        </div>
      </div>
    </div>
  );
}