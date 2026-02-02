import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type ResponseData = {
  success?: boolean;
  error?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { assessmentType, questions, currentUserId } = req.body;

    // Validate required fields
    if (!assessmentType || !questions || !Array.isArray(questions) || !currentUserId) {
      return res.status(400).json({ error: 'Missing required fields: assessmentType, questions array, and currentUserId' });
    }

    // Validate assessmentType - allow all valid assessment types
    const validTypes = ['akpd', 'aum', 'sma_smk', 'mbti', 'riasec', 'kecerdasan_majemuk', 'gaya_belajar', 'kecerdasan_emosional', 'bullying'];
    // Also allow grade-specific AKPD types like akpd_VII, akpd_VIII, akpd_IX
    const isValidType = validTypes.includes(assessmentType) || assessmentType.startsWith('akpd_');
    if (!isValidType) {
      return res.status(400).json({ error: `Invalid assessmentType "${assessmentType}". Must be one of: ${validTypes.join(', ')}` });
    }

    // Create server-side Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the current user is a super admin or teacher (server-side authorization check)
    const { data: userProfileData, error: userProfileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', currentUserId)
      .single();

    const userRole = userProfileData?.role;

    // Check if user is super admin
    let isSuperAdmin = false;
    try {
      const { data: adminData } = await supabaseAdmin
        .from('admin_users')
        .select('is_super_admin')
        .eq('id', currentUserId)
        .single();

      isSuperAdmin = adminData?.is_super_admin || false;
    } catch (adminError) {
      // User might not be an admin, that's okay
    }

    // Allow only super admin or teacher role
    if (!isSuperAdmin && userRole !== 'teacher') {
      console.warn(`Unauthorized attempt to save assessment questions by user ${currentUserId} with role ${userRole}`);
      return res.status(403).json({ error: 'Only super admins and teachers can edit assessment questions' });
    }

    // STRATEGY CHANGE: Use Delete + Insert instead of Upsert to avoid constraint errors
    // First, delete ALL existing questions for this assessment type
    const { error: deleteError } = await supabaseAdmin
      .from('assessment_questions')
      .delete()
      .eq('assessment_type', assessmentType);

    if (deleteError) {
      console.error('Error deleting old assessment questions:', deleteError);
      return res.status(500).json({ error: deleteError.message });
    }

    // Then insert all new questions
    const upsertData = questions.map((question: any) => {
      const { id, ...questionData } = question;
      return {
        assessment_type: assessmentType,
        question_id: id,
        question_data: questionData,
        updated_by: currentUserId,
        created_by: currentUserId,
      };
    });

    const { data: savedData, error: insertError } = await supabaseAdmin
      .from('assessment_questions')
      .insert(upsertData)
      .select();

    if (insertError) {
      console.error('Error inserting assessment questions:', insertError);
      return res.status(500).json({ error: insertError.message });
    }

    console.log(`✅ Assessment questions saved for ${assessmentType} by user ${currentUserId}`);
    return res.status(200).json({
      success: true,
      data: {
        assessmentType,
        count: savedData?.length || 0,
        message: `${savedData?.length || 0} questions saved successfully`
      }
    });
  } catch (error) {
    console.error('Exception in assessment-questions/save:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
