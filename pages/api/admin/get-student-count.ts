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
        // Get all assessment results
        const { data, error } = await supabase
            .from('assessment_results')
            .select('student_name');

        if (error) {
            console.error('Error fetching assessment results:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch assessment count' });
        }

        // Count unique student names
        const uniqueStudents = new Set<string>();
        data?.forEach(result => {
            if (result.student_name) {
                uniqueStudents.add(result.student_name);
            }
        });

        const count = uniqueStudents.size;

        return res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Exception in get-student-count:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
