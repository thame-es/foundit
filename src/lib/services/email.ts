import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { logger } from '@/lib/logger';
import { appConfig } from '@/lib/config';
import WelcomeEmailTemplate from '@/emails/WelcomeEmail';
import VerificationEmailTemplate from '@/emails/VerificationEmail';
import MessageNotificationEmailTemplate from '@/emails/MessageNotificationEmail';
import SearchAlertEmailTemplate from '@/emails/SearchAlertEmail';

// Create a transporter using environment variables.
// If using Gmail, SMTP_HOST="smtp.gmail.com", SMTP_PORT=465, SMTP_SECURE=true
// If using Resend, SMTP_HOST="smtp.resend.com", SMTP_PORT=465, SMTP_SECURE=true
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
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
 * Sends an email verification link to users.
 */
export async function sendVerificationEmail(to: string, displayName: string, verificationToken: string) {
  const subject = `Verify your email for ${appConfig.name}`;
  const verificationUrl = `${appConfig.url}/verify-email?token=${verificationToken}`;

  if (!process.env.SMTP_USER) {
    logger.warn('Skipping sendVerificationEmail: SMTP not configured');
    return;
  }
  
  const html = await render(
    VerificationEmailTemplate({
      displayName,
      verificationUrl,
      appUrl: appConfig.url,
    })
  );

  try {
    await transporter.sendMail({
      from: defaultFrom,
      to,
      subject,
      html,
    });
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send verification email', { to, error });
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

/**
 * Sends an email notification when a new item matches a saved search.
 */
export async function sendSearchAlertEmail(
  to: string, 
  displayName: string,
  searchName: string,
  itemTitle: string,
  itemUrl: string,
  itemLocation?: string
) {
  if (!process.env.SMTP_USER) {
    logger.warn('Skipping sendSearchAlertEmail: SMTP not configured');
    return;
  }

  const subject = `New Match: ${itemTitle}`;
  
  const html = await render(
    SearchAlertEmailTemplate({
      displayName,
      searchName,
      itemTitle,
      itemUrl,
      itemLocation,
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
    logger.info(`Search alert email sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send search alert email', { to, error });
  }
}

