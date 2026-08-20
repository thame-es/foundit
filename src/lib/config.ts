// ===========================================
// FoundIt — Application Configuration
// ===========================================
// Centralized configuration. Change app name/branding here.
// ===========================================

export const appConfig = {
  // Brand
  name: process.env.APP_NAME || 'FoundIt',
  tagline: process.env.APP_TAGLINE || 'Lost something? Find your way back to it.',
  shortTagline: 'Lost. Found. Reconnected.',
  url: process.env.APP_URL || 'http://localhost:3000',

  // Feature Flags
  features: {
    paymentsEnabled: process.env.PAYMENTS_ENABLED === 'true',
    adsEnabled: process.env.ADS_ENABLED === 'true',
    emailEnabled: Boolean(process.env.SMTP_HOST),
  },

  // Payment
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'simulated',
    recoveryFee: parseFloat(process.env.PAYMENT_RECOVERY_FEE || '2.99'),
    currency: 'EUR',
  },

  // Upload Limits
  upload: {
    maxSizeMB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),
    maxFilesPerItem: parseInt(process.env.MAX_FILES_PER_ITEM || '6', 10),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
    directory: process.env.UPLOAD_DIRECTORY || '../data/uploads',
  },

  // Maps
  maps: {
    tileUrl: process.env.MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: process.env.MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    nominatimUrl: process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
    defaultCenter: [53.3498, -6.2603] as [number, number], // Dublin
    defaultZoom: 13,
  },

  // Auth
  auth: {
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10), // 7 days
    bcryptRounds: 12,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Listings
  listings: {
    expiryDays: parseInt(process.env.LISTING_EXPIRY_DAYS || '90', 10),
    expiryWarningDays: parseInt(process.env.LISTING_EXPIRY_WARNING_DAYS || '7', 10),
    itemsPerPage: 12,
    maxPlacesVisited: 10,
  },

  // Matching Engine Weights
  matching: {
    weights: {
      category: 25,
      locationProximity: 25,
      dateProximity: 20,
      brand: 10,
      colour: 10,
      textSimilarity: 10,
    },
    locationThresholdKm: 25,
    dateThresholdDays: 14,
  },

  // Rate Limiting (requests per window)
  rateLimit: {
    auth: { max: 10, windowMs: 15 * 60 * 1000 },       // 10 per 15 min
    upload: { max: 20, windowMs: 60 * 60 * 1000 },      // 20 per hour
    search: { max: 60, windowMs: 60 * 1000 },            // 60 per minute
    message: { max: 30, windowMs: 60 * 1000 },           // 30 per minute
    claim: { max: 10, windowMs: 60 * 60 * 1000 },       // 10 per hour
    contact: { max: 5, windowMs: 60 * 60 * 1000 },      // 5 per hour
    general: { max: 100, windowMs: 60 * 1000 },          // 100 per minute
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@example.com',
    secure: process.env.SMTP_SECURE === 'true',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

// Category definitions for seeding
export const defaultCategories = [
  { name: 'Keys', slug: 'keys', icon: 'key', description: 'House keys, car keys, office keys', order: 1 },
  { name: 'Wallets & Purses', slug: 'wallets-purses', icon: 'wallet', description: 'Wallets, purses, money clips', order: 2 },
  { name: 'Phones', slug: 'phones', icon: 'smartphone', description: 'Mobile phones, smartphones', order: 3 },
  { name: 'Computers & Tablets', slug: 'computers-tablets', icon: 'laptop', description: 'Laptops, tablets, e-readers', order: 4 },
  { name: 'Headphones & Earbuds', slug: 'headphones-earbuds', icon: 'headphones', description: 'Headphones, earbuds, audio devices', order: 5 },
  { name: 'Bags', slug: 'bags', icon: 'briefcase', description: 'Backpacks, handbags, luggage', order: 6 },
  { name: 'Watches', slug: 'watches', icon: 'watch', description: 'Watches, fitness trackers', order: 7 },
  { name: 'Jewellery', slug: 'jewellery', icon: 'gem', description: 'Rings, necklaces, bracelets, earrings', order: 8 },
  { name: 'Glasses', slug: 'glasses', icon: 'glasses', description: 'Prescription glasses, sunglasses', order: 9 },
  { name: 'Documents', slug: 'documents', icon: 'file-text', description: 'Papers, certificates, letters', order: 10 },
  { name: 'ID Cards', slug: 'id-cards', icon: 'credit-card', description: 'Identity cards, driving licences', order: 11, sensitive: true },
  { name: 'Bank Cards', slug: 'bank-cards', icon: 'credit-card', description: 'Debit cards, credit cards', order: 12, sensitive: true },
  { name: 'Passports', slug: 'passports', icon: 'book-open', description: 'Passports, travel documents', order: 13, sensitive: true },
  { name: 'Clothing', slug: 'clothing', icon: 'shirt', description: 'Jackets, scarves, hats, clothing items', order: 14 },
  { name: 'Bicycles', slug: 'bicycles', icon: 'bike', description: 'Bicycles, scooters', order: 15 },
  { name: 'Other Electronics', slug: 'other-electronics', icon: 'cpu', description: 'Cameras, chargers, cables, USB drives', order: 16 },
  { name: 'Pets', slug: 'pets', icon: 'paw-print', description: 'Lost or found pets', order: 17 },
  { name: 'Other', slug: 'other', icon: 'package', description: 'Items that don\'t fit other categories', order: 99 },
] as const;

// Claim states with allowed transitions
export const claimStates = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  MORE_INFO_REQUESTED: 'more_information_requested',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PAYMENT_PENDING: 'payment_pending',
  VERIFIED: 'verified',
  COLLECTION_ARRANGED: 'collection_arranged',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;

export type ClaimState = typeof claimStates[keyof typeof claimStates];

export const claimTransitions: Record<ClaimState, ClaimState[]> = {
  [claimStates.SUBMITTED]: [claimStates.UNDER_REVIEW, claimStates.REJECTED, claimStates.CANCELLED],
  [claimStates.UNDER_REVIEW]: [claimStates.ACCEPTED, claimStates.REJECTED, claimStates.MORE_INFO_REQUESTED, claimStates.DISPUTED],
  [claimStates.MORE_INFO_REQUESTED]: [claimStates.UNDER_REVIEW, claimStates.CANCELLED],
  [claimStates.ACCEPTED]: [claimStates.PAYMENT_PENDING, claimStates.VERIFIED, claimStates.DISPUTED],
  [claimStates.REJECTED]: [claimStates.DISPUTED],
  [claimStates.PAYMENT_PENDING]: [claimStates.VERIFIED, claimStates.CANCELLED],
  [claimStates.VERIFIED]: [claimStates.COLLECTION_ARRANGED],
  [claimStates.COLLECTION_ARRANGED]: [claimStates.RETURNED, claimStates.DISPUTED],
  [claimStates.RETURNED]: [],
  [claimStates.CANCELLED]: [],
  [claimStates.DISPUTED]: [claimStates.UNDER_REVIEW, claimStates.CANCELLED],
};

// Item statuses
export const lostItemStatuses = {
  ACTIVE: 'active',
  POSSIBLE_MATCH: 'possible_match',
  RECOVERED: 'recovered',
  EXPIRED: 'expired',
  HIDDEN: 'hidden',
} as const;

export const foundItemStatuses = {
  ACTIVE: 'active',
  CLAIM_PENDING: 'claim_pending',
  CLAIMED: 'claimed',
  RETURNED: 'returned',
  EXPIRED: 'expired',
  HIDDEN: 'hidden',
} as const;

// User roles
export const userRoles = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// User statuses
export const userStatuses = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DEACTIVATED: 'deactivated',
} as const;

// Report reasons
export const reportReasons = [
  { value: 'suspected_scam', label: 'Suspected scam' },
  { value: 'fake_listing', label: 'Fake listing' },
  { value: 'stolen_property', label: 'Stolen property concern' },
  { value: 'inappropriate_image', label: 'Inappropriate image' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'personal_info_exposed', label: 'Personal information exposed' },
  { value: 'duplicate_listing', label: 'Duplicate listing' },
  { value: 'prohibited_content', label: 'Prohibited content' },
  { value: 'other', label: 'Other' },
] as const;

// Sensitive categories that need special handling
export const sensitiveCategories = ['id-cards', 'bank-cards', 'passports'];

// Colours for item selection
export const itemColours = [
  'Black', 'White', 'Grey', 'Silver', 'Red', 'Blue', 'Green',
  'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gold',
  'Beige', 'Navy', 'Teal', 'Maroon', 'Multi-coloured', 'Other',
] as const;
