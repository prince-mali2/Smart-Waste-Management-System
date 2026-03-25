import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Users, Trash2, CheckCircle, Clock, Filter, Eye, UserPlus, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AIInsightsCard } from '../components/AIInsightsCard';
import { cn } from '../utils/cn';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import L from 'leaflet';

// Fix for Leaflet plugins in ESM
if (typeof window !== 'undefined') {
  (window as any).L = L;
}

import 'leaflet.heat';

// Custom marker icons based on priority
const createIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color};" class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
           <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const icons = {
  high: createIcon('#ef4444'), // Red
  medium: createIcon('#f97316'), // Orange
  low: createIcon('#22c55e'), // Green
};

// Map helper components
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
};

const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    // @ts-ignore - leaflet.heat is not in the types
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.4: '#22c55e', // Green
        0.6: '#eab308', // Yellow
        1.0: '#ef4444'  // Red
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

interface ComplaintMapProps {
  reports: any[];
  heatmapData: any[];
  center: [number, number];
  mode: 'markers' | 'heatmap';
}

const ComplaintMap: React.FC<ComplaintMapProps> = ({ reports, heatmapData, center, mode }) => {
  const hasData = mode === 'markers' ? reports.length > 0 : heatmapData.length > 0;

  if (!hasData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
        <p className="font-medium text-center px-4">
          {mode === 'markers' 
            ? "No complaints reported yet." 
            : "No complaint data available to generate heatmap."}
        </p>
      </div>
    );
  }

  const heatPoints: [number, number, number][] = heatmapData.map(h => [
    h.location.lat,
    h.location.lng,
    0.8 // Intensity
  ]);

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 relative z-0">
      <MapContainer center={center} zoom={12} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ResizeMap />
        <ChangeView center={center} />
        
        {mode === 'markers' ? (
          reports.filter(r => r.location?.lat && r.location?.lng).map((c) => (
            <Marker 
              key={c.id} 
              position={[c.location.lat, c.location.lng]}
              icon={icons[c.priority as keyof typeof icons] || icons.medium}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[200px]">
                  <div className="border-b pb-2 mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">Reporter</p>
                    <p className="text-sm font-semibold text-gray-900">{c.userName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Issue</p>
                    <p className="text-sm text-gray-700">{c.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Priority</span>
                      <Badge variant={c.priority === 'high' ? 'error' : c.priority === 'medium' ? 'warning' : 'success'}>
                        {c.priority}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Status</span>
                      <Badge variant={c.status === 'completed' ? 'success' : c.status === 'assigned' ? 'info' : 'warning'}>
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        ) : (
          <HeatmapLayer points={heatPoints} />
        )}
      </MapContainer>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned' | 'completed'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);
  const [mapMode, setMapMode] = useState<'markers' | 'heatmap'>('markers');
  const [workers, setWorkers] = useState<{ id: string, name: string }[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    setSelectedWorkerId("");
  }, [selectedComplaint]);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports');
      const reportsData = response.data.map((r: any) => ({
        ...r,
        date: new Date(r.createdAt).toLocaleDateString()
      }));
      setReports(reportsData);
      
      // Calculate average location for centering
      if (reportsData.length > 0) {
        const validReports = reportsData.filter((r: any) => r.location && r.location.lat && r.location.lng);
        if (validReports.length > 0) {
          const avgLat = validReports.reduce((sum: number, r: any) => sum + r.location.lat, 0) / validReports.length;
          const avgLng = validReports.reduce((sum: number, r: any) => sum + r.location.lng, 0) / validReports.length;
          setMapCenter([avgLat, avgLng]);
        }
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const response = await axios.get('/api/reports/heatmap');
      setHeatmapData(response.data);
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await axios.get('/api/workers');
      setWorkers(response.data);
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchHeatmapData(), fetchWorkers()]);
      setLoading(false);
    };
    init();

    const interval = setInterval(() => {
      fetchReports();
      fetchHeatmapData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (id: string, workerId?: string) => {
    const targetWorkerId = workerId || selectedWorkerId;
    if (!targetWorkerId) {
      toast.error("Please select a worker first");
      return;
    }

    setIsAssigning(true);
    try {
      await axios.patch(`/api/reports/${id}`, { 
        status: 'assigned',
        assignedWorkerId: targetWorkerId
      });
      toast.success('Task assigned to worker!');
      fetchReports();
      if (selectedComplaint?.id === id) {
        setSelectedComplaint(prev => prev ? { ...prev, status: 'assigned', assignedWorkerId: targetWorkerId } : null);
      }
      setSelectedWorkerId("");
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error('Failed to assign task.');
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredComplaints = filter === 'all' ? reports : reports.filter(c => c.status === filter);

  const stats = [
    { label: 'Total Complaints', value: reports.length, icon: Trash2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', filter: 'all' },
    { label: 'Pending', value: reports.filter(c => c.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', filter: 'pending' },
    { label: 'Completed', value: reports.filter(c => c.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', filter: 'completed' },
    { label: 'Active Workers', value: workers.length || 8, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', filter: 'assigned' },
  ];

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Command Center</h1>
        <p className="text-gray-500 dark:text-gray-400">Monitor city-wide waste management operations.</p>
      </div>

      {/* AI Insights Section */}
      <AIInsightsCard reports={reports} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md active:scale-95",
              filter === stat.filter && "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900"
            )}
            onClick={() => setFilter(stat.filter as any)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Complaints Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden" noPadding>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Complaints</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    <th className="px-6 py-3">Reporter</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                            {complaint.userName?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{complaint.userName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{complaint.location?.address || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={complaint.priority === 'high' ? 'error' : complaint.priority === 'medium' ? 'warning' : 'success'}>
                          {complaint.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={complaint.status === 'completed' ? 'success' : complaint.status === 'assigned' ? 'info' : 'warning'}>
                          {complaint.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(complaint)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {complaint.status === 'pending' && (
                            <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(complaint)}>
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No complaints reported yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Map View */}
        <div className="space-y-4">
          <Card 
            title="Complaint Map" 
            headerAction={
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setMapMode('markers')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    mapMode === 'markers' 
                      ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  Markers
                </button>
                <button
                  onClick={() => setMapMode('heatmap')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    mapMode === 'heatmap' 
                      ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  Heatmap
                </button>
              </div>
            }
          >
            <ComplaintMap 
              reports={reports} 
              heatmapData={heatmapData}
              center={mapCenter} 
              mode={mapMode}
            />
          </Card>
        </div>
      </div>

      {/* Complaint Detail Modal (Simplified) */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl p-0 overflow-hidden" title="Complaint Details">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center">
                    {selectedComplaint.beforeImage ? (
                      <img 
                        src={selectedComplaint.beforeImage} 
                        alt="Before" 
                        className="w-full h-48 object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/waste/400/300';
                        }}
                      />
                    ) : (
                      <AlertCircle className="h-12 w-12 text-gray-400" />
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/50 backdrop-blur-md text-white border-none text-[10px]">Before</Badge>
                    </div>
                  </div>
                  {selectedComplaint.afterImage && (
                    <div className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center">
                      <img 
                        src={selectedComplaint.afterImage} 
                        alt="After" 
                        className="w-full h-48 object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/clean/400/300';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-emerald-600/80 backdrop-blur-md text-white border-none text-[10px]">After Cleaning</Badge>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="info">Waste Report</Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{selectedComplaint.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reported by {selectedComplaint.userName}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{selectedComplaint.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedComplaint.location?.address || 'N/A'}</p>
                </div>
                
                {selectedComplaint.status !== 'completed' && (
                  <div className="pt-4 space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase">Assign Worker</p>
                    <select 
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    >
                      <option value="">Select a worker...</option>
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button className="flex-1" onClick={() => setSelectedComplaint(null)}>Close</Button>
                  {selectedComplaint.status === 'pending' && (
                    <Button 
                      variant="secondary" 
                      className="flex-1" 
                      onClick={() => handleAssign(selectedComplaint.id)}
                      disabled={isAssigning || !selectedWorkerId}
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Worker'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
