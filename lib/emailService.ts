import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const senderName = process.env.EMAIL_FROM_NAME || 'Sistem BK';
    const info = await transporter.sendMail({
      from: `"${senderName}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
}

export function generateAssessmentNotificationEmail(
  studentName: string,
  assessmentTitle: string,
  className: string,
  schoolName?: string
): string {
  const displaySchool = schoolName || 'Sistem BK Sekolah';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Notifikasi Asesmen Baru</h1>
        </div>
        <div class="content">
          <p>Halo,</p>
          <p>Seorang siswa telah menyelesaikan asesmen. Berikut detailnya:</p>
          
          <div class="info-box">
            <p><strong>👤 Nama Siswa:</strong> ${studentName}</p>
            <p><strong>📚 Kelas:</strong> ${className}</p>
            <p><strong>📝 Asesmen:</strong> ${assessmentTitle}</p>
            <p><strong>🕐 Waktu:</strong> ${new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  })}</p>
          </div>
          
          <p>Silakan login ke sistem untuk melihat hasil lengkap asesmen.</p>
          
          <p style="margin-top: 30px;">Terima kasih,<br><strong>${displaySchool}</strong></p>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis oleh sistem ${displaySchool}. Mohon tidak membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
