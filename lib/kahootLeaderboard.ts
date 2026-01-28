// Kahoot Leaderboard Data Structure and Utilities

export interface KahootScore {
  id: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  totalTime: number; // in seconds
  completionTime: string; // timestamp
  answers: (number | null)[];
}

export interface KahootLeaderboard {
  scores: KahootScore[];
  lastUpdated: string;
}

const LEADERBOARD_KEY = 'kahoot_leaderboard';

// Generate unique ID for each score
function generateScoreId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Load leaderboard from localStorage
export function loadLeaderboard(): KahootLeaderboard {
  if (typeof window === 'undefined') {
    return { scores: [], lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    console.log('📊 Attempting to load leaderboard, key:', LEADERBOARD_KEY);
    console.log('📊 Raw stored data:', stored);

    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📊 Successfully loaded kahoot leaderboard:', parsed);
      console.log('📊 Number of scores:', parsed.scores?.length || 0);
      return parsed;
    }

    console.log('📊 No leaderboard data found in localStorage, returning empty');
  } catch (error) {
    console.error('❌ Error loading leaderboard:', error);
    console.error('❌ Error details:', { message: error instanceof Error ? error.message : 'Unknown error' });
  }

  return { scores: [], lastUpdated: new Date().toISOString() };
}

// Save leaderboard to localStorage
export function saveLeaderboard(leaderboard: KahootLeaderboard): void {
  if (typeof window === 'undefined') return;

  try {
    const jsonData = JSON.stringify(leaderboard);
    console.log('💾 Saving leaderboard to localStorage...');
    console.log('💾 Data to save:', leaderboard);
    console.log('💾 JSON size:', jsonData.length, 'bytes');

    localStorage.setItem(LEADERBOARD_KEY, jsonData);

    // Verify save was successful
    const verify = localStorage.getItem(LEADERBOARD_KEY);
    if (verify) {
      console.log('✅ Leaderboard saved successfully and verified');
      console.log('✅ Saved data:', JSON.parse(verify));
    } else {
      console.error('❌ Save verification failed - data not found in localStorage');
    }
  } catch (error) {
    console.error('❌ Error saving leaderboard:', error);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      // Check if it's a quota exceeded error
      if (error.message.includes('QuotaExceededError') || error.name === 'QuotaExceededError') {
        console.error('❌ localStorage quota exceeded! Data cannot be saved.');
      }
    }
  }
}

// Add a new score to leaderboard
export function addScoreToLeaderboard(
  studentName: string,
  score: number,
  totalQuestions: number,
  totalTime: number,
  answers: (number | null)[]
): KahootScore {
  console.log('🎮 addScoreToLeaderboard called with:', {
    studentName,
    score,
    totalQuestions,
    totalTime,
  });

  const leaderboard = loadLeaderboard();
  console.log('🎮 Current leaderboard before adding score:', leaderboard);

  const newScore: KahootScore = {
    id: generateScoreId(),
    studentName: studentName.trim(),
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    totalTime,
    completionTime: new Date().toISOString(),
    answers,
  };

  console.log('🎮 New score object created:', newScore);

  leaderboard.scores.push(newScore);
  leaderboard.lastUpdated = new Date().toISOString();

  console.log('🎮 Updated leaderboard (before save):', leaderboard);

  saveLeaderboard(leaderboard);
  console.log('✅ Score added to leaderboard:', newScore);
  console.log('✅ Total scores in leaderboard:', leaderboard.scores.length);

  return newScore;
}

// Get sorted leaderboard (by score desc, then by time asc)
export function getSortedLeaderboard(): KahootScore[] {
  const leaderboard = loadLeaderboard();

  return leaderboard.scores.sort((a, b) => {
    // First sort by score (descending)
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // If score is same, sort by time (ascending - faster is better)
    return a.totalTime - b.totalTime;
  });
}

// Get leaderboard with ranking
export function getLeaderboardWithRanking(): (KahootScore & { rank: number })[] {
  const sorted = getSortedLeaderboard();
  return sorted.map((score, index) => ({
    ...score,
    rank: index + 1,
  }));
}

// Get top N scores
export function getTopScores(count: number = 10): (KahootScore & { rank: number })[] {
  return getLeaderboardWithRanking().slice(0, count);
}

// Clear all leaderboard data
export function clearLeaderboard(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LEADERBOARD_KEY);
    console.log('✅ Leaderboard cleared');
  } catch (error) {
    console.error('❌ Error clearing leaderboard:', error);
  }
}

// Format time in seconds to display format (MM:SS)
export function formatTime(seconds: number | undefined | null): string {
  // Handle invalid or missing values
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    console.warn('Invalid time value:', seconds);
    return '00:00';
  }

  // Ensure seconds is a number
  const numSeconds = Number(seconds);
  if (isNaN(numSeconds)) {
    console.warn('Unable to convert to number:', seconds);
    return '00:00';
  }

  const minutes = Math.floor(numSeconds / 60);
  const secs = Math.round(numSeconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Get student's best score
export function getStudentBestScore(studentName: string): KahootScore | null {
  const leaderboard = loadLeaderboard();
  const studentScores = leaderboard.scores.filter(
    score => score.studentName.toLowerCase() === studentName.toLowerCase()
  );

  if (studentScores.length === 0) return null;

  // Sort by score desc, then by time asc
  return studentScores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.totalTime - b.totalTime;
  })[0];
}

// Get leaderboard statistics
export function getLeaderboardStats(): {
  totalParticipants: number;
  totalAttempts: number;
  averageScore: number;
  averageTime: number;
  highestScore: number;
  fastestTime: number;
} {
  const leaderboard = loadLeaderboard();
  const scores = leaderboard.scores;

  if (scores.length === 0) {
    return {
      totalParticipants: 0,
      totalAttempts: scores.length,
      averageScore: 0,
      averageTime: 0,
      highestScore: 0,
      fastestTime: 0,
    };
  }

  const uniqueStudents = new Set(scores.map(s => s.studentName.toLowerCase()));
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const avgTime = scores.reduce((sum, s) => sum + s.totalTime, 0) / scores.length;
  const highestScore = Math.max(...scores.map(s => s.score));
  const fastestTime = Math.min(...scores.map(s => s.totalTime));

  return {
    totalParticipants: uniqueStudents.size,
    totalAttempts: scores.length,
    averageScore: Math.round(avgScore),
    averageTime: Math.round(avgTime),
    highestScore,
    fastestTime,
  };
}
