import nodemailer from 'nodemailer';
import { Source } from '../types';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env['GMAIL_USER']!,
    pass: process.env['GMAIL_APP_PASSWORD']!,
  },
});

export async function sendInsightEmail(
  toEmail: string,
  agentName: string,
  summary: string,
  sources: Source[]
): Promise<void> {
  const sourceLinks = sources
    .map(s => `<li><a href="${s.url}" style="color:#4f46e5;">${s.title}</a></li>`)
    .join('');

  // Convert markdown bold/italic to HTML for email display
  const htmlSummary = summary
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#4f46e5;">$1</a>')
    .replace(/\n/g, '<br>');

  await transporter.sendMail({
    from: `"AgentScout" <${process.env['GMAIL_USER']}>`,
    to: toEmail,
    subject: `AgentScout Insight: ${agentName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
  <div style="background: #4f46e5; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">AgentScout</h1>
    <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">New insight for: <strong>${agentName}</strong></p>
  </div>
  <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="font-size: 16px; color: #374151; margin-top: 0;">Summary</h2>
    <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; line-height: 1.6;">
      ${htmlSummary}
    </div>
    <h2 style="font-size: 16px; color: #374151;">Sources</h2>
    <ul style="background: white; padding: 16px 16px 16px 32px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 0;">
      ${sourceLinks}
    </ul>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 16px; text-align: center;">
      You are receiving this because you enabled email notifications for the "${agentName}" agent in AgentScout.
    </p>
  </div>
</body>
</html>`,
  });
}
