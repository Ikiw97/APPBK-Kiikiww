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
    const { gameType, questions, currentUserId } = req.body;

    // Validate required fields
    if (!gameType || !questions || !Array.isArray(questions) || !currentUserId) {
      return res.status(400).json({ error: 'Missing required fields: gameType, questions array, and currentUserId' });
    }

    // Validate gameType
    if (!['kahoot', 'vocabulary', 'puzzle'].includes(gameType)) {
      return res.status(400).json({ error: 'Invalid gameType. Must be "kahoot", "vocabulary", or "puzzle"' });
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
      console.warn(`Unauthorized attempt to save game questions by user ${currentUserId} with role ${userRole}`);
      return res.status(403).json({ error: 'Only super admins and teachers can edit game questions' });
    }

    // Fetch existing questions for this game type
    const { data: existingQuestions, error: fetchError } = await supabaseAdmin
      .from('game_questions')
      .select('game_id')
      .eq('game_type', gameType);

    if (fetchError) {
      console.error('Error fetching existing questions:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    const existingGameIds = new Set(existingQuestions?.map((q: any) => q.game_id) || []);
    const newGameIds = new Set(questions.map((q: any) => q.id));

    // Delete questions that are no longer in the list
    const toDelete = Array.from(existingGameIds).filter((id: any) => !newGameIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('game_questions')
        .delete()
        .eq('game_type', gameType)
        .in('game_id', toDelete);

      if (deleteError) {
        console.error('Error deleting old questions:', deleteError);
        return res.status(500).json({ error: deleteError.message });
      }
    }

    // Upsert all questions
    const upsertData = questions.map((question: any) => {
      const { id, ...questionData } = question;
      return {
        game_type: gameType,
        game_id: id,
        question_data: questionData,
        updated_by: currentUserId,
        created_by: currentUserId,
      };
    });

    const { data: savedData, error: upsertError } = await supabaseAdmin
      .from('game_questions')
      .upsert(upsertData, { onConflict: 'game_type,game_id' })
      .select();

    if (upsertError) {
      console.error('Error upserting game questions:', upsertError);
      return res.status(500).json({ error: upsertError.message });
    }

    console.log(`✅ Game questions saved for ${gameType} by user ${currentUserId}`);
    return res.status(200).json({ 
      success: true, 
      data: {
        gameType,
        count: savedData?.length || 0,
        message: `${savedData?.length || 0} questions saved successfully`
      }
    });
  } catch (error) {
    console.error('Exception in game-questions/save:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
