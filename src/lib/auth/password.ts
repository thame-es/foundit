// ===========================================
// FoundIt — Password Hashing
// ===========================================
// bcrypt with work factor 12.
// ===========================================

import bcrypt from 'bcryptjs';
import { appConfig } from '@/lib/config';

/**
 * Hash a plaintext password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, appConfig.auth.bcryptRounds);
}

/**
 * Verify a plaintext password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
