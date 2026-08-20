// ===========================================
// FoundIt — Item Validation Schemas
// ===========================================

import { z } from 'zod';
import { defaultCategories, itemColours } from '@/lib/config';

// ─── Base Common Fields ────────────────────
const baseItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  publicDescription: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  brand: z.string().max(100).optional().nullable(),
  model: z.string().max(100).optional().nullable(),
  colour: z.enum([...itemColours, ''] as [string, ...string[]]).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  area: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

// ─── Lost Items ────────────────────────────
export const createLostItemSchema = baseItemSchema.extend({
  quantity: z.number().int().min(1).max(999).default(1),
  dateLost: z.string().or(z.date()), // Accepts ISO string or Date
  dateApproximate: z.boolean().default(false),
  timeLost: z.string().max(50).optional().nullable(),
  locationUncertain: z.boolean().default(false),
  distinguishingFeatures: z.string().max(500).optional().nullable(),
  rewardOffered: z.boolean().default(false),
  rewardDescription: z.string().max(200).optional().nullable(),
  contactPreference: z.enum(['in_app', 'email']).default('in_app'),
  images: z.array(z.any()).optional(),
});

export const updateLostItemSchema = createLostItemSchema.partial().extend({
  id: z.string(),
});

// ─── Found Items ───────────────────────────
export const createFoundItemSchema = baseItemSchema.extend({
  dateFound: z.string().or(z.date()),
  dateApproximate: z.boolean().default(false),
  timeFound: z.string().max(50).optional().nullable(),
  // Private verification detail is critical for the claim system
  privateVerificationDetail: z.string().min(5, 'Provide a detail only the owner would know').max(500),
  images: z.array(z.any()).optional(),
});

export const updateFoundItemSchema = createFoundItemSchema.partial().extend({
  id: z.string(),
});

export type CreateLostItemInput = z.infer<typeof createLostItemSchema>;
export type CreateFoundItemInput = z.infer<typeof createFoundItemSchema>;
export type UpdateLostItemInput = z.infer<typeof updateLostItemSchema>;
export type UpdateFoundItemInput = z.infer<typeof updateFoundItemSchema>;
