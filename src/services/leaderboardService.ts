import axios from 'axios';

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
}

const leaderboardService = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await axios.get('/api/leaderboard');
    return response.data;
  }
};

export default leaderboardService;
