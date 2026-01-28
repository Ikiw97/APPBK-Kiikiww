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
    const { assessmentType } = req.query;

    if (!assessmentType) {
      return res.status(400).json({ error: 'Missing assessmentType parameter' });
    }

    // Create Supabase client (public read access is allowed by RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Fetch assessment questions
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('assessment_type', assessmentType)
      .order('question_id', { ascending: true });

    if (error) {
      console.error('Error fetching assessment questions:', error);
      return res.status(500).json({ error: error.message });
    }

    // Parse the question_data from JSONB
    const questions = data?.map((row: any) => ({
      id: row.question_id,
      ...row.question_data
    })) || [];

    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error('Exception in assessment-questions/get:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
