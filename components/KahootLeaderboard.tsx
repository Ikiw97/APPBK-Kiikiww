import React, { useState, useEffect } from 'react';
import { Home, Trophy, Trash2, RotateCcw, TrendingUp } from 'lucide-react';
import {
  formatTime,
  type KahootScore,
} from '@/lib/kahootLeaderboard';

interface KahootLeaderboardProps {
  onBack?: () => void;
}

export default function KahootLeaderboardView({ onBack }: KahootLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<(KahootScore & { rank: number })[]>([]);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalAttempts: 0,
    averageScore: 0,
    averageTime: 0,
    highestScore: 0,
    fastestTime: 0,
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadLeaderboardData = async () => {
    try {
      console.log('🏆 Loading leaderboard data from API...');

      const response = await fetch('/api/kahoot/get-leaderboard');

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const result = await response.json();

      console.log('🏆 Loaded leaderboard data:', result.leaderboard);
      console.log('🏆 Number of entries:', result.leaderboard?.length || 0);

      setLeaderboard(result.leaderboard || []);

      console.log('🏆 Loaded stats:', result.stats);
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
      console.log('🏆 Leaderboard updated at:', now);
    } catch (error) {
      console.error('❌ Error loading leaderboard:', error);
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

  useEffect(() => {
    // Load initial data
    loadLeaderboardData();

    // Auto-refresh every 1 second for live real-time updates
    const interval = setInterval(() => {
      loadLeaderboardData();
    }, 1000);

    // Listen for storage changes (when other windows/tabs update data)
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

  const handleClearLeaderboard = async () => {
    try {
      console.log('🗑️ Clearing leaderboard...');

      const response = await fetch('/api/kahoot/clear-scores', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to clear leaderboard');
      }

      console.log('✅ Leaderboard cleared successfully');

      setLeaderboard([]);
      setStats({
        totalParticipants: 0,
        totalAttempts: 0,
        averageScore: 0,
        averageTime: 0,
        highestScore: 0,
        fastestTime: 0,
      });
      setShowClearConfirm(false);

      // Reload data to confirm deletion
      setTimeout(() => {
        loadLeaderboardData();
      }, 500);
    } catch (error) {
      console.error('❌ Error clearing leaderboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Gagal menghapus data leaderboard: ${errorMessage}`);
    }
  };

  const handleRefresh = () => {
    loadLeaderboardData();
  };

  return (
    <div className="px-6 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Peringkat Kahoot</h1>
          <p className="text-gray-600">Lihat ranking siswa berdasarkan skor dan kecepatan</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              Live Real-time
            </div>
            {lastUpdate && <span className="text-xs text-gray-500">Update: {lastUpdate}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RotateCcw size={20} />
            Refresh
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home size={20} />
              Kembali
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Trophy className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Peserta</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalParticipants}</p>
              <p className="text-xs text-gray-600 mt-1">{stats.totalAttempts} percobaan</p>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Rata-rata Skor</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
              <p className="text-xs text-gray-600 mt-1">dari 8 soal</p>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Trophy className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Waktu Tercepat</p>
              <p className="text-3xl font-bold text-gray-900">{formatTime(stats.fastestTime)}</p>
              <p className="text-xs text-gray-600 mt-1">Rata-rata: {formatTime(stats.averageTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card overflow-hidden border-2 border-gray-200">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy size={24} />
            Ranking Siswa
          </h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Data</h3>
            <p className="text-gray-600">Belum ada siswa yang menyelesaikan Kahoot Game.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Peringkat</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Nama Siswa</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Skor</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Persentase</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Waktu</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((score, index) => {
                  let medalEmoji = '';
                  let rowBgColor = '';

                  if (score.rank === 1) {
                    medalEmoji = '🥇';
                    rowBgColor = 'bg-yellow-50';
                  } else if (score.rank === 2) {
                    medalEmoji = '🥈';
                    rowBgColor = 'bg-gray-50';
                  } else if (score.rank === 3) {
                    medalEmoji = '🥉';
                    rowBgColor = 'bg-orange-50';
                  }

                  let dateStr = 'Invalid Date';

                  try {
                    const completionDate = new Date(score.completionTime);

                    // Check if date is valid
                    if (!isNaN(completionDate.getTime())) {
                      dateStr = completionDate.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    } else {
                      console.warn('Invalid date for score:', score.id, score.completionTime);
                    }
                  } catch (error) {
                    console.error('Error formatting date:', error);
                  }

                  return (
                    <tr
                      key={score.id}
                      className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${rowBgColor}`}
                    >
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          {medalEmoji && <span className="text-2xl">{medalEmoji}</span>}
                          <span>#{score.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {score.studentName}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-indigo-600">
                        {score.score}/{score.totalQuestions}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-white font-bold ${
                            score.percentage === 100
                              ? 'bg-green-600'
                              : score.percentage >= 80
                              ? 'bg-blue-600'
                              : score.percentage >= 60
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                        >
                          {score.percentage}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        {formatTime(score.totalTime)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Performers Section */}
      {leaderboard.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Score */}
          {leaderboard[0] && (
            <div className="card p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 text-center">
              <div className="text-6xl mb-4">🥇</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Skor Tertinggi</h3>
              <p className="text-3xl font-bold text-yellow-600 mb-2">
                {leaderboard[0].score}/{leaderboard[0].totalQuestions}
              </p>
              <p className="text-lg font-semibold text-gray-900">{leaderboard[0].studentName}</p>
              <p className="text-sm text-gray-600 mt-2">{leaderboard[0].percentage}% benar</p>
            </div>
          )}

          {/* Fastest Time */}
          {leaderboard.length > 0 && (
            <div className="card p-8 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tercepat</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {(() => {
                  try {
                    const times = leaderboard.filter(s => s.totalTime && !isNaN(s.totalTime)).map(s => s.totalTime);
                    const fastestTime = times.length > 0 ? Math.min(...times) : 0;
                    return formatTime(fastestTime);
                  } catch (error) {
                    console.error('Error calculating fastest time:', error);
                    return '00:00';
                  }
                })()}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {(() => {
                  try {
                    const times = leaderboard.filter(s => s.totalTime && !isNaN(s.totalTime)).map(s => s.totalTime);
                    const fastestTime = times.length > 0 ? Math.min(...times) : null;
                    if (fastestTime === null) return 'N/A';
                    return leaderboard.find(s => s.totalTime === fastestTime)?.studentName || 'N/A';
                  } catch (error) {
                    console.error('Error finding fastest student:', error);
                    return 'N/A';
                  }
                })()}
              </p>
              <p className="text-sm text-gray-600 mt-2">Waktu terbaik</p>
            </div>
          )}

          {/* Most Attempts */}
          {leaderboard.length > 0 && (
            <div className="card p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 text-center">
              <div className="text-6xl mb-4">🔥</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Peserta Aktif</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalParticipants}
              </p>
              <p className="text-lg font-semibold text-gray-900">Siswa</p>
              <p className="text-sm text-gray-600 mt-2">{stats.totalAttempts} percobaan</p>
            </div>
          )}
        </div>
      )}

      {/* Admin Actions */}
      <div className="mt-8 flex gap-4 justify-center flex-wrap">
        {showClearConfirm ? (
          <div className="card p-6 bg-red-50 border-2 border-red-300 w-full max-w-md">
            <h3 className="text-lg font-bold text-red-900 mb-4">Hapus Semua Data?</h3>
            <p className="text-red-700 mb-6">
              Tindakan ini akan menghapus semua data leaderboard secara permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearLeaderboard}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Trash2 size={20} />
            Hapus Semua Data
          </button>
        )}
      </div>

    </div>
  );
}
