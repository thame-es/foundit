import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const session = await getSession();
  
  // Destroy the session
  session.destroy();

  // Redirect to the homepage after logout
  return NextResponse.redirect(new URL('/', request.url));
}
