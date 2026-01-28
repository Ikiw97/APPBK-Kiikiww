import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ success: false, error: 'session_id is required' });
    }

    try {
        console.log('Deleting sociometry session:', session_id);

        // First, delete all responses for this session
        const { error: responsesError } = await supabase
            .from('sociometry_responses')
            .delete()
            .eq('session_id', session_id);

        if (responsesError) {
            console.error('Error deleting responses:', responsesError);
            // Continue anyway, maybe there were no responses
        }

        // Then delete the session itself
        const { error: sessionError } = await supabase
            .from('sociometry_sessions')
            .delete()
            .eq('id', session_id);

        if (sessionError) {
            console.error('Error deleting session:', sessionError);
            throw sessionError;
        }

        console.log('Session deleted successfully');
        return res.status(200).json({ success: true });
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
