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
  // Accept both DELETE and POST for better client compatibility
  // Some HTTP clients don't support DELETE with request body
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, currentUserId } = req.body;

    if (!userId || !currentUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    // Verify the current user is a super admin
    const { data: adminData, error: adminCheckError } = await supabaseAdmin
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', currentUserId)
      .single();

    if (adminCheckError || !adminData?.is_super_admin) {
      return res.status(403).json({ error: 'Only super admins can delete accounts' });
    }

    // Prevent deleting yourself
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete from admin_users first (due to foreign key)
    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (adminError) {
      console.error('Error deleting from admin_users:', adminError);
    }

    // Delete from auth.users (will cascade to user_profiles)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      return res.status(400).json({ error: 'Failed to delete user' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
