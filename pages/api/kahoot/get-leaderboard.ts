import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchKahootLeaderboard, fetchKahootStats } from '@/lib/kahootDatabase';

type ResponseData = {
  success?: boolean;
  leaderboard?: any[];
  stats?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📨 API: Received get-leaderboard request');

    const [leaderboard, stats] = await Promise.all([
      fetchKahootLeaderboard(),
      fetchKahootStats(),
    ]);

    // Convert snake_case from database to camelCase for frontend
    const leaderboardWithRanking = leaderboard.map((score, index) => ({
      id: score.id,
      studentName: score.student_name,
      score: score.score,
      totalQuestions: score.total_questions,
      percentage: score.percentage,
      totalTime: score.total_time,
      completionTime: score.completion_time,
      answers: score.answers,
      rank: index + 1,
    }));

    return res.status(200).json({
      success: true,
      leaderboard: leaderboardWithRanking,
      stats,
    });
  } catch (error) {
    console.error('❌ API Error in get-leaderboard:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
