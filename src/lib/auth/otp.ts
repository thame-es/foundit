import crypto from 'crypto';

// Generate a random 6-digit string securely
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Hash OTP with HMAC using the secret key from environment
export function hashOtp(otp: string): string {
  const secret = process.env.OTP_HMAC_SECRET;
  if (!secret) throw new Error('OTP_HMAC_SECRET is not configured');
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}
