import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // GET - Fetch all attendance records or by class
    if (req.method === 'GET') {
        try {
            const { kelas } = req.query;

            let query = supabase
                .from('record_absensi')
                .select(`
          id,
          siswa_id,
          tanggal,
          status,
          keterangan,
          jam_masuk,
          jam_keluar,
          keterangan_izin
        `)
                .order('tanggal', { ascending: false });

            // Note: Filter server-side by class removed temporarily as it requires valid relation to students table
            // Filtering is handled client-side

            const { data, error } = await query;

            if (error) throw error;

            // Transform data to match frontend format
            const transformedData = data?.map(record => ({
                id: record.id,
                siswaId: record.siswa_id,
                tanggal: new Date(record.tanggal),
                status: record.status,
                keterangan: record.keterangan,
                jamMasuk: record.jam_masuk,
                jamKeluar: record.jam_keluar,
                keteranganIzin: record.keterangan_izin
            })) || [];

            return res.status(200).json({ success: true, data: transformedData });
        } catch (error: any) {
            console.error('Error fetching attendance records:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // POST - Add new attendance record
    if (req.method === 'POST') {
        try {
            const { siswaId, tanggal, status, keterangan, jamMasuk, jamKeluar, keteranganIzin } = req.body;

            const { data, error } = await supabase
                .from('record_absensi')
                .insert({
                    siswa_id: siswaId,
                    tanggal: tanggal,
                    status: status,
                    keterangan: keterangan || null,
                    jam_masuk: jamMasuk || null,
                    jam_keluar: jamKeluar || null,
                    keterangan_izin: keteranganIzin || null
                })
                .select()
                .single();

            if (error) throw error;

            return res.status(201).json({
                success: true,
                data: {
                    id: data.id,
                    siswaId: data.siswa_id,
                    tanggal: new Date(data.tanggal),
                    status: data.status,
                    keterangan: data.keterangan,
                    jamMasuk: data.jam_masuk,
                    jamKeluar: data.jam_keluar,
                    keteranganIzin: data.keterangan_izin
                }
            });
        } catch (error: any) {
            console.error('Error creating attendance record:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // PUT - Update attendance record
    if (req.method === 'PUT') {
        try {
            const { id, status, keterangan, jamMasuk, jamKeluar, keteranganIzin } = req.body;

            const { data, error } = await supabase
                .from('record_absensi')
                .update({
                    status: status,
                    keterangan: keterangan || null,
                    jam_masuk: jamMasuk || null,
                    jam_keluar: jamKeluar || null,
                    keterangan_izin: keteranganIzin || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                data: {
                    id: data.id,
                    siswaId: data.siswa_id,
                    tanggal: new Date(data.tanggal),
                    status: data.status,
                    keterangan: data.keterangan,
                    jamMasuk: data.jam_masuk,
                    jamKeluar: data.jam_keluar,
                    keteranganIzin: data.keterangan_izin
                }
            });
        } catch (error: any) {
            console.error('Error updating attendance record:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE - Delete attendance record(s)
    if (req.method === 'DELETE') {
        try {
            const { id, deleteAll, kelas } = req.body;

            if (deleteAll) {
                // Delete all records, optionally filtered by class
                let query = supabase.from('record_absensi').delete();

                if (kelas && kelas !== 'semua') {
                    // Get siswa IDs for the class first (from 'students' table, NOT 'siswa_absensi')
                    const { data: siswaData, error: siswaError } = await supabase
                        .from('students')
                        .select('id')
                        .eq('kelas', kelas);

                    if (siswaError) throw siswaError;

                    if (siswaData && siswaData.length > 0) {
                        const siswaIds = siswaData.map(s => s.id);
                        query = query.in('siswa_id', siswaIds);
                    } else {
                        // If no students in this class, nothing to delete
                        return res.status(200).json({ success: true, message: 'No records to delete for this class' });
                    }
                } else {
                    // Delete all records
                    // Simply target all records without a restrictive WHERE if possible, 
                    // or use a filter that matches everything.
                    query = query.filter('id', 'neq', '00000000-0000-0000-0000-000000000000');
                }

                const { error } = await query;
                if (error) throw error;

                return res.status(200).json({ success: true, message: 'Records deleted successfully' });
            } else if (id) {
                // Delete single record
                const { error, count } = await supabase
                    .from('record_absensi')
                    .delete()
                    .eq('id', id);

                if (error) {
                    return res.status(500).json({ success: false, error: `Database error: ${error.message} (Code: ${error.code})` });
                }

                return res.status(200).json({ success: true, message: 'Record deleted', deletedCount: count });
            }

            return res.status(400).json({ success: false, error: 'No id or deleteAll flag provided' });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: `Unexpected error: ${error.message}` });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}
