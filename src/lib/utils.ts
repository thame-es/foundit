// ===========================================
// FoundIt — Utility Functions
// ===========================================

import { createId } from '@paralleldrive/cuid2';
import slugify from 'slugify';

/**
 * Generate a CUID2 identifier
 */
export function generateId(): string {
  return createId();
}

/**
 * Create a URL-safe slug from a title + unique identifier
 */
export function createSlug(title: string): string {
  const slug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
  const shortId = createId().slice(0, 8);
  return `${slug}-${shortId}`;
}

/**
 * Calculate Haversine distance between two coordinates in km
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Approximate coordinates for privacy (±200m randomization)
 */
export function approximateCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  const offset = 0.002; // ~200m
  return {
    lat: lat + (Math.random() - 0.5) * offset,
    lng: lng + (Math.random() - 0.5) * offset,
  };
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Sanitize text — strip any HTML tags (basic XSS prevention for display)
 */
export function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Generate a cryptographically random token (hex string)
 */
export async function generateToken(length = 32): Promise<string> {
  const { randomBytes } = await import('crypto');
  return randomBytes(length).toString('hex');
}

/**
 * Check if a file magic bytes match allowed image types
 */
export function detectImageType(buffer: Buffer): string | null {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp';
  }
  return null;
}

/**
 * Get a consistent class name merger
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
