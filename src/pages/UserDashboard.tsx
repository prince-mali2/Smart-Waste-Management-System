import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Trophy, Clock, CheckCircle2, AlertCircle, MapPin, Maximize2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { Chatbot } from '../components/Chatbot/Chatbot';
import { ImageComparison } from '../components/ImageComparison';
import axios from 'axios';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned' | 'completed'>('all');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const fetchReports = async () => {
    if (!user) return;
    try {
      const response = await axios.get('/api/reports');
      // In a real app, we'd filter by userId on the server
      const userReports = response.data.filter((r: any) => r.userId === user.id);
      const reportsData = userReports.map((doc: any) => ({
        ...doc,
        date: new Date(doc.createdAt).toLocaleDateString()
      }));
      setReports(reportsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user reports:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const stats = [
    { label: 'Total Reports', value: reports.length, icon: Clock, color: 'text-blue-600' },
    { label: 'Completed', value: reports.filter(r => r.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Reward Points', value: user?.points || 0, icon: Trophy, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your waste reports and environmental impact.</p>
        </div>
        <Button onClick={() => navigate('/report-waste')} className="gap-2">
          <Plus className="h-5 w-5" /> Report New Waste
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4 p-6">
            <div className={cn("p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20", stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Reports</h2>
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

        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card 
                key={report.id} 
                className="group hover:shadow-md transition-shadow"
                footer={
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Reported on: {report.date}</span>
                    <Badge variant={report.priority === 'high' ? 'error' : report.priority === 'medium' ? 'warning' : 'success'}>
                      {report.priority} priority
                    </Badge>
                  </div>
                }
              >
                <div className="relative h-64 sm:h-48 -mx-6 -mt-6 mb-4 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {report.status === 'completed' && report.afterImage ? (
                    <div className="flex flex-col sm:flex-row h-full w-full">
                      <div className="relative w-full sm:w-1/2 h-1/2 sm:h-full border-b sm:border-b-0 sm:border-r border-white/20">
                        {report.beforeImage ? (
                          <img 
                            src={report.beforeImage} 
                            alt="Before" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/waste/400/300';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2">
                          <span className="text-[10px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Before</span>
                        </div>
                      </div>
                      <div className="relative w-full sm:w-1/2 h-1/2 sm:h-full">
                        {report.afterImage ? (
                          <img 
                            src={report.afterImage} 
                            alt="After" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/clean/400/300';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2">
                          <span className="text-[10px] font-bold bg-emerald-600/80 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">After</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {report.beforeImage ? (
                        <img 
                          src={report.beforeImage} 
                          alt="Waste report" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/waste/400/300';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                          <AlertCircle className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={report.status === 'completed' ? 'success' : report.status === 'assigned' ? 'info' : 'warning'}>
                      {report.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {report.location.address}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{report.description}</p>
                  {report.status === 'completed' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2 gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Maximize2 className="h-4 w-4" /> View Comparison
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-emerald-300 dark:text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reports found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-1">
              You haven't reported any waste issues yet. Start by reporting a new issue!
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate('/report-waste')}>
              Report Waste
            </Button>
          </Card>
        )}
      </div>
      <Chatbot />

      {/* Comparison Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-3xl overflow-hidden shadow-2xl border-none">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cleanup Comparison</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drag the slider to compare before and after images</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <ImageComparison 
                beforeImage={selectedReport.beforeImage} 
                afterImage={selectedReport.afterImage} 
              />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reported On</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{selectedReport.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{selectedReport.location.address}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <Button onClick={() => setSelectedReport(null)}>Close View</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
