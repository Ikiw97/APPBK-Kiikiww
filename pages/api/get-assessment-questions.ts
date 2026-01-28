import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

type ResponseData = {
    success: boolean;
    data?: any;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { assessmentId } = req.query;

    if (!assessmentId) {
        return res.status(400).json({ success: false, error: 'Missing assessmentId' });
    }

    try {
        const { data, error } = await supabase
            .from('assessment_questions')
            .select('*')
            .eq('assessment_type', assessmentId)
            .order('question_id', { ascending: true });

        if (error) {
            console.error('❌ Database error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Map to simple structure
        const mappedData = data.map((row: any) => ({
            id: row.question_id,
            ...row.question_data
        }));

        return res.status(200).json({ success: true, data: mappedData });
    } catch (error: any) {
        console.error('❌ Get questions API error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
}
