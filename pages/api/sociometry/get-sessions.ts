import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server-side client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabase
            .from('sociometry_sessions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
