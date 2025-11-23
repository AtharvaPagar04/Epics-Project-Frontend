import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Home, Briefcase, ArrowLeft, Loader2, Navigation, Star, Share2, PanelLeftClose, Plus, Check, ShoppingBasket, X } from 'lucide-react';
import { searchLocation } from '../services/osmService';
import { LocationResult } from '../types';
import { RECENT_SEARCHES, CATEGORIES } from '../constants';

interface SidebarProps {
  onLocationSelect: (location: LocationResult) => void;
  onClose: () => void;
  onStartPickingLocation: () => void;
  pickedLocation: [number, number] | null;
  onSaveNewLocation: (location: LocationResult) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    onLocationSelect, 
    onClose, 
    onStartPickingLocation, 
    pickedLocation,
    onSaveNewLocation
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'search' | 'details' | 'add'>('search');
  const [selectedDetail, setSelectedDetail] = useState<LocationResult | null>(null);

  // Form State for Adding Place
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState('');
  const [newPlaceDesc, setNewPlaceDesc] = useState('');
  
  // Inventory State
  const [inventoryItems, setInventoryItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true);
        const data = await searchLocation(query);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // If a location is picked externally (from map click), ensure we are in 'add' mode
  useEffect(() => {
      if (pickedLocation) {
          setActiveView('add');
      }
  }, [pickedLocation]);

  const handleSelect = (item: LocationResult) => {
    onLocationSelect(item);
    setSelectedDetail(item);
    setActiveView('details');
  };

  const handleBackToSearch = () => {
    setActiveView('search');
    setSelectedDetail(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem.trim()) {
        setInventoryItems([...inventoryItems, currentItem.trim()]);
        setCurrentItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
      setInventoryItems(inventoryItems.filter((_, i) => i !== index));
  };

  const handleSavePlace = () => {
      if (!pickedLocation || !newPlaceName) return;
      
      const newLocation: LocationResult = {
          place_id: Date.now(), // Mock ID
          licence: "Custom",
          osm_type: "node",
          osm_id: Date.now(),
          boundingbox: [],
          lat: pickedLocation[0].toString(),
          lon: pickedLocation[1].toString(),
          display_name: `${newPlaceName}`,
          class: newPlaceCategory || 'shop',
          type: newPlaceCategory || 'greengrocer',
          importance: 0.5,
          items: inventoryItems,
          address: {
              road: newPlaceName,
              city: "Local Vendor", 
              country: "India"
          }
      };
      
      onSaveNewLocation(newLocation);
      
      // Reset form
      setNewPlaceName('');
      setNewPlaceCategory('');
      setNewPlaceDesc('');
      setInventoryItems([]);
      setActiveView('search');
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header / Search Area */}
      <div className="p-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            {activeView === 'search' && (
                <button onClick={onClose} className="sm:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
            )}

            {/* Title for Add Mode */}
            {activeView === 'add' && (
                 <div className="flex items-center gap-2 flex-1">
                    <button 
                        onClick={() => setActiveView('search')} 
                        className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">Register Vendor</h2>
                 </div>
            )}

            {/* Search Input */}
            <div className={`
                relative flex items-center flex-1 bg-white border border-gray-300 rounded-full shadow-sm
                focus-within:shadow-md focus-within:border-green-500 transition-all h-12
                ${(activeView === 'details' || activeView === 'add') ? 'hidden' : 'flex'}
            `}>
                <div className="pl-4 text-gray-400">
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                </div>
                <input
                    type="text"
                    className="w-full p-3 bg-transparent outline-none text-gray-700 placeholder-gray-500 text-base"
                    placeholder="Search locations..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button 
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="pr-4 text-gray-400 hover:text-gray-600"
                    >
                        <ArrowLeft size={20} className="rotate-45" /> 
                    </button>
                )}
            </div>

            {/* Desktop Add Button (visible in search view) */}
            {activeView === 'search' && (
                <button 
                    onClick={() => setActiveView('add')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors ml-1"
                    title="Register a Vendor"
                >
                    <Plus size={24} />
                </button>
            )}

            {/* Desktop Collapse Button */}
            {activeView === 'search' && (
                <button 
                    onClick={onClose} 
                    className="hidden sm:flex p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="Collapse side panel"
                >
                    <PanelLeftClose size={24} />
                </button>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
        
        {/* VIEW: Search Results & History */}
        {activeView === 'search' && (
            <>
                {/* Active Search Results */}
                {query.length > 0 && results.length > 0 && (
                    <div className="mb-4 mt-2">
                        {results.map((item) => (
                            <button
                                key={item.place_id}
                                onClick={() => handleSelect(item)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-start gap-3 rounded-lg transition-colors group border-b border-transparent hover:border-gray-100"
                            >
                                <div className="mt-1 bg-gray-100 p-2 rounded-full group-hover:bg-white transition-colors">
                                    <MapPin size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 line-clamp-1 text-sm">
                                        {item.address?.road || item.display_name.split(',')[0]}
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                        {item.display_name}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {query.length > 0 && results.length === 0 && !isLoading && (
                     <div className="text-center py-10 text-gray-500 text-sm">
                        <p>No results found</p>
                     </div>
                )}

                {/* Recent History */}
                {(!query || results.length < 3) && (
                    <div className="mt-2">
                        {!query && <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 mt-2">Vendors Nearby</h3>}
                        
                        {RECENT_SEARCHES.map((item) => (
                             <div key={item.id} className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-4 rounded-lg cursor-pointer group">
                                <div className="p-2 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                                    <ShoppingBasket size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.location}</p>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </>
        )}

        {/* VIEW: Add Vendor Form */}
        {activeView === 'add' && (
            <div className="px-4 pt-2 animate-fadeIn">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Vendor Name</label>
                        <input 
                            type="text"
                            value={newPlaceName}
                            onChange={(e) => setNewPlaceName(e.target.value)}
                            placeholder="e.g. Raju's Fresh Veggies"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Vendor Type</label>
                        <select
                            value={newPlaceCategory}
                            onChange={(e) => setNewPlaceCategory(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white transition-all"
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                            <option value="custom">Other</option>
                        </select>
                    </div>

                    {/* Inventory Manager */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Available Items</label>
                        
                        <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
                            <input 
                                type="text"
                                value={currentItem}
                                onChange={(e) => setCurrentItem(e.target.value)}
                                placeholder="e.g. Potatoes, Apples..."
                                className="flex-1 p-2 border border-gray-300 rounded text-sm outline-none focus:border-green-500"
                            />
                            <button 
                                type="submit" 
                                disabled={!currentItem}
                                className="px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </form>

                        {inventoryItems.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {inventoryItems.map((item, idx) => (
                                    <span key={idx} className="bg-white border border-green-200 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        {item}
                                        <button onClick={() => handleRemoveItem(idx)} className="text-green-400 hover:text-red-500">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No items added yet. Add what this vendor is selling.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Location</label>
                        {pickedLocation ? (
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <Check size={18} className="text-green-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800">Location Set</p>
                                    <p className="text-xs text-green-600">{pickedLocation[0].toFixed(5)}, {pickedLocation[1].toFixed(5)}</p>
                                </div>
                                <button onClick={onStartPickingLocation} className="text-xs text-green-700 underline font-medium">Change</button>
                            </div>
                        ) : (
                            <button 
                                onClick={onStartPickingLocation}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2 font-medium"
                            >
                                <MapPin size={18} />
                                Set Location on Map
                            </button>
                        )}
                    </div>

                    <div className="pt-2 flex gap-3 pb-8">
                        <button 
                            disabled={!newPlaceName || !pickedLocation}
                            onClick={handleSavePlace}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Save Vendor
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: Details Panel */}
        {activeView === 'details' && selectedDetail && (
            <div className="animate-fadeIn">
                {/* Hero Image */}
                <div className="h-48 w-full bg-gray-200 relative mb-4 -mt-4 mx-0 group">
                    <img 
                        src={`https://picsum.photos/seed/${selectedDetail.place_id}/800/400`} 
                        alt="Location" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                        <h1 className="text-2xl font-bold text-white leading-tight mb-1 drop-shadow-md">
                             {selectedDetail.address?.road || selectedDetail.display_name.split(',')[0]}
                        </h1>
                        <p className="text-sm text-gray-200 capitalize opacity-90">
                            {selectedDetail.type.replace(/_/g, ' ')}
                        </p>
                    </div>

                    <button 
                        onClick={handleBackToSearch}
                        className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-md text-gray-700 hover:bg-white transition-all hover:scale-105"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <div className="px-4">
                    {/* Available Items Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <ShoppingBasket size={16} className="text-green-600" />
                            Available Today
                        </h3>
                        {selectedDetail.items && selectedDetail.items.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedDetail.items.map((item, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-lg border border-green-200">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                                No specific inventory listed.
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-6 border-b border-gray-100 pb-6 overflow-x-auto hide-scrollbar">
                        <ActionButton icon={<Navigation size={20} />} label="Directions" primary />
                        <ActionButton icon={<MapPin size={20} />} label="Save" />
                        <ActionButton icon={<Share2 size={20} />} label="Share" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-gray-700">
                             <MapPin className="shrink-0 mt-1 text-gray-400" size={18} />
                             <p className="text-sm leading-relaxed">{selectedDetail.display_name}</p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                             <Clock className="shrink-0 text-gray-400" size={18} />
                             <p className="text-sm text-green-700 font-medium">Open now <span className="text-gray-500 font-normal">· Fresh Stock</span></p>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
        
        {/* Footer */}
        <div className="p-2 border-t text-center text-[10px] text-gray-400 bg-gray-50">
            Local Vendor Network
        </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; primary?: boolean }> = ({ icon, label, primary }) => (
    <button className={`
        flex flex-col items-center gap-1 min-w-[64px]
        ${primary ? 'text-green-600' : 'text-green-500'}
        hover:opacity-80 transition-opacity
    `}>
        <div className={`
            w-10 h-10 rounded-full flex items-center justify-center border transition-colors shadow-sm
            ${primary ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-100 hover:bg-green-50'}
        `}>
            {icon}
        </div>
        <span className="text-xs font-medium">{label}</span>
    </button>
);