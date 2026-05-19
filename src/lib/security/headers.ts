import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Clickjacking protection
  response.headers.set('X-Frame-Options', 'DENY');
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Content Security Policy
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://graph.threads.net",
    "frame-ancestors 'none'",
  ].join('; '));

  return response;
}
