import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Link } from '@react-email/components';

interface PasswordResetEmailProps {
  displayName: string;
  resetUrl: string;
  appUrl: string;
}

export const PasswordResetEmail = ({ displayName, resetUrl, appUrl }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for FoundIt</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Password Reset</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {displayName},</Text>
            <Text style={text}>
              We received a request to reset the password for your FoundIt account. If you didn&apos;t make this request, you can safely ignore this email.
            </Text>
            <Text style={text}>
              To set a new password, click the button below. This link will expire in 1 hour for your security.
            </Text>

            <Section style={buttonContainer}>
              <Button href={resetUrl} style={button}>
                Reset Password
              </Button>
            </Section>

            <Text style={text}>
              If you don&apos;t want to change your password or didn&apos;t request this, just ignore and delete this message.
            </Text>
            <Text style={subtext}>
              To keep your account secure, please don&apos;t forward this email to anyone.
              This link will expire in 1 hour.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} FoundIt. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href={appUrl} style={footerLink}>
                {appUrl}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#2563eb',
  padding: '32px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0',
};

const content = {
  padding: '32px',
};

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const subtext = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0 0',
  paddingTop: '24px',
  borderTop: '1px solid #e2e8f0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  backgroundColor: '#f1f5f9',
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px 0',
};

const footerLink = {
  color: '#2563eb',
  textDecoration: 'none',
};

export default PasswordResetEmail;
