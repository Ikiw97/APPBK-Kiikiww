import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .order('nama', { ascending: true });

        if (error) {
            console.error('Error fetching teachers:', error);
            throw error;
        }

        return res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            data: []
        });
    }
}
