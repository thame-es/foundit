import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Link } from '@react-email/components';

interface PasswordChangedEmailProps {
  displayName: string;
  appUrl: string;
}

export const PasswordChangedEmail = ({ displayName, appUrl }: PasswordChangedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your FoundIt password was changed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Password Changed</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {displayName},</Text>
            <Text style={text}>
              This is a confirmation that your FoundIt password was successfully changed just now.
            </Text>
            <Text style={text}>
              For your security, we have automatically signed out all other devices and sessions associated with your account.
            </Text>

            <Text style={subtext}>
              If you didn&apos;t make this change, please request a password reset immediately using the &quot;Forgot Password&quot; link on the login page or contact support if you need assistance.
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
  backgroundColor: '#22c55e', // Green for success
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

export default PasswordChangedEmail;
