import { Html, Link, Preview, Section, Text, Container, Heading } from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  displayName: string;
  verificationUrl: string;
  appUrl: string;
}

export default function VerificationEmail({
  displayName,
  verificationUrl,
  appUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Preview>Verify your email address for FindBack</Preview>
      <Container style={container}>
        <Heading style={h1}>Verify your email</Heading>
        
        <Text style={text}>Hi {displayName},</Text>
        <Text style={text}>
          Thank you for joining FindBack. Please verify your email address to unlock all features, 
          including earning a "Verified Email" badge on your profile.
        </Text>
        
        <Section style={buttonContainer}>
          <Link href={verificationUrl} style={button}>
            Verify Email Address
          </Link>
        </Section>
        
        <Text style={text}>
          If you did not request this, you can safely ignore this email. This link will expire in 24 hours.
        </Text>
        
        <Text style={footer}>
          &copy; {new Date().getFullYear()} FindBack. All rights reserved. <br/>
          <Link href={appUrl} style={footerLink}>{appUrl}</Link>
        </Text>
      </Container>
    </Html>
  );
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px',
};

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#2563eb', // blue-600
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 24px',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
};

const footerLink = {
  color: '#898989',
  textDecoration: 'underline',
};
