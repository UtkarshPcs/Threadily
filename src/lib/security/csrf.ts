import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const CSRF_SECRET = process.env.JWT_SECRET || 'csrf-secret';

export function generateCSRFToken(sessionId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${sessionId}:${timestamp}`;
  const signature = CryptoJS.HmacSHA256(payload, CSRF_SECRET).toString();
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function validateCSRFToken(token: string, sessionId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [storedSessionId, timestamp, signature] = decoded.split(':');

    if (storedSessionId !== sessionId) return false;

    // Token expires after 1 hour
    if (Date.now() - parseInt(timestamp) > 3600000) return false;

    const expectedSignature = CryptoJS.HmacSHA256(`${storedSessionId}:${timestamp}`, CSRF_SECRET).toString();
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export function csrfProtection(request: NextRequest, sessionId: string): NextResponse | null {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const token = request.headers.get('x-csrf-token');
    if (!token || !validateCSRFToken(token, sessionId)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
  }
  return null;
}
