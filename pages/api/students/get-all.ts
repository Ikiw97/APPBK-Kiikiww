import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('kelas', { ascending: true })
            .order('nama', { ascending: true });

        if (error) {
            throw error;
        }

        // Group by class for easier consumption and map fields
        const groupedByClass: Record<string, any[]> = {};
        (data || []).forEach(student => {
            if (!groupedByClass[student.kelas]) {
                groupedByClass[student.kelas] = [];
            }
            // Map database field (jenis_kelamin) to frontend field (jenisKelamin)
            groupedByClass[student.kelas].push({
                id: student.id,
                nis: student.nis,
                nama: student.nama,
                kelas: student.kelas,
                jenisKelamin: student.jenis_kelamin,
                avatarUrl: student.avatar_url
            });
        });

        return res.status(200).json({ success: true, data: groupedByClass });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
