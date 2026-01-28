import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { calculateAUMResult } from '@/lib/aumResultCalculator';
import { calculateAKPDResult } from '@/lib/akpdResultCalculator';
import { calculateEIResult } from '@/lib/eiResultCalculator';

type ResponseData = {
    success: boolean;
    data?: any;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { assessmentId, formData, questions } = req.body;

        if (!assessmentId || !formData || !questions) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Prepare answers object
        const answers: Record<string, string> = {};
        questions.forEach((q: any) => {
            const val = formData[q.id];
            if (val !== undefined && val !== null) {
                answers[q.id] = String(val);
            }
        });

        let calculatedResult = null;

        // Calculation logic (copied from supabaseClient.ts)
        if (assessmentId === 'aum') {
            calculatedResult = calculateAUMResult(formData.nama, formData.kelas, formData.jenisKelamin, answers);
        } else if (assessmentId === 'akpd') {
            calculatedResult = calculateAKPDResult(
                String(formData.nama),
                String(formData.kelas),
                String(formData.jenisKelamin),
                answers,
                questions
            );
        } else if (assessmentId === 'emotional_intelligence') {
            calculatedResult = calculateEIResult(
                String(formData.nama),
                String(formData.kelas),
                String(formData.jenisKelamin),
                formData
            );
        } else {
            // Generic calculation
            const { calculateGenericResult } = require('@/lib/genericResultCalculator');
            calculatedResult = calculateGenericResult(answers, questions);
        }

        const result = {
            assessment_id: assessmentId,
            student_name: String(formData.nama),
            class: String(formData.kelas),
            gender: String(formData.jenisKelamin),
            answers: answers,
            calculated_result: calculatedResult,
            completed_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('assessment_results')
            .insert([result]);

        if (error) {
            console.error('❌ Database error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error('❌ Submission API error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
}
