import type { NextApiRequest, NextApiResponse } from 'next';
import { saveKahootScoreToDB } from '@/lib/kahootDatabase';

type ResponseData = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentName, score, totalQuestions, totalTime, answers } = req.body;

    // Validate required fields
    if (!studentName || score === undefined || !totalQuestions || totalTime === undefined || !answers) {
      return res.status(400).json({
        error: 'Missing required fields: studentName, score, totalQuestions, totalTime, answers',
      });
    }

    console.log('📨 [save-score API] Received save score request', {
      studentName,
      score,
      totalQuestions,
      totalTime,
      timestamp: new Date().toISOString(),
    });

    // Check Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('📨 [save-score API] Supabase config:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'NOT SET',
    });

    const savedScore = await saveKahootScoreToDB(
      studentName,
      score,
      totalQuestions,
      totalTime,
      answers
    );

    console.log('📨 [save-score API] Score saved successfully:', {
      id: savedScore.id,
      student: savedScore.student_name,
      score: savedScore.score,
    });

    return res.status(200).json({
      success: true,
      message: 'Score saved successfully',
      data: savedScore,
    });
  } catch (error) {
    console.error('❌ [save-score API] Error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
