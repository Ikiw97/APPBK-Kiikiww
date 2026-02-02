import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface UpdateProfileResponse {
    success: boolean;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UpdateProfileResponse>
) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { userId, fullName, avatarUrl } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        // Build update object with only provided fields
        const updateData: Record<string, any> = {};

        if (fullName !== undefined) {
            updateData.full_name = fullName;
        }

        if (avatarUrl !== undefined) {
            updateData.avatar_url = avatarUrl;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }

        // Check if updating a student (ID starts with 'student_')
        if (userId.startsWith('student_')) {
            const studentId = userId.replace('student_', '');

            // Map generic profile fields to student table fields
            const studentUpdateData: Record<string, any> = {};
            if (updateData.full_name) studentUpdateData.nama = updateData.full_name;
            if (updateData.avatar_url) studentUpdateData.avatar_url = updateData.avatar_url;

            if (Object.keys(studentUpdateData).length > 0) {
                const { error } = await supabaseAdmin
                    .from('students')
                    .update(studentUpdateData)
                    .eq('id', studentId);

                if (error) {
                    console.error('Error updating student profile:', error);
                    return res.status(500).json({ success: false, error: error.message });
                }

                // Also update existing counseling sessions to show the new avatar
                if (updateData.avatar_url) {
                    await supabaseAdmin
                        .from('counseling_sessions')
                        .update({ student_avatar: updateData.avatar_url })
                        .eq('student_id', userId);
                }
            }
            return res.status(200).json({ success: true });
        }

        // Update user profile (regular users)
        const { error } = await supabaseAdmin
            .from('user_profiles')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error in update-profile:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
