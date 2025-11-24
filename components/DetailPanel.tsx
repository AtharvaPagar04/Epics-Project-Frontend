import React from 'react';
import { LocationResult } from '../types';
import { X, Star, Phone, Clock, MapPin, ShoppingBag, Truck, ShieldCheck, FileText } from 'lucide-react';

interface DetailPanelProps {
  location: LocationResult | null;
  onClose: () => void;
  isOpen: boolean;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ location, onClose, isOpen }) => {
  if (!location) return null;

  // Derived data
  const rating = (4 + (location.place_id % 10) / 10).toFixed(1);
  const contactDisplay = location.contact || `+91 98765 ${location.place_id.toString().slice(-5)}`;
  // Default delivery to true if undefined (for old mock data), otherwise use specific value
  const deliveryStatus = location.delivery !== undefined ? location.delivery : true; 

  return (
    <div className={`
        fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl z-[50]
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      {/* Header Image */}
      <div className="relative h-64 w-full group">
        <img 
            src={`https://picsum.photos/seed/${location.place_id}/800/600`} 
            alt="Store Front" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-all z-10"
        >
            <X size={20} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    {location.type}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" /> {rating}
                </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight shadow-sm mb-1">
                {location.display_name.split(',')[0]}
            </h2>
            <p className="text-gray-300 text-xs flex items-center gap-1">
                <MapPin size={12} /> {location.address?.suburb || location.address?.city || 'Sehore'}
            </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8 bg-white dark:bg-slate-900">
          
          {/* Quick Stats */}
          <div className="flex items-center justify-between px-2">
              <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                      <Clock size={20} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Status</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Open Now</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                  <div className={`p-2 rounded-full ${deliveryStatus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                      <Truck size={20} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Delivery</span>
                  <span className={`text-xs font-bold ${deliveryStatus ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                      {deliveryStatus ? 'Available' : 'No Delivery'}
                  </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full">
                      <ShieldCheck size={20} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Quality</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Verified</span>
              </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* About / Address */}
          <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">About Vendor</h3>
              
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  {location.description && (
                      <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 mb-2 border-b border-gray-200 dark:border-slate-700 pb-3">
                          <FileText size={16} className="shrink-0 mt-0.5 text-gray-400" />
                          <p className="leading-relaxed italic">{location.description}</p>
                      </div>
                  )}

                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" />
                      <p className="leading-relaxed">{location.display_name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Phone size={16} className="shrink-0 text-gray-400" />
                      <p>{contactDisplay}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Clock size={16} className="shrink-0 text-gray-400" />
                      <p>08:00 AM - 09:00 PM (Daily)</p>
                  </div>
              </div>
          </div>

          {/* Inventory */}
          <div>
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider flex items-center gap-2">
                      Today's Stock
                  </h3>
                  <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full font-medium">
                      Fresh Arrival
                  </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                  {location.items && location.items.length > 0 ? (
                      location.items.map((item, i) => {
                          const itemName = typeof item === 'string' ? item : (item.inStock ? item.name : null);
                          if (!itemName) return null;
                          const itemPrice = typeof item !== 'string' ? item.price : null;
                          
                          return (
                              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm shadow-sm hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-default">
                                  <ShoppingBag size={14} className="text-green-500" />
                                  <div className="flex flex-col leading-none">
                                      <span className="font-medium">{itemName}</span>
                                      {itemPrice && <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{itemPrice}</span>}
                                  </div>
                              </div>
                          );
                      })
                  ) : (
                      <span className="text-gray-400 text-sm italic w-full text-center py-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                          Inventory list not available online.
                      </span>
                  )}
              </div>
          </div>

          {/* Call to Action */}
          <div className="pt-4 pb-8">
              <button className="w-full bg-gray-900 dark:bg-slate-700 text-white py-4 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-slate-600 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] flex items-center justify-center gap-2">
                  <Phone size={20} />
                  Call {contactDisplay}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-3">
                  Prices may vary based on market rates. Confirm on call.
              </p>
          </div>
      </div>
    </div>
  );
}