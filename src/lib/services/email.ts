import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';
import { appConfig } from '@/lib/config';

// Create a transporter using environment variables.
// If using Gmail, SMTP_HOST="smtp.gmail.com", SMTP_PORT=465, SMTP_SECURE=true
// If using Resend, SMTP_HOST="smtp.resend.com", SMTP_PORT=465, SMTP_SECURE=true
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const defaultFrom = `"${appConfig.name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

/**
 * Sends a welcome email to newly registered users.
 */
export async function sendWelcomeEmail(to: string, displayName: string) {
  if (!process.env.SMTP_USER) {
    logger.warn('Skipping sendWelcomeEmail: SMTP not configured');
    return;
  }

  const subject = `Welcome to ${appConfig.name}!`;
  
  const html = `
    <div style="font-family: sans-serif; max-w-lg; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Welcome to ${appConfig.name}, ${displayName}! 🎉</h2>
      <p>We are thrilled to have you join our community.</p>
      <p>Whether you're here to help someone find what they lost, or you're looking for something yourself, you're in the right place.</p>
      <br />
      <p><strong>Next steps:</strong></p>
      <ul>
        <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings">Complete your profile</a></li>
        <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/search">Browse recent items</a></li>
      </ul>
      <br />
      <p>Thanks,</p>
      <p>The ${appConfig.name} Team</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: defaultFrom,
      to,
      subject,
      html,
    });
    logger.info(`Welcome email sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send welcome email', { to, error });
  }
}

/**
 * Sends an email notification when a user receives a new message.
 */
export async function sendNewMessageNotification(
  to: string, 
  senderName: string, 
  itemTitle: string, 
  messageSnippet: string
) {
  if (!process.env.SMTP_USER) {
    logger.warn('Skipping sendNewMessageNotification: SMTP not configured');
    return;
  }

  const subject = `New Message from ${senderName} regarding ${itemTitle}`;
  
  const html = `
    <div style="font-family: sans-serif; max-w-lg; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">You have a new message! 📩</h2>
      <p><strong>${senderName}</strong> sent you a message about <strong>"${itemTitle}"</strong>.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; font-style: italic;">
        "${messageSnippet.length > 100 ? messageSnippet.substring(0, 100) + '...' : messageSnippet}"
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Reply to Message
      </a>
      
      <br /><br />
      <p style="font-size: 12px; color: #6b7280;">
        You are receiving this because you have notifications enabled for ${appConfig.name}.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: defaultFrom,
      to,
      subject,
      html,
    });
    logger.info(`Message notification email sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send message notification email', { to, error });
  }
}
