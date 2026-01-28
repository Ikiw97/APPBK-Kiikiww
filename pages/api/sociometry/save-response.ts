import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const response = req.body;

        console.log('Saving sociometry response:', {
            session_id: response.session_id,
            student_name: response.student_name
        });

        const { data, error } = await supabase
            .from('sociometry_responses')
            .insert(response)
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }

        console.log('Response saved successfully:', data.id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error('API Error:', {
            message: error.message,
            code: error.code,
            details: error.details
        });
        return res.status(500).json({
            success: false,
            error: error.message,
            details: error.details || 'Check server logs'
        });
    }
}
