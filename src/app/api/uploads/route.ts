import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { detectImageType } from '@/lib/utils';
import { processAndSaveImage } from '@/lib/services/storage';
import { appConfig } from '@/lib/config';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit('upload', session.userId, appConfig.rateLimit.upload.max, appConfig.rateLimit.upload.windowMs);
    
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // 3. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const isPublic = formData.get('isPublic') !== 'false'; // Default to true

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 4. Validate Size
    const maxSizeInBytes = appConfig.upload.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return NextResponse.json({ error: `File size exceeds ${appConfig.upload.maxSizeMB}MB limit` }, { status: 400 });
    }

    // 5. Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Magic Byte Validation (Security against malicious files spoofing extensions)
    const detectedType = detectImageType(buffer);
    if (!detectedType || !appConfig.upload.allowedMimeTypes.includes(detectedType as any)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    // 7. Process and Save
    const processed = await processAndSaveImage(buffer, file.name, detectedType);

    return NextResponse.json({
      success: true,
      file: {
        ...processed,
        isPublic,
      }
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
  }
}
