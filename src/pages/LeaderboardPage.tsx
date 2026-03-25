import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Award, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import leaderboardService, { LeaderboardEntry } from '../services/leaderboardService';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardService.getLeaderboard();
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 font-medium">No leaderboard data available</p>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text py-2">
          Citizen Reward System
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Earn points for every waste report and contribution. Top contributors are recognized for their environmental impact.
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto pt-8">
        {/* 2nd Place */}
        <div className="order-2 md:order-1">
          {topThree[1] && (
            <Card className="text-center pb-8 border-t-4 border-t-gray-300">
              <div className="relative -mt-12 mb-4 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold">
                  {topThree[1].name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 bg-gray-300 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">2</div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{topThree[1].name}</h3>
              <p className="text-emerald-600 font-bold">{topThree[1].points} pts</p>
            </Card>
          )}
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2">
          {topThree[0] && (
            <Card className="text-center pb-12 border-t-4 border-t-amber-400 scale-110 shadow-xl">
              <div className="relative -mt-16 mb-6 flex justify-center">
                <div className="h-24 w-24 rounded-full bg-amber-50 border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold">
                  {topThree[0].name.charAt(0)}
                </div>
                <div className="absolute -top-6 text-amber-400">
                  <Trophy className="h-10 w-10" />
                </div>
                <div className="absolute -bottom-2 bg-amber-400 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl">1</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{topThree[0].name}</h3>
              <p className="text-emerald-600 text-lg font-bold">{topThree[0].points} pts</p>
              <div className="mt-4 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
            </Card>
          )}
        </div>

        {/* 3rd Place */}
        <div className="order-3">
          {topThree[2] && (
            <Card className="text-center pb-8 border-t-4 border-t-amber-700">
              <div className="relative -mt-12 mb-4 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-amber-50 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold">
                  {topThree[2].name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 bg-amber-700 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">3</div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{topThree[2].name}</h3>
              <p className="text-emerald-600 font-bold">{topThree[2].points} pts</p>
            </Card>
          )}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Global Rankings
            </h2>
            <div className="text-sm text-gray-500">Real-time updates</div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {leaderboard.map((entry) => (
              <div 
                key={entry.id} 
                className={cn(
                  "flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  entry.name === user?.name && "bg-emerald-50 dark:bg-emerald-900/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center font-bold text-gray-400">#{entry.rank}</span>
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                    {entry.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {entry.name}
                      {entry.name === user?.name && <span className="ml-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded uppercase">You</span>}
                    </p>
                    <p className="text-xs text-gray-500">Eco Citizen</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{entry.points}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Points</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    {entry.rank <= 3 ? <Medal className="h-5 w-5 text-amber-400" /> : <Award className="h-5 w-5 text-gray-300" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

