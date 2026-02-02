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
                // Add new teacher
                const { nip, nama, jenis_kelamin, mata_pelajaran, jabatan, no_telepon, email } = req.body;

                console.log('Adding teacher:', { nip, nama, jenis_kelamin, mata_pelajaran, jabatan });

                if (!nip || !nama) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required fields: nip, nama'
                    });
                }

                const { data, error } = await supabase
                    .from('teachers')
                    .insert([{
                        nip,
                        nama,
                        jenis_kelamin: jenis_kelamin || 'L',
                        mata_pelajaran: mata_pelajaran || null,
                        jabatan: jabatan || null,
                        no_telepon: no_telepon || null,
                        email: email || null
                    }])
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase insert error:', error);
                    throw error;
                }

                console.log('Teacher added successfully:', data);
                return res.status(200).json({ success: true, data });
            }

            case 'PUT': {
                // Update teacher
                const { id, ...updates } = req.body;

                console.log('Updating teacher:', { id, updates });

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required field: id'
                    });
                }

                const { data, error } = await supabase
                    .from('teachers')
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
                // Delete teacher
                const { id } = req.body;

                console.log('Deleting teacher:', id);

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required field: id'
                    });
                }

                const { error } = await supabase
                    .from('teachers')
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
