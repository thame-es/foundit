import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { appConfig } from '@/lib/config';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { supabaseStorage } from '@/lib/services/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathParts = resolvedParams.path;
    if (!pathParts || pathParts.length < 2) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    const [type, filename] = pathParts; // e.g. ["thumbnail", "123.jpg"] or ["original", "123.jpg"]

    // Prevent directory traversal
    if (filename.includes('/') || filename.includes('..') || type.includes('/') || type.includes('..')) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    // 1. Verify access rights from Database
    const imageRecord = await db.itemImage.findFirst({
      where: {
        filename: filename.replace(/^(md_|th_)/, '') // Strip prefix if exists
      },
      select: {
        isPublic: true,
        lostItemId: true,
        foundItemId: true,
      }
    });

    if (!imageRecord) {
      return new NextResponse('Not found', { status: 404 });
    }

    // 2. Auth check for private images
    if (!imageRecord.isPublic) {
      const session = await getSession();
      if (!session.userId) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // We need to fetch the item owner to verify access
      let isOwner = session.role === 'admin';
      
      if (!isOwner && imageRecord.lostItemId) {
        const item = await db.lostItem.findUnique({ where: { id: imageRecord.lostItemId }, select: { userId: true }});
        if (item?.userId === session.userId) isOwner = true;
      }
      
      if (!isOwner && imageRecord.foundItemId) {
        const item = await db.foundItem.findUnique({ where: { id: imageRecord.foundItemId }, select: { userId: true }});
        if (item?.userId === session.userId) isOwner = true;
      }

      if (!isOwner) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // 3. Serve the file
    // 3a. Supabase Redirect
    if (supabaseStorage) {
      const filePathInBucket = `${type}/${filename}`;
      if (imageRecord.isPublic) {
        const { data } = supabaseStorage.storage
          .from(appConfig.supabase.storageBucket)
          .getPublicUrl(filePathInBucket);
        return NextResponse.redirect(data.publicUrl);
      } else {
        const { data, error } = await supabaseStorage.storage
          .from(appConfig.supabase.storageBucket)
          .createSignedUrl(filePathInBucket, 3600); // 1 hour expiry
        
        if (error || !data) {
          console.error('Signed URL Error:', error);
          return new NextResponse('Failed to generate secure URL', { status: 500 });
        }
        return NextResponse.redirect(data.signedUrl);
      }
    }

    // 3b. Local File System Fallback
    const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), appConfig.upload.directory, type, filename);
    
    try {
      let fileBuffer: Buffer;
      try {
        fileBuffer = await fs.readFile(filePath);
      } catch (err) {
        // Fallback: If thumbnail/medium doesn't exist (e.g. sharp wasn't installed during upload), serve the original
        if (type !== 'original') {
          const fallbackPath = path.join(/*turbopackIgnore: true*/ process.cwd(), appConfig.upload.directory, 'original', filename);
          fileBuffer = await fs.readFile(fallbackPath);
        } else {
          throw err;
        }
      }
      
      // Determine content type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';

      const response = new NextResponse(fileBuffer as any);
      response.headers.set('Content-Type', contentType);
      // Cache public images heavily, private images require re-validation
      if (imageRecord.isPublic) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      }
      
      return response;
    } catch {
      return new NextResponse('File not found on disk', { status: 404 });
    }

  } catch (error) {
    console.error('File serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
