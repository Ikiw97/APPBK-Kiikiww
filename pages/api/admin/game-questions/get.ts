import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type ResponseData = {
  success?: boolean;
  error?: string;
  data?: any[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gameType } = req.query;

    if (!gameType) {
      return res.status(400).json({ error: 'Missing gameType parameter' });
    }

    // Create Supabase client (public read access is allowed by RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Fetch game questions
    const { data, error } = await supabase
      .from('game_questions')
      .select('*')
      .eq('game_type', gameType)
      .order('game_id', { ascending: true });

    if (error) {
      console.error('Error fetching game questions:', error);
      return res.status(500).json({ error: error.message });
    }

    // Parse the question_data from JSONB
    const questions = data?.map((row: any) => ({
      id: row.game_id,
      ...row.question_data
    })) || [];

    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error('Exception in game-questions/get:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
