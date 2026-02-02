import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        const { type, level } = req.query;

        if (!type) {
            return res.status(400).json({ error: 'Missing type parameter' });
        }

        try {
            let query = supabase
                .from('exercise_questions')
                .select('*')
                .eq('type', type);

            if (level) {
                query = query.eq('level', level);
            }

            // Order by created_at or id to maintain stability
            query = query.order('created_at', { ascending: true });

            const { data, error } = await query;

            if (error) throw error;

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({ error: 'Failed to fetch questions' });
        }
    }

    if (method === 'POST') {
        // Check for authentication/authorization if needed
        // const token = req.headers.authorization;
        // ... verification logic ...

        const { id, type, level, category, question, answers, correct_index, explanation, time_limit } = req.body;

        if (!type || !level || !question || !answers) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const payload = {
                type,
                level,
                category, // optional usually, but our schema says NOT NULL
                question,
                answers,
                correct_index,
                explanation,
                time_limit,
                updated_at: new Date().toISOString()
            };

            let result;
            if (id) {
                // Update
                const { data, error } = await supabase
                    .from('exercise_questions')
                    .update(payload)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            } else {
                // Create
                const { data, error } = await supabase
                    .from('exercise_questions')
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Error saving question:', error);
            return res.status(500).json({ error: 'Failed to save question' });
        }
    }

    if (method === 'DELETE') {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Missing id parameter' });
        }

        try {
            const { error } = await supabase
                .from('exercise_questions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting question:', error);
            return res.status(500).json({ error: 'Failed to delete question' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
}
