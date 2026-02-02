import type { NextApiRequest, NextApiResponse } from 'next';
import { clearKahootDatabase } from '@/lib/kahootDatabase';

type ResponseData = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📨 API: Received clear-scores request');

    await clearKahootDatabase();

    return res.status(200).json({
      success: true,
      message: 'All Kahoot scores cleared successfully',
    });
  } catch (error) {
    console.error('❌ API Error in clear-scores:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
