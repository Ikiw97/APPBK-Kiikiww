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
        } else if (assessmentId === 'riasec') {
            // RIASEC scores are already calculated in the frontend
            // Preserve the score fields and holland_code
            calculatedResult = {
                scores: {
                    R: formData.score_r || 0,
                    I: formData.score_i || 0,
                    A: formData.score_a || 0,
                    S: formData.score_s || 0,
                    E: formData.score_e || 0,
                    C: formData.score_c || 0
                },
                score_r: formData.score_r,
                score_i: formData.score_i,
                score_a: formData.score_a,
                score_s: formData.score_s,
                score_e: formData.score_e,
                score_c: formData.score_c,
                holland_code: formData.holland_code
            };
        } else if (assessmentId === 'bullying') {
            // Bullying scores are already calculated in the frontend
            calculatedResult = {
                scores: {
                    knowledge: formData.score_knowledge || 0,
                    attitude: formData.score_attitude || 0,
                    empathy: formData.score_empathy || 0,
                    bystander: formData.score_bystander || 0,
                    experience: formData.score_experience || 0
                },
                score_knowledge: formData.score_knowledge,
                score_attitude: formData.score_attitude,
                score_empathy: formData.score_empathy,
                score_bystander: formData.score_bystander,
                score_experience: formData.score_experience,
                total_score: formData.total_score,
                level: formData.level
            };
        } else if (assessmentId === 'sma_smk_career') {
            // Skip generic calculation for SMA/SMK as it handles its own logic below
            calculatedResult = null;
        } else {
            // Generic calculation
            const { calculateGenericResult } = require('@/lib/genericResultCalculator');
            calculatedResult = calculateGenericResult(answers, questions);
        }

        // SMA/SMK Career Path specific handling
        if (assessmentId === 'sma_smk_career') {
            const result = {
                nama: String(formData.nama),
                kelas: String(formData.kelas),
                jenis_kelamin: String(formData.jenisKelamin),
                nis: String(formData.nis),

                // Scores
                sma_ipa_score: formData.sma_ipa_score || 0,
                sma_ips_score: formData.sma_ips_score || 0,
                sma_bahasa_score: formData.sma_bahasa_score || 0,
                smk_teknologi_score: formData.smk_teknologi_score || 0,
                smk_tik_score: formData.smk_tik_score || 0,
                smk_bisnis_score: formData.smk_bisnis_score || 0,
                smk_kesehatan_score: formData.smk_kesehatan_score || 0,
                smk_pariwisata_score: formData.smk_pariwisata_score || 0,
                smk_agribisnis_score: formData.smk_agribisnis_score || 0,
                smk_seni_score: formData.smk_seni_score || 0,

                recommended_path: formData.recommended_path,
                answers: answers,
                created_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('sma_smk_career_path_results')
                .insert([result]);

            if (error) {
                console.error('❌ Database error:', error);
                return res.status(500).json({ success: false, error: error.message });
            }

            return res.status(200).json({ success: true, data });
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
        console.error('Stack:', error.stack);
        return res.status(500).json({
            success: false,
            error: `${error.message} (Location: ${error.stack?.split('\n')[1]?.trim()})`
        });
    }
}
