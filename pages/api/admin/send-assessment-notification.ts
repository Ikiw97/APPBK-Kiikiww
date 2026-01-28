import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail, generateAssessmentNotificationEmail } from '@/lib/emailService';
import { getFeatureSettings } from '@/lib/featureSettings';

type ResponseData = {
    success: boolean;
    message?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Check if email notifications are enabled
        const settings = await getFeatureSettings();
        if (!settings.system.emailNotifications) {
            return res.status(200).json({
                success: true,
                message: 'Email notifications are disabled'
            });
        }

        const { studentName, assessmentTitle, className } = req.body;

        if (!studentName || !assessmentTitle || !className) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Get admin email: prioritize settings, then env vars
        const adminEmail = settings.system.adminEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        const schoolName = settings.system.schoolName || 'Sistem BK Sekolah';

        if (!adminEmail) {
            console.error('❌ ADMIN_EMAIL not configured');
            return res.status(500).json({
                success: false,
                error: 'Admin email not configured'
            });
        }

        // Generate email content
        const emailHtml = generateAssessmentNotificationEmail(
            studentName,
            assessmentTitle,
            className,
            schoolName
        );

        // Send email
        const result = await sendEmail({
            to: adminEmail,
            subject: `📋 Asesmen Baru: ${assessmentTitle} - ${studentName} (${schoolName})`,
            html: emailHtml,
        });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Email sent successfully'
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Failed to send email'
            });
        }
    } catch (error) {
        console.error('❌ Error in send-assessment-notification:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
