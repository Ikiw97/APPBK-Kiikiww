import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ success: false, error: 'session_id is required' });
    }

    try {
        console.log('Fetching responses for session:', session_id);

        const { data, error } = await supabase
            .from('sociometry_responses')
            .select('*')
            .eq('session_id', session_id);

        if (error) {
            console.error('Supabase fetch error:', error);
            throw error;
        }

        console.log(`Found ${data?.length || 0} responses`);
        if (data && data.length > 0) {
            console.log('Sample response data:', JSON.stringify(data[0], null, 2));
        }
        return res.status(200).json({ success: true, data: data || [] });
    } catch (error: any) {
        console.error('API Error:', {
            message: error.message,
            code: error.code
        });
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
