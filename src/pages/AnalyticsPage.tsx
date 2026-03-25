import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Card } from '../components/ui/Card';
import { TrendingUp, MapPin, Trash2, PieChart as PieIcon, Loader2 } from 'lucide-react';
import analyticsService, { AreaData, TrendData, DistributionData, SummaryData } from '../services/analyticsService';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

export const AnalyticsPage: React.FC = () => {
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [typeData, setTypeData] = useState<DistributionData[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [area, trend, type, sum] = await Promise.all([
        analyticsService.getComplaintsByArea(),
        analyticsService.getWeeklyTrend(),
        analyticsService.getWasteDistribution(),
        analyticsService.getSummary()
      ]);
      setAreaData(area);
      setTrendData(trend);
      setTypeData(type);
      setSummary(sum);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Loading real-time analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4 bg-red-50 p-8 rounded-2xl border border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => { setLoading(true); fetchData(); }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waste Analytics</h1>
        <p className="text-gray-500">Data-driven insights for urban waste management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Complaints by Area */}
        <Card title="Complaints by Area" subtitle="Number of reports per district">
          <div className="h-[300px] mt-4">
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="complaints" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>
        </Card>

        {/* Weekly Trend */}
        <Card title="Weekly Trend" subtitle="Daily complaint volume over the last 7 days">
          <div className="h-[300px] mt-4">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>
        </Card>

        {/* Waste Type Distribution */}
        <Card title="Waste Type Distribution" subtitle="Breakdown of waste categories reported">
          <div className="h-[300px] mt-4 flex items-center justify-center">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>
        </Card>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="flex flex-col justify-center p-6 bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800 uppercase">Efficiency</span>
            </div>
            <p className="text-3xl font-bold text-emerald-900">{summary?.efficiencyPercentage || '0%'}</p>
            <p className="text-sm text-emerald-700 mt-1">Collection rate this week</p>
          </Card>
          <Card className="flex flex-col justify-center p-6 bg-blue-50 border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-800 uppercase">Total Waste</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">{summary?.totalWasteCollected || '0t'}</p>
            <p className="text-sm text-blue-700 mt-1">Collected this month</p>
          </Card>
          <Card className="flex flex-col justify-center p-6 bg-amber-50 border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-800 uppercase">Hotspot</span>
            </div>
            <p className="text-3xl font-bold text-amber-900 truncate">{summary?.highestComplaintArea || 'N/A'}</p>
            <p className="text-sm text-amber-700 mt-1">Highest complaint volume</p>
          </Card>
          <Card className="flex flex-col justify-center p-6 bg-purple-50 border-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <PieIcon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-800 uppercase">Recycling</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">{summary?.recyclingRate || '0%'}</p>
            <p className="text-sm text-purple-700 mt-1">Of total waste recycled</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

