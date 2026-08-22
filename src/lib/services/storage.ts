import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { appConfig } from '@/lib/config';
import { createClient } from '@supabase/supabase-js';

// Define expected structure of sharp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharp: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  sharp = require('sharp');
} catch {
  console.warn('Sharp is not installed, image processing will fallback or fail depending on usage.');
}

export const supabaseStorage = appConfig.supabase.url && appConfig.supabase.serviceRoleKey
  ? createClient(appConfig.supabase.url, appConfig.supabase.serviceRoleKey)
  : null;

export interface ProcessedImage {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  thumbnailPath?: string;
  mediumPath?: string;
}

/**
 * Ensures the upload directories exist for local fallback
 */
async function ensureDirectories() {
  const baseDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), appConfig.upload.directory);
  const dirs = [
    baseDir,
    path.join(baseDir, 'original'),
    path.join(baseDir, 'medium'),
    path.join(baseDir, 'thumbnail'),
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
  return baseDir;
}

/**
 * Process and save an uploaded image
 */
export async function processAndSaveImage(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<ProcessedImage> {
  // Generate a unique filename using crypto random bytes
  const ext = path.extname(originalName) || (mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg');
  const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const originalPath = `original/${filename}`;
  const mediumFilename = `md_${filename}`;
  const mediumPath = `medium/${mediumFilename}`;
  const thumbFilename = `th_${filename}`;
  const thumbPath = `thumbnail/${thumbFilename}`;

  // ==========================================
  // SUPABASE STORAGE LOGIC
  // ==========================================
  if (supabaseStorage) {
    if (!sharp) {
      const { error } = await supabaseStorage.storage
        .from(appConfig.supabase.storageBucket)
        .upload(originalPath, fileBuffer, { contentType: mimeType });
      
      if (error) throw error;
      
      return {
        filename,
        originalName,
        mimeType,
        size: fileBuffer.length,
      };
    }

    const formatExt = ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg';
    const formatMime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const [originalBuf, mediumBuf, thumbBuf] = await Promise.all([
      sharp(fileBuffer).withMetadata(false).toBuffer(),
      sharp(fileBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .withMetadata(false)
        .toFormat(formatExt, { quality: 80 })
        .toBuffer(),
      sharp(fileBuffer)
        .resize(300, 300, { fit: 'cover', position: 'centre' })
        .withMetadata(false)
        .toFormat(formatExt, { quality: 70 })
        .toBuffer()
    ]);

    const uploads = await Promise.all([
      supabaseStorage.storage.from(appConfig.supabase.storageBucket).upload(originalPath, originalBuf, { contentType: mimeType }),
      supabaseStorage.storage.from(appConfig.supabase.storageBucket).upload(mediumPath, mediumBuf, { contentType: formatMime }),
      supabaseStorage.storage.from(appConfig.supabase.storageBucket).upload(thumbPath, thumbBuf, { contentType: formatMime }),
    ]);
    
    for (const res of uploads) {
      if (res.error) throw res.error;
    }

    const metadata = await sharp(fileBuffer).metadata();
    return {
      filename,
      originalName,
      mimeType,
      size: originalBuf.length,
      width: metadata.width,
      height: metadata.height,
      mediumPath: mediumFilename,
      thumbnailPath: thumbFilename,
    };
  }

  // ==========================================
  // LOCAL FILE SYSTEM FALLBACK
  // ==========================================
  const baseDir = await ensureDirectories();
  
  if (!sharp) {
    await fs.writeFile(path.join(baseDir, originalPath), fileBuffer);
    return {
      filename,
      originalName,
      mimeType,
      size: fileBuffer.length,
    };
  }

  // 1. Strip EXIF and save original
  await sharp(fileBuffer)
    .withMetadata(false)
    .toFile(path.join(baseDir, originalPath));

  // 2. Generate medium version
  await sharp(fileBuffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .withMetadata(false)
    .toFormat(ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg', { quality: 80 })
    .toFile(path.join(baseDir, mediumPath));

  // 3. Generate thumbnail version
  await sharp(fileBuffer)
    .resize(300, 300, { fit: 'cover', position: 'centre' })
    .withMetadata(false)
    .toFormat(ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg', { quality: 70 })
    .toFile(path.join(baseDir, thumbPath));

  const metadata = await sharp(fileBuffer).metadata();
  return {
    filename,
    originalName,
    mimeType,
    size: (await fs.stat(path.join(baseDir, originalPath))).size,
    width: metadata.width,
    height: metadata.height,
    mediumPath: mediumFilename,
    thumbnailPath: thumbFilename,
  };
}
