import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Camera, MapPin, Send, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

export const ReportWastePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState<'dry' | 'wet' | 'hazardous'>('dry');
  const [area, setArea] = useState('Downtown');
  const [location, setLocation] = useState<[number, number]>([40.7128, -74.006]);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const areas = ['Downtown', 'North Side', 'South Side', 'East End', 'West End', 'Brooklyn', 'Queens', 'Bronx'];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          toast.error("Could not get your current location. Defaulting to New York.");
        }
      );
    }
  }, []);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLocation([e.latlng.lat, e.latlng.lng]);
      },
    });

    return <Marker position={location} />;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log("Image loaded, size:", result.length);
        setImage(result);
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to report waste.');
      return;
    }
    if (!image) {
      toast.error('Please upload an image of the waste.');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const reportData = {
        userName: user.name,
        description,
        wasteType,
        beforeImage: image,
        location: {
          lat: location[0],
          lng: location[1],
          address: area
        },
        status: 'pending',
        priority: 'medium',
      };

      await axios.post('/api/reports', reportData);
      
      toast.success('Waste reported successfully! Thank you for your contribution.');
      setIsLoading(false);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      console.error("Error reporting waste:", error);
      toast.error('Failed to report waste. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Toaster position="top-right" />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Waste Issue</h1>
        <p className="text-gray-500 dark:text-gray-400">Help us keep the city clean by reporting garbage issues in your area.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card title="Issue Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer relative overflow-hidden"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {image ? (
                    <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input 
                    id="image-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Area / District</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                >
                  {areas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Waste Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['dry', 'wet', 'hazardous'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWasteType(type)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all capitalize ${
                        wasteType === type
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the waste issue (e.g., overflowing bin, illegal dumping)..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white min-h-[120px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>
          </Card>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800 dark:text-emerald-400">
              Earn 20 points for reporting! Your report will be reviewed by municipal authorities and assigned to a collection worker. You'll earn an additional 50 points upon completion!
            </p>
          </div>

          <Button type="submit" className="w-full gap-2" size="lg" isLoading={isLoading}>
            <Send className="h-5 w-5" /> Submit Report
          </Button>
        </div>

        <div className="space-y-6">
          <Card title="Pin Location" subtitle="Click on the map to set the exact location of the waste.">
            <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <MapContainer center={location} zoom={13} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
                <ResizeMap />
                <ChangeView center={location} />
              </MapContainer>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Selected Coordinates: {location[0].toFixed(4)}, {location[1].toFixed(4)}</span>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
