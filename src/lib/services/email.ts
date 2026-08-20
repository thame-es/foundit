import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { logger } from '@/lib/logger';
import { appConfig } from '@/lib/config';
import WelcomeEmailTemplate from '@/emails/WelcomeEmail';
import MessageNotificationEmailTemplate from '@/emails/MessageNotificationEmail';

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
  
  const html = await render(
    WelcomeEmailTemplate({
      displayName,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    })
  );

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
  
  const html = await render(
    MessageNotificationEmailTemplate({
      senderName,
      itemTitle,
      messageSnippet,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    })
  );

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
