import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Home, Briefcase, ArrowLeft, Loader2, Navigation, Star, Share2, PanelLeftClose, Plus, Check, ShoppingBasket, X, LogOut, User as UserIcon, Store, Phone, Truck, FileText, AlignLeft, Package, Edit, Trash2, ToggleLeft, ToggleRight, Settings, IndianRupee } from 'lucide-react';
import { searchLocation } from '../services/osmService';
import { LocationResult, User, InventoryItem } from '../types';
import { RECENT_SEARCHES, CATEGORIES } from '../constants';

interface SidebarProps {
  onLocationSelect: (location: LocationResult) => void;
  onClose: () => void;
  onStartPickingLocation: () => void;
  pickedLocation: [number, number] | null;
  onSaveNewLocation: (location: LocationResult) => void;
  onUpdateLocation: (location: LocationResult) => void;
  user: User | null;
  onLogout: () => void;
  savedLocations: LocationResult[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    onLocationSelect, 
    onClose, 
    onStartPickingLocation, 
    pickedLocation,
    onSaveNewLocation,
    onUpdateLocation,
    user,
    onLogout,
    savedLocations
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Views: 'search' | 'details' | 'add' | 'manage'
  const [activeView, setActiveView] = useState<'search' | 'details' | 'add' | 'manage'>('search');
  const [selectedDetail, setSelectedDetail] = useState<LocationResult | null>(null);

  // --- Form State for Adding Place ---
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState('');
  const [newPlaceDesc, setNewPlaceDesc] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  
  // --- Inventory State for Registration ---
  const [inventoryItems, setInventoryItems] = useState<{name: string, price: string}[]>([]);
  const [currentItemName, setCurrentItemName] = useState('');
  const [currentItemPrice, setCurrentItemPrice] = useState('');

  // --- Management State (Editing existing place) ---
  const [managedLocation, setManagedLocation] = useState<LocationResult | null>(null);
  const [manageItemName, setManageItemName] = useState('');
  const [manageItemPrice, setManageItemPrice] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Vendor's own outlets
  const myOutlets = savedLocations.filter(loc => loc.ownerId === user?.id);

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

  // --- Registration Logic ---
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItemName.trim()) {
        setInventoryItems([...inventoryItems, { name: currentItemName.trim(), price: currentItemPrice.trim() }]);
        setCurrentItemName('');
        setCurrentItemPrice('');
    }
  };

  const handleRemoveItem = (index: number) => {
      setInventoryItems(inventoryItems.filter((_, i) => i !== index));
  };

  const handleSavePlace = () => {
      if (!pickedLocation || !newPlaceName || !user) return;
      
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
          items: inventoryItems.map((item, idx) => ({
              id: `init-${idx}-${Date.now()}`,
              name: item.name,
              price: item.price,
              inStock: true
          })),
          ownerId: user.id, // Link to current vendor
          contact: contactNumber,
          delivery: deliveryAvailable,
          description: newPlaceDesc,
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
      setContactNumber('');
      setDeliveryAvailable(false);
      setInventoryItems([]);
      setActiveView('search');
  };

  // --- Management Logic ---
  const handleManageOutlet = (outlet: LocationResult) => {
      onLocationSelect(outlet); // Center map
      setManagedLocation(outlet);
      // Reset management form state
      setManageItemName('');
      setManageItemPrice('');
      setEditingItemId(null);
      setActiveView('manage');
  };

  const getNormalizedItems = (loc: LocationResult): InventoryItem[] => {
      if (!loc.items) return [];
      return loc.items.map((item, idx) => {
          if (typeof item === 'string') {
              return { id: `legacy-${idx}`, name: item, inStock: true };
          }
          return item;
      });
  };

  const handleToggleStock = (itemToToggle: InventoryItem) => {
      if (!managedLocation) return;
      
      const currentItems = getNormalizedItems(managedLocation);
      const updatedItems = currentItems.map(item => 
          item.id === itemToToggle.id ? { ...item, inStock: !item.inStock } : item
      );
      
      const updatedLocation = { ...managedLocation, items: updatedItems };
      setManagedLocation(updatedLocation);
      onUpdateLocation(updatedLocation);
  };

  const handleAddManageItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!managedLocation || !manageItemName.trim()) return;

      const currentItems = getNormalizedItems(managedLocation);
      
      let updatedItems;
      if (editingItemId) {
          // Update existing item
          updatedItems = currentItems.map(item => 
              item.id === editingItemId 
              ? { ...item, name: manageItemName.trim(), price: manageItemPrice.trim() }
              : item
          );
          setEditingItemId(null); // Exit edit mode
      } else {
          // Add new item
          const newItem: InventoryItem = {
              id: `new-${Date.now()}`,
              name: manageItemName.trim(),
              price: manageItemPrice.trim(),
              inStock: true
          };
          updatedItems = [...currentItems, newItem];
      }

      const updatedLocation = { ...managedLocation, items: updatedItems };
      setManagedLocation(updatedLocation);
      onUpdateLocation(updatedLocation);
      
      setManageItemName('');
      setManageItemPrice('');
  };

  const handleEditItem = (item: InventoryItem) => {
      setManageItemName(item.name);
      setManageItemPrice(item.price || '');
      setEditingItemId(item.id);
  };

  const handleCancelEdit = () => {
      setManageItemName('');
      setManageItemPrice('');
      setEditingItemId(null);
  }

  const handleDeleteManageItem = (itemId: string) => {
      if (!managedLocation) return;
      
      const currentItems = getNormalizedItems(managedLocation);
      const updatedItems = currentItems.filter(item => item.id !== itemId);
      
      const updatedLocation = { ...managedLocation, items: updatedItems };
      setManagedLocation(updatedLocation);
      onUpdateLocation(updatedLocation);
      
      // If we deleted the item being edited, reset form
      if (editingItemId === itemId) {
          handleCancelEdit();
      }
  };

  const handleToggleDelivery = () => {
      if (!managedLocation) return;
      const updatedLocation = { ...managedLocation, delivery: !managedLocation.delivery };
      setManagedLocation(updatedLocation);
      onUpdateLocation(updatedLocation);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header / Search Area */}
      <div className="p-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
            {/* Back Button Handling */}
            {activeView !== 'search' ? (
                 <div className="flex items-center gap-2 flex-1">
                    <button 
                        onClick={() => {
                            if (activeView === 'manage') setActiveView('search');
                            else if (activeView === 'add') setActiveView('search');
                            else handleBackToSearch();
                        }} 
                        className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        {activeView === 'add' && <h2 className="text-lg font-bold text-gray-900 leading-none">Register Outlet</h2>}
                        {activeView === 'manage' && <h2 className="text-lg font-bold text-gray-900 leading-none">Manage Outlet</h2>}
                        {activeView === 'details' && <h2 className="text-lg font-bold text-gray-900 leading-none">Location</h2>}
                    </div>
                 </div>
            ) : (
                /* Search Input (Only on Search View) */
                <div className={`
                    relative flex items-center flex-1 bg-white border border-gray-300 rounded-full shadow-sm
                    focus-within:shadow-md focus-within:border-green-500 transition-all h-12
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
        
        {/* VIEW: Search Results & History & Vendor Dashboard */}
        {activeView === 'search' && (
            <>
                {/* VENDOR DASHBOARD SECTION */}
                {user?.role === 'vendor' && !query && (
                    <div className="mb-6 px-2">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">My Outlets</h3>
                            <button 
                                onClick={() => setActiveView('add')} 
                                className="text-xs flex items-center gap-1 text-green-600 font-bold hover:bg-green-50 px-2 py-1 rounded transition-colors"
                            >
                                <Plus size={14} /> Add New
                            </button>
                        </div>
                        
                        {/* List Vendor's Shops */}
                        <div className="space-y-2">
                            {myOutlets.length > 0 ? (
                                myOutlets.map(outlet => (
                                    <button
                                        key={outlet.place_id}
                                        onClick={() => handleManageOutlet(outlet)}
                                        className="w-full bg-white border border-green-100 shadow-sm rounded-xl p-3 flex items-center gap-3 hover:shadow-md hover:border-green-200 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                                            <Settings size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">{outlet.address?.road || outlet.display_name.split(',')[0]}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">
                                                    Manage Stock
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-1.5 rounded-full text-gray-400 group-hover:text-green-600 transition-colors">
                                            <Edit size={16} />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <button 
                                    onClick={() => setActiveView('add')}
                                    className="w-full bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-green-400 hover:bg-green-50/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus size={24} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-600 group-hover:text-green-700">List Your First Outlet</p>
                                    <p className="text-xs text-gray-400 text-center">Customers are waiting! Tap to place your shop on the map.</p>
                                </button>
                            )}
                        </div>
                    </div>
                )}

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
                        {!query && <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 mt-2">Explore Nearby</h3>}
                        
                        {RECENT_SEARCHES.map((item) => (
                             <div key={item.id} className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-4 rounded-lg cursor-pointer group">
                                <div className="p-2 rounded-full flex items-center justify-center bg-gray-100 text-gray-500">
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

        {/* VIEW: Vendor Management Dashboard */}
        {activeView === 'manage' && managedLocation && (
            <div className="px-4 pt-2 animate-fadeIn space-y-6">
                
                {/* Header Info */}
                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm border border-green-100 p-4">
                    <h1 className="text-xl font-bold text-gray-800">{managedLocation.address?.road || managedLocation.display_name.split(',')[0]}</h1>
                    <p className="text-xs text-gray-500 mt-1">{managedLocation.display_name}</p>
                    <div className="flex gap-2 mt-3">
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200">
                             <Check size={12} /> Live on Map
                         </div>
                         <button 
                            onClick={handleToggleDelivery}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border transition-colors ${managedLocation.delivery ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                         >
                             <Truck size={12} /> {managedLocation.delivery ? 'Delivery On' : 'Delivery Off'}
                         </button>
                    </div>
                </div>

                {/* Inventory Manager */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Package size={18} className="text-orange-600" />
                            Inventory
                        </h3>
                        <span className="text-xs text-gray-400">
                            {getNormalizedItems(managedLocation).filter(i => i.inStock).length} in stock
                        </span>
                    </div>

                    {/* Add / Edit Item Form */}
                    <form onSubmit={handleAddManageItem} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {editingItemId && <p className="text-xs text-orange-600 font-bold mb-2">Editing Item</p>}
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="text"
                                value={manageItemName}
                                onChange={(e) => setManageItemName(e.target.value)}
                                placeholder="Item Name (e.g. Potato)"
                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <input 
                                type="text"
                                value={manageItemPrice}
                                onChange={(e) => setManageItemPrice(e.target.value)}
                                placeholder="Price (₹)"
                                className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                type="submit" 
                                disabled={!manageItemName.trim()}
                                className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm font-bold flex items-center justify-center gap-1"
                            >
                                {editingItemId ? <Check size={16} /> : <Plus size={16} />}
                                {editingItemId ? 'Update Item' : 'Add to Stock'}
                            </button>
                            {editingItemId && (
                                <button 
                                    type="button" 
                                    onClick={handleCancelEdit}
                                    className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Item List */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        {getNormalizedItems(managedLocation).length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {getNormalizedItems(managedLocation).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleToggleStock(item)}
                                                className={`
                                                    w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center
                                                    ${item.inStock ? 'bg-green-500' : 'bg-gray-300'}
                                                `}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${item.inStock ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                            <div>
                                                <p className={`text-sm font-medium ${item.inStock ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                                                    {item.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-400">
                                                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                    {item.price && (
                                                        <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100 font-medium">
                                                            {item.price}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => handleEditItem(item)}
                                                className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteManageItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <Package size={24} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No items listed</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                     <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm mt-1">
                         <FileText size={16} />
                     </div>
                     <div>
                         <p className="text-sm font-bold text-gray-800">Quick Tip</p>
                         <p className="text-xs text-gray-600 mt-1">
                             Keep your stock and prices updated daily. Customers prefer stores with transparent pricing.
                         </p>
                     </div>
                </div>

            </div>
        )}

        {/* VIEW: Add Vendor Form */}
        {activeView === 'add' && (
            <div className="px-4 pt-2 animate-fadeIn space-y-6">
                
                {/* 1. Basic Info Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                        <Store size={18} className="text-green-600" />
                        <h3 className="text-sm font-bold text-gray-800">Outlet Details</h3>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Shop Name</label>
                        <input 
                            type="text"
                            value={newPlaceName}
                            onChange={(e) => setNewPlaceName(e.target.value)}
                            placeholder="e.g. Raju's Fresh Veggies"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setNewPlaceCategory(cat.id)}
                                    className={`
                                        flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all
                                        ${newPlaceCategory === cat.id 
                                            ? 'bg-green-50 border-green-500 text-green-700' 
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                                        }
                                    `}
                                >
                                    {cat.icon}
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Description</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                            <textarea 
                                value={newPlaceDesc}
                                onChange={(e) => setNewPlaceDesc(e.target.value)}
                                placeholder="Describe your shop... (e.g. Fresh organic vegetables daily)"
                                rows={2}
                                className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Contact & Services */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                     <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                        <Phone size={18} className="text-blue-600" />
                        <h3 className="text-sm font-bold text-gray-800">Contact & Services</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Mobile Number</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-medium border-r border-gray-300 pr-2">+91</span>
                            <input 
                                type="tel"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value.replace(/\D/g,'').slice(0,10))}
                                placeholder="98765 43210"
                                className="w-full pl-14 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm">
                                <Truck size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Delivery Service</p>
                                <p className="text-[10px] text-gray-500">Do you deliver to customers?</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setDeliveryAvailable(!deliveryAvailable)}
                            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${deliveryAvailable ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${deliveryAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* 3. Inventory Manager */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                        <Package size={18} className="text-orange-600" />
                        <h3 className="text-sm font-bold text-gray-800">Initial Stock & Prices</h3>
                    </div>
                    
                    <form onSubmit={handleAddItem} className="flex gap-2">
                        <div className="flex-1 space-y-2">
                            <input 
                                type="text"
                                value={currentItemName}
                                onChange={(e) => setCurrentItemName(e.target.value)}
                                placeholder="Item (e.g. Potato)"
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={currentItemPrice}
                                    onChange={(e) => setCurrentItemPrice(e.target.value)}
                                    placeholder="Price (e.g. ₹20/kg)"
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!currentItemName}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="min-h-[60px] p-2 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                        {inventoryItems.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {inventoryItems.map((item, idx) => (
                                    <span key={idx} className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                                        {item.name}
                                        {item.price && <span className="text-orange-600 font-medium">({item.price})</span>}
                                        <button onClick={() => handleRemoveItem(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-2">
                                <span className="text-xs italic">No items added yet</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Location Picker */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-2 border-b border-gray-50 pb-2 mb-3">
                        <MapPin size={18} className="text-red-600" />
                        <h3 className="text-sm font-bold text-gray-800">Location</h3>
                    </div>

                    {pickedLocation ? (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="bg-white p-1.5 rounded-full text-green-600 shadow-sm">
                                <Check size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-green-800">Coordinates Set</p>
                                <p className="text-[10px] text-green-700 font-mono mt-0.5">
                                    {pickedLocation[0].toFixed(6)}, {pickedLocation[1].toFixed(6)}
                                </p>
                            </div>
                            <button onClick={onStartPickingLocation} className="text-xs text-green-700 underline font-medium hover:text-green-800">
                                Change
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={onStartPickingLocation}
                            className="w-full py-4 border-2 border-dashed border-red-200 bg-red-50/50 rounded-xl text-red-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <MapPin size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-sm">Pin Location on Map</span>
                        </button>
                    )}
                </div>

                {/* Submit Action */}
                <div className="pb-8 pt-2">
                    <button 
                        disabled={!newPlaceName || !pickedLocation}
                        onClick={handleSavePlace}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Store size={20} />
                        Publish Outlet
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3">
                        By publishing, you agree to our terms of service for vendors.
                    </p>
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
                                {/* Only show IN STOCK items to customers */}
                                {selectedDetail.items.map((item, i) => {
                                    // Handle both legacy strings and new object format
                                    const itemName = typeof item === 'string' ? item : (item.inStock ? item.name : null);
                                    if (!itemName) return null;
                                    
                                    const itemPrice = typeof item !== 'string' ? item.price : null;

                                    return (
                                        <span key={i} className="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-lg border border-green-200 flex items-center gap-1">
                                            {itemName}
                                            {itemPrice && <span className="text-xs text-green-700 opacity-75 border-l border-green-300 pl-1 ml-1">{itemPrice}</span>}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                                No stock information available.
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
        
        {/* Footer / Profile Section */}
        <div className="p-3 border-t bg-gray-50">
            {user ? (
                <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-sm">
                             {user.name.charAt(0)}
                         </div>
                         <div>
                             <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                             <p className="text-xs text-gray-500 capitalize">{user.role} Access</p>
                         </div>
                     </div>
                     <button 
                        onClick={onLogout}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Log Out"
                     >
                         <LogOut size={20} />
                     </button>
                </div>
            ) : (
                <div className="text-center text-[10px] text-gray-400">
                    Not logged in
                </div>
            )}
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