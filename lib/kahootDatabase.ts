import { supabase } from './supabaseClient';

export interface KahootScoreDB {
  id?: string;
  student_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  total_time: number;
  completion_time: string;
  answers: (number | null)[];
  created_at?: string;
}

/**
 * Save Kahoot score to Supabase database
 */
export async function saveKahootScoreToDB(
  studentName: string,
  score: number,
  totalQuestions: number,
  totalTime: number,
  answers: (number | null)[]
): Promise<KahootScoreDB> {
  try {
    console.log('💾 [saveKahootScoreToDB] Starting save...', {
      studentName,
      score,
      totalQuestions,
      totalTime,
      timestamp: new Date().toISOString(),
    });

    const scoreData: KahootScoreDB = {
      student_name: studentName.trim(),
      score,
      total_questions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      total_time: totalTime,
      completion_time: new Date().toISOString(),
      answers,
    };

    console.log('💾 [saveKahootScoreToDB] Prepared data:', scoreData);

    const { data, error } = await supabase
      .from('kahoot_scores')
      .insert([scoreData])
      .select();

    console.log('💾 [saveKahootScoreToDB] Supabase response:', {
      hasData: !!data,
      hasError: !!error,
      errorMessage: error?.message,
      errorCode: error?.code,
      dataLength: data?.length || 0,
    });

    if (error) {
      console.error('❌ [saveKahootScoreToDB] Supabase error:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      });
      throw new Error(`Supabase error (${error.code}): ${error.message}`);
    }

    console.log('✅ [saveKahootScoreToDB] Score saved successfully:', data?.[0]);
    return data?.[0] || scoreData;
  } catch (error) {
    console.error('❌ [saveKahootScoreToDB] Exception:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Fetch Kahoot leaderboard from Supabase
 * Deduplicates by student_name (keeps only the best score for each student)
 */
export async function fetchKahootLeaderboard() {
  try {
    console.log('📊 [fetchKahootLeaderboard] Starting fetch from Supabase...');
    console.log('📊 [fetchKahootLeaderboard] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');

    const { data, error } = await supabase
      .from('kahoot_scores')
      .select('*')
      .order('score', { ascending: false })
      .order('total_time', { ascending: true });

    console.log('📊 [fetchKahootLeaderboard] Supabase response:', { hasData: !!data, hasError: !!error, dataLength: data?.length || 0 });

    if (error) {
      console.error('❌ [fetchKahootLeaderboard] Supabase error:', error);
      throw error;
    }

    // Deduplicate by student_name - keep only the best score for each student
    const deduplicatedMap = new Map<string, KahootScoreDB>();

    if (data) {
      data.forEach((score: KahootScoreDB) => {
        const studentNameKey = score.student_name?.toLowerCase() || '';
        const existing = deduplicatedMap.get(studentNameKey);

        // Keep the one with higher score, or if same score, the one with lower time
        if (!existing ||
            score.score > existing.score ||
            (score.score === existing.score && score.total_time < existing.total_time)) {
          deduplicatedMap.set(studentNameKey, score);
        }
      });
    }

    const dedupedData = Array.from(deduplicatedMap.values());

    // Sort by score (descending) then by time (ascending)
    dedupedData.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.total_time - b.total_time;
    });

    console.log('📊 [fetchKahootLeaderboard] Final leaderboard:', {
      totalPlayers: dedupedData.length,
      rawRecords: data?.length || 0,
      top3: dedupedData.slice(0, 3).map(s => ({
        name: s.student_name,
        score: s.score,
        time: s.total_time,
      })),
    });

    return dedupedData;
  } catch (error) {
    console.error('❌ Exception in fetchKahootLeaderboard:', error);
    throw error;
  }
}

/**
 * Get Kahoot statistics
 * Only counts unique students (deduplicates by student_name)
 */
export async function fetchKahootStats() {
  try {
    console.log('📈 Fetching Kahoot stats...');

    // Get deduplicated leaderboard data
    const leaderboardData = await fetchKahootLeaderboard();

    if (!leaderboardData || leaderboardData.length === 0) {
      return {
        totalParticipants: 0,
        totalAttempts: 0,
        averageScore: 0,
        averageTime: 0,
        highestScore: 0,
        fastestTime: 0,
      };
    }

    // Calculate stats from deduplicated data (one entry per student)
    const avgScore = leaderboardData.reduce((sum: number, s: KahootScoreDB) => sum + s.score, 0) / leaderboardData.length;
    const avgTime = leaderboardData.reduce((sum: number, s: KahootScoreDB) => sum + s.total_time, 0) / leaderboardData.length;
    const highestScore = Math.max(...leaderboardData.map(s => s.score));
    const fastestTime = Math.min(...leaderboardData.map(s => s.total_time));

    // Get total attempts (sum of all records)
    const { data: allRecords, error } = await supabase
      .from('kahoot_scores')
      .select('id');

    if (error) {
      console.error('❌ Error fetching total attempts:', error);
    }

    const totalAttempts = allRecords?.length || leaderboardData.length;

    return {
      totalParticipants: leaderboardData.length,
      totalAttempts: totalAttempts,
      averageScore: Math.round(avgScore),
      averageTime: Math.round(avgTime),
      highestScore,
      fastestTime,
    };
  } catch (error) {
    console.error('❌ Exception in fetchKahootStats:', error);
    throw error;
  }
}

/**
 * Clear all Kahoot scores from database
 */
export async function clearKahootDatabase() {
  try {
    console.log('🗑️ Clearing Kahoot scores from database...');

    // Step 1: Get all record IDs
    const { data: allRecords, error: fetchError } = await supabase
      .from('kahoot_scores')
      .select('id');

    if (fetchError) {
      console.error('❌ Error fetching records:', fetchError);
      throw fetchError;
    }

    // Step 2: If there are records, delete them using the .in() filter
    if (allRecords && allRecords.length > 0) {
      const ids = allRecords.map(record => record.id);
      console.log(`🗑️ Found ${ids.length} records to delete...`);

      const { error: deleteError } = await supabase
        .from('kahoot_scores')
        .delete()
        .in('id', ids);

      if (deleteError) {
        console.error('❌ Error deleting Kahoot scores:', deleteError);
        throw deleteError;
      }

      console.log(`✅ Successfully deleted ${ids.length} records`);
    } else {
      console.log('✅ No records to delete (database already empty)');
    }

    console.log('✅ Kahoot scores cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Exception in clearKahootDatabase:', error);
    throw error;
  }
}

/**
 * Get student's best score
 */
export async function getStudentBestScore(studentName: string) {
  try {
    const { data, error } = await supabase
      .from('kahoot_scores')
      .select('*')
      .ilike('student_name', studentName)
      .order('score', { ascending: false })
      .order('total_time', { ascending: true })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching student best score:', error);
      throw error;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('❌ Exception in getStudentBestScore:', error);
    throw error;
  }
}
