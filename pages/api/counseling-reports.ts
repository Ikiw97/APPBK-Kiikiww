import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

interface CounselingReportStudent {
    student_id: string;
    student_name: string;
    student_nis?: string;
}

interface CounselingReport {
    id?: string;
    report_type: 'pribadi' | 'kelompok';
    class: string;
    service_type: 'pribadi' | 'kelompok';
    problem_description: string;
    solution: string;
    counselor?: string;
    students: CounselingReportStudent[];
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
        console.error('Counseling reports API error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
}

// GET - Fetch all reports with students
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { class: classFilter, report_type } = req.query;

    let query = supabase
        .from('counseling_reports')
        .select(`
      *,
      counseling_report_students (
        id,
        student_id,
        student_name,
        student_nis
      )
    `)
        .order('created_at', { ascending: false });

    if (classFilter) {
        query = query.eq('class', classFilter);
    }

    if (report_type) {
        query = query.eq('report_type', report_type);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching counseling reports:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    // Transform data to include students array
    const reports = data?.map(report => ({
        ...report,
        students: report.counseling_report_students || []
    }));

    return res.status(200).json({ success: true, data: reports });
}

// POST - Create new report with students
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const { report_type, class: className, service_type, problem_description, solution, counselor, students } = req.body;

    // Validate required fields
    if (!report_type || !className || !service_type || !problem_description || !solution || !students?.length) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    // Insert report
    const { data: reportData, error: reportError } = await supabase
        .from('counseling_reports')
        .insert({
            report_type,
            class: className,
            service_type,
            problem_description,
            solution,
            counselor: counselor || null
        })
        .select()
        .single();

    if (reportError) {
        console.error('Error creating counseling report:', reportError);
        return res.status(500).json({ success: false, error: reportError.message });
    }

    // Insert students
    const studentsToInsert = students.map((student: CounselingReportStudent) => ({
        report_id: reportData.id,
        student_id: student.student_id,
        student_name: student.student_name,
        student_nis: student.student_nis || null
    }));

    const { error: studentsError } = await supabase
        .from('counseling_report_students')
        .insert(studentsToInsert);

    if (studentsError) {
        console.error('Error adding students to report:', studentsError);
        // Rollback - delete the report
        await supabase.from('counseling_reports').delete().eq('id', reportData.id);
        return res.status(500).json({ success: false, error: studentsError.message });
    }

    return res.status(201).json({ success: true, data: reportData });
}

// PUT - Update report
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    const { id, report_type, class: className, service_type, problem_description, solution, counselor, students } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Report ID is required' });
    }

    // Update report
    const { data: reportData, error: reportError } = await supabase
        .from('counseling_reports')
        .update({
            report_type,
            class: className,
            service_type,
            problem_description,
            solution,
            counselor: counselor || null
        })
        .eq('id', id)
        .select()
        .single();

    if (reportError) {
        console.error('Error updating counseling report:', reportError);
        return res.status(500).json({ success: false, error: reportError.message });
    }

    // If students are provided, update them
    if (students && students.length > 0) {
        // Delete existing students
        await supabase
            .from('counseling_report_students')
            .delete()
            .eq('report_id', id);

        // Insert new students
        const studentsToInsert = students.map((student: CounselingReportStudent) => ({
            report_id: id,
            student_id: student.student_id,
            student_name: student.student_name,
            student_nis: student.student_nis || null
        }));

        const { error: studentsError } = await supabase
            .from('counseling_report_students')
            .insert(studentsToInsert);

        if (studentsError) {
            console.error('Error updating students:', studentsError);
        }
    }

    return res.status(200).json({ success: true, data: reportData });
}

// DELETE - Delete report (cascade will delete students)
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Report ID is required' });
    }

    const { error } = await supabase
        .from('counseling_reports')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting counseling report:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true });
}
