import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ThreadsClient } from '@/lib/threads/client';
import { updateProfile, logActivity } from '@/lib/supabase/queries';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    // Redirect to Threads OAuth
    return NextResponse.redirect(ThreadsClient.getAuthUrl());
  }

  // Exchange code for token
  try {
    const { accessToken, expiresIn } = await ThreadsClient.exchangeCode(code);
    const encryptedToken = ThreadsClient.encryptToken(accessToken);

    // Get Threads user info
    const client = new ThreadsClient(encryptedToken);
    const profile = await client.getUserProfile();

    // Store encrypted token
    await updateProfile(user.id, {
      threads_connected: true,
      threads_user_id: profile.id,
      encrypted_access_token: encryptedToken,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });

    await logActivity(user.id, 'threads_connected', { threads_username: profile.username });

    return NextResponse.redirect(new URL('/?connected=true', request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/?error=threads_auth_failed', request.url));
  }
}
