import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from './ui/Button';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RouteMapProps {
  workerLocation: [number, number] | null;
  taskLocation: [number, number];
  address: string;
}

function MapUpdater({ workerLocation, taskLocation }: { workerLocation: [number, number] | null, taskLocation: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (workerLocation) {
      const bounds = L.latLngBounds([workerLocation, taskLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(taskLocation, 15);
    }
  }, [workerLocation, taskLocation, map]);

  return null;
}

export const RouteMap: React.FC<RouteMapProps> = ({ workerLocation, taskLocation, address }) => {
  const handleNavigate = () => {
    if (workerLocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${workerLocation[0]},${workerLocation[1]}&destination=${taskLocation[0]},${taskLocation[1]}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${taskLocation[0]},${taskLocation[1]}`, '_blank');
    }
  };

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-inner">
      <MapContainer 
        center={taskLocation} 
        zoom={15} 
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Task Location Marker */}
        <Marker position={taskLocation}>
          <Popup>
            <div className="p-1">
              <p className="font-bold text-sm">Waste Location</p>
              <p className="text-xs text-gray-600">{address}</p>
            </div>
          </Popup>
        </Marker>

        {/* Worker Location Marker */}
        {workerLocation && (
          <>
            <Marker 
              position={workerLocation}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #10b981; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                iconSize: [15, 15],
                iconAnchor: [7, 7]
              })}
            >
              <Popup>You are here</Popup>
            </Marker>
            
            {/* Route Line */}
            <Polyline 
              positions={[workerLocation, taskLocation]} 
              color="#10b981" 
              weight={4} 
              opacity={0.6} 
              dashArray="10, 10"
            />
          </>
        )}

        <MapUpdater workerLocation={workerLocation} taskLocation={taskLocation} />
      </MapContainer>

      {/* Navigation Overlay */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button onClick={handleNavigate} className="gap-2 shadow-xl bg-emerald-600 hover:bg-emerald-700">
          <Navigation className="h-4 w-4" /> Open in Google Maps
        </Button>
      </div>

      {!workerLocation && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Fetching your location...
        </div>
      )}
    </div>
  );
};
