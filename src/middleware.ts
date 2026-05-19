import { NextResponse, type NextRequest } from 'next/server';
import { addSecurityHeaders } from '@/lib/security/headers';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
