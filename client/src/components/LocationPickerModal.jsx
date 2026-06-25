import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Search, Check } from 'lucide-react';

const LocationPickerModal = ({ isOpen, onClose, onLocationSelect, initialLat, initialLng }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [position, setPosition] = useState({ 
    lat: initialLat || 19.076, 
    lng: initialLng || 72.877 
  });
  const [address, setAddress] = useState('Loading address...');
  const [addressDetails, setAddressDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow the modal transition to finish before initializing map to prevent tiles loading issue
    const timeout = setTimeout(() => {
      if (window.L && mapRef.current && !mapInstanceRef.current) {
        const map = window.L.map(mapRef.current).setView([position.lat, position.lng], 13);
        mapInstanceRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Initial Marker
        markerRef.current = window.L.marker([position.lat, position.lng]).addTo(map);

        // Fetch initial address if not provided
        fetchAddress(position.lat, position.lng);

        // Click Handler
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          updatePosition(lat, lng);
        });
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, [isOpen]);

  const updatePosition = (lat, lng) => {
    setPosition({ lat, lng });
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);
    }

    fetchAddress(lat, lng);
  };

  const fetchAddress = async (lat, lng) => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        setAddressDetails(data.address || {});
      } else {
        setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        setAddressDetails({});
      }
    } catch (err) {
      setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      setAddressDetails({});
    } finally {
      setIsLoading(false);
    }
  };

  const detectMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updatePosition(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          alert("Unable to retrieve your location. Please check browser permissions.");
        }
      );
    }
  };

  const handleConfirm = () => {
    onLocationSelect({
      latitude: position.lat,
      longitude: position.lng,
      address,
      addressDetails
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[700px] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Pin Your Location</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Tap anywhere on the map to drop a pin.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border-none outline-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-100 z-0">
          <div ref={mapRef} className="absolute inset-0" />
          
          {/* Floating Actions */}
          <button 
            onClick={detectMyLocation}
            className="absolute top-4 right-4 z-[400] bg-white text-indigo-600 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer outline-none"
          >
            <MapPin size={16} />
            My Location
          </button>
        </div>

        {/* Footer info & confirm */}
        <div className="p-5 bg-white border-t border-gray-100 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 flex items-start gap-3 w-full">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                <MapPin size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selected Address</p>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2 mt-0.5">
                  {isLoading ? 'Finding address...' : address}
                </p>
              </div>
            </div>

            <button 
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none outline-none"
            >
              <Check size={18} />
              Confirm Pin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
