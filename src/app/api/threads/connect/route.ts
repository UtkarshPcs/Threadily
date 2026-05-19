import { NextRequest, NextResponse } from 'next/server';
import { ThreadsClient } from '@/lib/threads/client';
import { encrypt } from '@/lib/security/encryption';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    // Redirect to Threads OAuth
    return NextResponse.redirect(ThreadsClient.getAuthUrl());
  }

  // Exchange code for token
  try {
    const { accessToken, expiresIn } = await ThreadsClient.exchangeCode(code);
    const encryptedToken = encrypt(accessToken);

    // Store token in HTTP-only cookie
    const response = NextResponse.redirect(new URL('/?connected=true', request.url));
    response.cookies.set('threads_token', encryptedToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Threads auth error:', error);
    return NextResponse.redirect(new URL('/?error=threads_auth_failed', request.url));
  }
}
