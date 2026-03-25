import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle2, Clock, Navigation, Phone, AlertTriangle, Map as MapIcon, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { cn } from '../utils/cn';
import axios from 'axios';
import { RouteMap } from '../components/RouteMap';
import { UploadProofModal } from '../components/UploadProofModal';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [workerLocation, setWorkerLocation] = useState<[number, number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/reports');
      // In a real app, we'd filter by assignedWorkerId == user.id on the server
      const assignedTasks = response.data.filter((r: any) => r.status === 'assigned');
      const reportsData = assignedTasks.map((doc: any) => ({
        ...doc,
        date: new Date(doc.createdAt).toLocaleDateString()
      }));
      setReports(reportsData);
      
      // If we have an active task, update it with fresh data
      if (activeTask) {
        const updatedActive = reportsData.find((r: any) => r.id === activeTask.id);
        if (updatedActive) setActiveTask(updatedActive);
      } else if (reportsData.length > 0) {
        setActiveTask(reportsData[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching worker reports:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);

    // Live Location Fetch
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setWorkerLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error fetching location:", error);
          if (error.code === error.PERMISSION_DENIED) {
            toast.error("Location permission denied. Map routing will be limited.");
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => {
        clearInterval(interval);
        navigator.geolocation.clearWatch(watchId);
      };
    }

    return () => clearInterval(interval);
  }, []);

  const handleCompleteSubmit = async (afterImage: string) => {
    if (!activeTask) return;
    
    try {
      await axios.patch(`/api/reports/${activeTask.id}`, { 
        status: 'completed',
        afterImage 
      });
      
      fetchTasks();
      setActiveTask(null);
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Worker Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your assigned collection tasks and routes.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
          <Truck className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider opacity-70">Active Vehicle</span>
            <span className="text-sm">#ES-402 (Electric)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Assigned Tasks
            </h2>
            <Badge variant="info" className="rounded-full px-3">{reports.length}</Badge>
          </div>
          
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
            {reports.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-2">
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">No pending tasks</p>
              </Card>
            ) : (
              reports.map((task) => (
                <Card 
                  key={task.id} 
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-l-4 p-4 hover:shadow-md",
                    activeTask?.id === task.id 
                      ? "border-l-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/30 dark:bg-emerald-900/5" 
                      : "border-l-gray-200 dark:border-l-gray-800 hover:border-l-emerald-300"
                  )}
                  onClick={() => setActiveTask(task)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={task.priority === 'high' ? 'error' : 'warning'} className="capitalize">
                        {task.priority} Priority
                      </Badge>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{task.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{task.location.address}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{task.location.lat.toFixed(4)}, {task.location.lng.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Active Task Details & Map */}
        <div className="lg:col-span-2 space-y-6">
          {activeTask ? (
            <>
              <Card className="p-0 overflow-hidden border-none shadow-xl bg-white dark:bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-64 md:h-auto relative group bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {activeTask.beforeImage ? (
                      <img 
                        src={activeTask.beforeImage} 
                        alt="Task" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/waste/400/300';
                        }}
                      />
                    ) : (
                      <AlertCircle className="h-12 w-12 text-gray-400" />
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/50 backdrop-blur-md text-white border-none px-3 py-1">Before Cleaning</Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Active Task</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">ID: {activeTask.id.slice(-8)}</p>
                      </div>
                      <Badge variant="info" className="animate-pulse">In Progress</Badge>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{activeTask.location.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Reported Issue</p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{activeTask.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1 gap-2 h-12">
                        <Phone className="h-4 w-4" /> Contact
                      </Button>
                      <Button 
                        className="flex-1 gap-2 h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" 
                        onClick={() => setIsModalOpen(true)}
                      >
                        <CheckCircle2 className="h-5 w-5" /> Mark Collected
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapIcon className="h-5 w-5 text-emerald-500" />
                    Route Map
                  </h2>
                  {workerLocation && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Live Tracking Active
                    </span>
                  )}
                </div>
                
                <RouteMap 
                  workerLocation={workerLocation} 
                  taskLocation={[activeTask.location.lat, activeTask.location.lng]} 
                  address={activeTask.location.address}
                />
              </div>

              <UploadProofModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCompleteSubmit}
                report={activeTask}
              />
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center py-32 text-center border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/30">
              <div className="h-24 w-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-xl">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">All Tasks Completed!</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-3 font-medium">
                You've cleared all assigned collection points. New tasks will appear here as they are assigned.
              </p>
              <Button variant="outline" className="mt-8" onClick={fetchTasks}>
                Refresh Tasks
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
