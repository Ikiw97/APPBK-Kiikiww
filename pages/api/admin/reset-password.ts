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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, newPassword, currentUserId } = req.body;

    if (!userId || !newPassword || !currentUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
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
      return res.status(403).json({ error: 'Only super admins can reset passwords' });
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      return res.status(400).json({ error: 'Failed to reset password' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
