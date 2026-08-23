import { Html, Preview, Section, Text, Container, Heading } from '@react-email/components';
import * as React from 'react';

interface OtpVerificationEmailProps {
  displayName: string;
  otp: string;
  appUrl: string;
  expiryMinutes: number;
}

export default function OtpVerificationEmail({
  displayName,
  otp,
  appUrl,
  expiryMinutes,
}: OtpVerificationEmailProps) {
  return (
    <Html>
      <Preview>Your FoundIt verification code</Preview>
      <Container style={container}>
        <Heading style={h1}>Verify your email</Heading>
        
        <Text style={text}>Hi {displayName},</Text>
        <Text style={text}>
          Please enter the following 6-digit code to verify your email address. This code will expire in {expiryMinutes} minutes.
        </Text>
        
        <Section style={otpContainer}>
          <Text style={otpText}>{otp}</Text>
        </Section>
        
        <Text style={warningText}>
          <strong>Security Warning:</strong> FoundIt will never ask you to share this code. 
          If you did not attempt to register an account, you can safely ignore this email.
        </Text>
        
        <Text style={footer}>
          &copy; {new Date().getFullYear()} FoundIt. All rights reserved. <br/>
          <a href={appUrl} style={footerLink}>{appUrl}</a>
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
  lineHeight: '24px',
  margin: '0 0 24px',
};

const warningText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '24px 0',
  padding: '12px',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px',
  borderLeft: '4px solid #f59e0b'
};

const otpContainer = {
  background: '#f1f5f9',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '32px 0',
};

const otpText = {
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '8px',
  color: '#0f172a',
  margin: '0',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '48px',
};

const footerLink = {
  color: '#898989',
  textDecoration: 'underline',
};
