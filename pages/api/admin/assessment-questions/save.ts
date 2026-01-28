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

    // Validate assessmentType
    if (!['akpd', 'aum'].includes(assessmentType)) {
      return res.status(400).json({ error: 'Invalid assessmentType. Must be "akpd" or "aum"' });
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

    // Fetch existing questions for this assessment type
    const { data: existingQuestions, error: fetchError } = await supabaseAdmin
      .from('assessment_questions')
      .select('question_id')
      .eq('assessment_type', assessmentType);

    if (fetchError) {
      console.error('Error fetching existing assessment questions:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    const existingQuestionIds = new Set(existingQuestions?.map((q: any) => q.question_id) || []);
    const newQuestionIds = new Set(questions.map((q: any) => q.id));

    // Delete questions that are no longer in the list
    const toDelete = Array.from(existingQuestionIds).filter((id: any) => !newQuestionIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('assessment_questions')
        .delete()
        .eq('assessment_type', assessmentType)
        .in('question_id', toDelete);

      if (deleteError) {
        console.error('Error deleting old assessment questions:', deleteError);
        return res.status(500).json({ error: deleteError.message });
      }
    }

    // Upsert all questions
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

    const { data: savedData, error: upsertError } = await supabaseAdmin
      .from('assessment_questions')
      .upsert(upsertData, { onConflict: 'assessment_type,question_id' })
      .select();

    if (upsertError) {
      console.error('Error upserting assessment questions:', upsertError);
      return res.status(500).json({ error: upsertError.message });
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
