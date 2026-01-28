import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

interface ParentGuestBookEntry {
    id?: string;
    visit_date: string;
    student_id: string;
    student_name: string;
    student_class: string;
    parent_name: string;
    visit_purpose: string;
    problem_solution?: string;
    created_at?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        switch (req.method) {
            case 'GET':
                return await handleGet(req, res);
            case 'POST':
                return await handlePost(req, res);
            case 'PUT':
                return await handlePut(req, res);
            case 'DELETE':
                return await handleDelete(req, res);
            default:
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error('Parent guest book API error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
}

// GET - Fetch all entries with optional filters
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { class: classFilter, start_date, end_date } = req.query;

    let query = supabase
        .from('parent_guest_book')
        .select('*')
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (classFilter) {
        query = query.eq('student_class', classFilter);
    }

    if (start_date) {
        query = query.gte('visit_date', start_date);
    }

    if (end_date) {
        query = query.lte('visit_date', end_date);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching parent guest book:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
}

// POST - Create new entry
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const { visit_date, student_id, student_name, student_class, parent_name, visit_purpose, problem_solution } = req.body;

    // Validate required fields
    if (!visit_date || !student_id || !student_name || !student_class || !parent_name || !visit_purpose) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    const { data, error } = await supabase
        .from('parent_guest_book')
        .insert({
            visit_date,
            student_id,
            student_name,
            student_class,
            parent_name,
            visit_purpose,
            problem_solution: problem_solution || null
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating parent guest book entry:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({ success: true, data });
}

// PUT - Update entry
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    const { id, visit_date, student_id, student_name, student_class, parent_name, visit_purpose, problem_solution } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Entry ID is required' });
    }

    const { data, error } = await supabase
        .from('parent_guest_book')
        .update({
            visit_date,
            student_id,
            student_name,
            student_class,
            parent_name,
            visit_purpose,
            problem_solution: problem_solution || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating parent guest book entry:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
}

// DELETE - Delete entry
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Entry ID is required' });
    }

    const { error } = await supabase
        .from('parent_guest_book')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting parent guest book entry:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true });
}
