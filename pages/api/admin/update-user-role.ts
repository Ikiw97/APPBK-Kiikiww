import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type ResponseData = {
  success?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, role, currentUserId } = req.body;

    if (!userId || !role || !currentUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
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

    // Verify the current user is an admin
    const { data: adminData, error: adminCheckError } = await supabaseAdmin
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', currentUserId)
      .single();

    if (adminCheckError || !adminData) {
      return res.status(403).json({ error: 'Only admins can update user roles' });
    }

    // Update user role
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ role })
      .eq('id', userId);

    if (updateError) {
      return res.status(400).json({ error: 'Failed to update user role' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
