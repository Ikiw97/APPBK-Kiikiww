import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        switch (method) {
            case 'POST': {
                // Add new student
                const { nis, nama, kelas, jenis_kelamin } = req.body;

                console.log('Adding student:', { nis, nama, kelas, jenis_kelamin });

                if (!nis || !nama || !kelas) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required fields: nis, nama, kelas'
                    });
                }

                const { data, error } = await supabase
                    .from('students')
                    .insert([{ nis, nama, kelas, jenis_kelamin }])
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase insert error:', error);
                    throw error;
                }

                console.log('Student added successfully:', data);
                return res.status(200).json({ success: true, data });
            }

            case 'PUT': {
                // Update student
                const { id, ...updates } = req.body;

                console.log('Updating student:', { id, updates });

                const { data, error } = await supabase
                    .from('students')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase update error:', error);
                    throw error;
                }

                return res.status(200).json({ success: true, data });
            }

            case 'DELETE': {
                // Delete student
                const { id } = req.body;

                console.log('Deleting student:', id);

                const { error } = await supabase
                    .from('students')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Supabase delete error:', error);
                    throw error;
                }

                return res.status(200).json({ success: true });
            }

            default:
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error('API Error Details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return res.status(500).json({
            success: false,
            error: error.message,
            details: error.details || 'Check server logs for more information'
        });
    }
}
