import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type ResponseData = {
  success?: boolean;
  error?: string;
  userId?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, fullName, isSuperAdmin, currentUserId, role = 'teacher' } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !currentUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!['admin', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "admin" or "teacher"' });
    }

    if (password.length < 6) {
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
      return res.status(403).json({ error: 'Only super admins can create admin accounts' });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || 'Failed to create auth user' });
    }

    // 2. Update user_profiles table
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role: role,
          is_active: true,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      return res.status(400).json({ error: 'Failed to create user profile' });
    }

    // 3. Insert into admin_users table
    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        is_super_admin: isSuperAdmin || false,
        permissions: ['manage_students', 'manage_assessments', 'manage_settings'],
      });

    if (adminError) {
      return res.status(400).json({ error: 'Failed to create admin record' });
    }

    return res.status(201).json({
      success: true,
      userId: authData.user.id,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
