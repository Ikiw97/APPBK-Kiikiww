// Admin Account Management Functions
import { supabase } from './supabaseClient';

export interface AdminUserData {
  id?: string;
  email: string;
  fullName: string;
  permissions?: string[];
  isSuperAdmin?: boolean;
  isActive?: boolean;
}

export interface UserProfileData {
  id?: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student' | 'super_admin';
}

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user.id;
}

/**
 * Create new admin account (email + password signup)
 * Only super admin can do this
 * Note: This calls a server-side API route for security
 */
export async function createAdminAccount(
  email: string,
  password: string,
  fullName: string,
  isSuperAdmin: boolean = false,
  role: 'admin' | 'teacher' = 'teacher'
) {
  try {
    const currentUserId = await getCurrentUserId();

    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
        isSuperAdmin,
        currentUserId,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create admin account');
    }

    console.log(`✅ Admin account created: ${email}`);
    return { id: data.userId };
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
}

/**
 * Get all admin users (only for super admin)
 */
export async function getAllAdminUsers() {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}

/**
 * Get all user profiles (teachers, students, etc)
 */
export async function getAllUserProfiles() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user role (admin can do this)
 * Note: This calls a server-side API route for security
 */
export async function updateUserRole(userId: string, role: 'admin' | 'teacher' | 'student') {
  try {
    const currentUserId = await getCurrentUserId();

    const response = await fetch('/api/admin/update-user-role', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        role,
        currentUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user role');
    }

    console.log(`✅ User role updated to ${role}`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Deactivate user account
 */
export async function deactivateUserAccount(userId: string) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    console.log(`✅ User account deactivated`);
    return true;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
}

/**
 * Reactivate user account
 */
export async function reactivateUserAccount(userId: string) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: true })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    console.log(`✅ User account reactivated`);
    return true;
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw error;
  }
}

/**
 * Delete admin account (super admin only)
 * Note: This calls a server-side API route for security
 */
export async function deleteAdminAccount(userId: string) {
  try {
    const currentUserId = await getCurrentUserId();

    const response = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        currentUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete admin account');
    }

    console.log(`✅ Admin account deleted`);
    return true;
  } catch (error) {
    console.error('Error deleting admin account:', error);
    throw error;
  }
}

/**
 * Get user count by role
 */
export async function getUserCountByRole() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role', { count: 'exact' });

    if (error) {
      throw error;
    }

    const counts = {
      admin: 0,
      teacher: 0,
      student: 0,
      total: data?.length || 0,
    };

    if (data) {
      data.forEach((item: any) => {
        if (item.role === 'admin') counts.admin++;
        else if (item.role === 'teacher') counts.teacher++;
        else if (item.role === 'student') counts.student++;
      });
    }

    return counts;
  } catch (error) {
    console.error('Error getting user counts:', error);
    return { admin: 0, teacher: 0, student: 0, total: 0 };
  }
}

/**
 * Check if current user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.is_super_admin || false;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Promote user to super admin
 */
export async function promoteToSuperAdmin(userId: string) {
  try {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_super_admin: true })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    console.log(`✅ User promoted to super admin`);
    return true;
  } catch (error) {
    console.error('Error promoting user:', error);
    throw error;
  }
}

/**
 * Reset user password (admin only)
 * Note: This calls a server-side API route for security
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const currentUserId = await getCurrentUserId();

    const response = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        newPassword,
        currentUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    console.log(`✅ Password reset for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}
