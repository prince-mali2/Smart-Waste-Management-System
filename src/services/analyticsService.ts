import axios from 'axios';

export interface AreaData {
  name: string;
  complaints: number;
}

export interface TrendData {
  name: string;
  count: number;
}

export interface DistributionData {
  name: string;
  value: number;
}

export interface SummaryData {
  totalWasteCollected: string;
  efficiencyPercentage: string;
  recyclingRate: string;
  highestComplaintArea: string;
}

const analyticsService = {
  getComplaintsByArea: async (): Promise<AreaData[]> => {
    const response = await axios.get('/api/analytics/complaints-by-area');
    return response.data;
  },

  getWeeklyTrend: async (): Promise<TrendData[]> => {
    const response = await axios.get('/api/analytics/weekly-trend');
    return response.data;
  },

  getWasteDistribution: async (): Promise<DistributionData[]> => {
    const response = await axios.get('/api/analytics/waste-distribution');
    return response.data;
  },

  getSummary: async (): Promise<SummaryData> => {
    const response = await axios.get('/api/analytics/summary');
    return response.data;
  }
};

export default analyticsService;
