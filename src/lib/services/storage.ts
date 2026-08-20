import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { appConfig } from '@/lib/config';

// Define expected structure of sharp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharp: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  sharp = require('sharp');
} catch {
  console.warn('Sharp is not installed, image processing will fallback or fail depending on usage.');
}

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
 * Ensures the upload directories exist
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
  const baseDir = await ensureDirectories();
  
  // Generate a unique filename using crypto random bytes
  const ext = path.extname(originalName) || (mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg');
  const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const originalPath = path.join('original', filename);
  
  // If sharp is not available, just save the original file
  if (!sharp) {
    await fs.writeFile(path.join(baseDir, originalPath), fileBuffer);
    return {
      filename,
      originalName,
      mimeType,
      size: fileBuffer.length,
    };
  }

  // Get image metadata
  const metadata = await sharp(fileBuffer).metadata();
  
  // 1. Strip EXIF and save original
  await sharp(fileBuffer)
    .withMetadata(false) // Strip EXIF data for privacy
    .toFile(path.join(baseDir, originalPath));

  // 2. Generate medium version (max 1024x1024)
  const mediumFilename = `md_${filename}`;
  const mediumPath = path.join('medium', mediumFilename);
  await sharp(fileBuffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .withMetadata(false)
    .toFormat(ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg', { quality: 80 })
    .toFile(path.join(baseDir, mediumPath));

  // 3. Generate thumbnail version (max 300x300, cropped square)
  const thumbFilename = `th_${filename}`;
  const thumbPath = path.join('thumbnail', thumbFilename);
  await sharp(fileBuffer)
    .resize(300, 300, { fit: 'cover', position: 'centre' })
    .withMetadata(false)
    .toFormat(ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg', { quality: 70 })
    .toFile(path.join(baseDir, thumbPath));

  return {
    filename,
    originalName,
    mimeType,
    size: fileBuffer.length,
    width: metadata.width,
    height: metadata.height,
    mediumPath: mediumPath.replace(/\\/g, '/'),
    thumbnailPath: thumbPath.replace(/\\/g, '/'),
  };
}
