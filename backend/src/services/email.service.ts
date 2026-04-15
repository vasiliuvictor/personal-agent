import { Resend } from 'resend';
import { Source } from '../types';

const resend = new Resend(process.env['RESEND_API_KEY']!);

export async function sendInsightEmail(
  toEmail: string,
  agentName: string,
  summary: string,
  sources: Source[]
): Promise<void> {
  const sourceLinks = sources
    .map(s => `<li><a href="${s.url}" style="color:#264653;">${s.title}</a></li>`)
    .join('');

  const htmlSummary = summary
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#264653;">$1</a>')
    .replace(/\n/g, '<br>');

  const { error } = await resend.emails.send({
    from: 'AgentScout <vasiliu@agent-scout.org>',
    to: toEmail,
    subject: `Scout: ${agentName} returned new insight`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1D2D35;">
  <div style="background: #264653; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">AgentScout</h1>
    <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">New insight from: <strong>${agentName}</strong></p>
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

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
