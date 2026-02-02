import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

type ResponseData = {
    success: boolean;
    count?: number;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { count, error } = await supabase
            .from('counseling_cases')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error fetching counseling count:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch counseling count' });
        }

        return res.status(200).json({ success: true, count: count || 0 });
    } catch (error: any) {
        console.error('Exception in get-counseling-count:', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
}
