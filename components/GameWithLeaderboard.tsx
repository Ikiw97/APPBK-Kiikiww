import React, { useState, useEffect } from 'react';
import { Home, RotateCcw, Trophy, BarChart3 } from 'lucide-react';
import KahootGame from './KahootGame';
import { formatTime } from '@/lib/kahootLeaderboard';

interface LeaderboardEntry {
  id: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  totalTime: number;
  completionTime: string;
  rank: number;
}

interface GameWithLeaderboardProps {
  onBack?: () => void;
  onViewLeaderboard?: () => void;
}

export default function GameWithLeaderboard({ onBack, onViewLeaderboard }: GameWithLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalAttempts: 0,
    averageScore: 0,
    averageTime: 0,
    highestScore: 0,
    fastestTime: 0,
  });
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Load leaderboard data
  const loadLeaderboardData = async () => {
    try {
      console.log('🏆 [GameWithLeaderboard] Fetching leaderboard...');
      const response = await fetch('/api/kahoot/get-leaderboard');

      console.log('🏆 [GameWithLeaderboard] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🏆 [GameWithLeaderboard] Response error:', errorText);
        throw new Error(`Failed to fetch leaderboard (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('🏆 [GameWithLeaderboard] Received data:', {
        leaderboardCount: result.leaderboard?.length || 0,
        stats: result.stats,
        leaderboard: result.leaderboard
      });

      setLeaderboard(result.leaderboard || []);
      setStats(result.stats || {
        totalParticipants: 0,
        totalAttempts: 0,
        averageScore: 0,
        averageTime: 0,
        highestScore: 0,
        fastestTime: 0,
      });

      const now = new Date().toLocaleTimeString('id-ID');
      setLastUpdate(now);
      console.log('🏆 [GameWithLeaderboard] Updated leaderboard at', now);
    } catch (error) {
      console.error('❌ [GameWithLeaderboard] Error loading leaderboard:', error);
      setLeaderboard([]);
      setStats({
        totalParticipants: 0,
        totalAttempts: 0,
        averageScore: 0,
        averageTime: 0,
        highestScore: 0,
        fastestTime: 0,
      });
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    loadLeaderboardData();

    // Auto-refresh every 1 second for live updates
    const interval = setInterval(() => {
      loadLeaderboardData();
    }, 1000);

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kahoot_leaderboard') {
        loadLeaderboardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleScoreSubmitted = () => {
    // Reload leaderboard immediately when someone submits a score
    loadLeaderboardData();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-gray-50 overflow-hidden lg:flex-row flex-col">
      {/* Left Side - Game */}
      <div className="flex-1 overflow-y-auto lg:border-r border-gray-300 bg-[#F8FAFC]">
        <KahootGame
          onBack={onBack}
          onScoreSubmitted={handleScoreSubmitted}
        />
      </div>

      {/* Right Side - Live Leaderboard */}
      <div className="w-full lg:w-96 bg-white shadow-lg overflow-hidden flex flex-col border-t lg:border-t-0 lg:border-l border-gray-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={20} />
            <h2 className="text-lg font-bold">Live Ranking</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Real-time Updates</span>
          </div>
          {lastUpdate && (
            <p className="text-xs text-indigo-200 mt-1">Update: {lastUpdate}</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded p-2 text-center">
              <p className="text-gray-600 font-medium">{stats.totalParticipants}</p>
              <p className="text-gray-500 text-xs">Peserta</p>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <p className="text-gray-600 font-medium">{stats.averageScore}</p>
              <p className="text-gray-500 text-xs">Rata-rata</p>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="text-gray-500 text-sm font-medium">Belum ada peserta</p>
              <p className="text-gray-400 text-xs mt-1">Peserta yang menjawab dengan benar akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((score) => {
                let medalEmoji = '';
                let rankColor = '';
                let bgColor = '';

                if (score.rank === 1) {
                  medalEmoji = '🥇';
                  rankColor = 'text-yellow-600 font-black';
                  bgColor = 'bg-yellow-50';
                } else if (score.rank === 2) {
                  medalEmoji = '🥈';
                  rankColor = 'text-gray-500';
                  bgColor = 'bg-gray-50';
                } else if (score.rank === 3) {
                  medalEmoji = '🥉';
                  rankColor = 'text-orange-600';
                  bgColor = 'bg-orange-50';
                } else {
                  rankColor = 'text-gray-400';
                }

                return (
                  <div
                    key={`${score.studentName}-${score.rank}`}
                    className={`p-3 hover:bg-opacity-70 transition-all duration-300 ${bgColor}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`text-lg font-bold flex-shrink-0 ${rankColor}`}>
                          {medalEmoji ? medalEmoji : `#${score.rank}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {score.studentName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {score.score}/{score.totalQuestions} benar • {score.percentage}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs font-bold text-indigo-600">
                          {formatTime(score.totalTime)}
                        </p>
                        <p className="text-xs text-gray-500">waktu</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onViewLeaderboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold text-sm shadow-sm"
          >
            <BarChart3 size={16} />
            Akses Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
