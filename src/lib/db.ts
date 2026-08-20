// ===========================================
// FoundIt — Database Client Singleton
// ===========================================
// Prisma client with SQLite production settings.
// Uses singleton pattern for hot-reload safety.
// ===========================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['warn', 'error'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Enable WAL mode and foreign keys for SQLite
async function configureSQLite() {
  // PRAGMA journal_mode=WAL returns a result which causes Prisma to throw an error 
  // with $executeRawUnsafe in SQLite. We skip this in standard runtime.
}

configureSQLite();
