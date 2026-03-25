import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MapPin, Phone, Clock, Recycle, ExternalLink, Loader2 } from 'lucide-react';
import { fetchNearbyRecyclingCenters, RecyclingCenterData } from '../services/geminiService';
import { toast, Toaster } from 'react-hot-toast';
import L from 'leaflet';

// Helper component to fix Leaflet size issues
function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Helper component to center map when location changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export const RecyclingMapPage: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);
  const [centers, setCenters] = useState<RecyclingCenterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);

  const getNearbyCenters = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const data = await fetchNearbyRecyclingCenters(lat, lng);
      if (data.length > 0) {
        setCenters(data);
      } else {
        toast.error("Could not find real recycling centers nearby. Using fallback data.");
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
      toast.error("Failed to fetch real-time data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setLocationFetched(true);
          getNearbyCenters(latitude, longitude);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          toast.error("Location access denied. Showing default area.");
          // Still try to fetch for default center
          getNearbyCenters(mapCenter[0], mapCenter[1]);
        }
      );
    } else {
      getNearbyCenters(mapCenter[0], mapCenter[1]);
    }
  }, []);

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recycling Center Finder</h1>
          <p className="text-gray-500 dark:text-gray-400">Locate real nearby facilities to dispose of recyclable materials.</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Finding real locations...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {centers.length > 0 ? centers.map((center) => (
            <Card 
              key={center.id} 
              className="hover:border-emerald-500 transition-colors cursor-pointer group"
              onClick={() => setMapCenter([center.lat, center.lng])}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{center.name}</h3>
                  <Recycle className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                  <span>{center.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>09:00 AM - 06:00 PM (Estimated)</span>
                </div>
                <div className="pt-2 flex flex-wrap gap-2">
                  {center.acceptedWaste.map((type, i) => (
                    <Badge key={i} variant="neutral" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-none">
                      {type}
                    </Badge>
                  ))}
                </div>
                {center.mapsUrl && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <a 
                      href={center.mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )) : !loading && (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No centers found in this area.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 h-[600px]">
          <Card className="p-0 h-full w-full rounded-xl overflow-hidden border-none shadow-xl">
            <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <ResizeMap />
              <ChangeView center={mapCenter} />
              
              {/* User Location Marker */}
              {locationFetched && (
                <Marker position={mapCenter} icon={L.divIcon({
                  className: 'user-location-marker',
                  html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                })}>
                  <Popup>Your current location</Popup>
                </Marker>
              )}

              {centers.map((center) => (
                <Marker 
                  key={center.id} 
                  position={[center.lat, center.lng]}
                  icon={L.divIcon({
                    className: 'recycling-marker',
                    html: `<div class="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="3" y="11" width="18" height="10" rx="2"/></svg>
                           </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  })}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <h4 className="font-bold text-gray-900">{center.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{center.address}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {center.acceptedWaste.map((w, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded border border-emerald-100">
                            {w}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {center.mapsUrl ? (
                          <a 
                            href={center.mapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 bg-emerald-600 text-white text-xs rounded font-bold text-center"
                          >
                            Directions
                          </a>
                        ) : (
                          <button className="flex-1 py-1.5 bg-emerald-600 text-white text-xs rounded font-bold">Directions</button>
                        )}
                        <button className="p-1.5 border border-gray-200 rounded"><Phone className="h-3 w-3 text-gray-400" /></button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};
