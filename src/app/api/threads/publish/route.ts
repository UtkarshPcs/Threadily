import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ThreadsClient } from '@/lib/threads/client';
import { getProfile, logActivity } from '@/lib/supabase/queries';
import { rateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(user.id, 5, 60000)) {
    return NextResponse.json({ error: 'Rate limited. Max 5 publishes per minute.' }, { status: 429 });
  }

  const profile = await getProfile(user.id);
  if (!profile.threads_connected || !profile.encrypted_access_token) {
    return NextResponse.json({ error: 'Threads account not connected' }, { status: 400 });
  }

  // Check token expiry
  if (profile.token_expires_at && new Date(profile.token_expires_at) < new Date()) {
    try {
      const { accessToken, expiresIn } = await ThreadsClient.refreshToken(profile.encrypted_access_token);
      const newEncrypted = ThreadsClient.encryptToken(accessToken);
      await supabase.from('profiles').update({
        encrypted_access_token: newEncrypted,
        token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      }).eq('id', user.id);
      profile.encrypted_access_token = newEncrypted;
    } catch {
      return NextResponse.json({ error: 'Token expired. Please reconnect Threads.' }, { status: 401 });
    }
  }

  const { blocks, draftId } = await request.json();

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return NextResponse.json({ error: 'No blocks to publish' }, { status: 400 });
  }

  try {
    const client = new ThreadsClient(profile.encrypted_access_token);
    const postIds = await client.publishThread(blocks);

    // Update draft status
    if (draftId) {
      await supabase.from('drafts').update({
        status: 'published',
        published_at: new Date().toISOString(),
      }).eq('id', draftId);
    }

    await logActivity(user.id, 'thread_published', { postIds, blockCount: blocks.length });

    return NextResponse.json({ success: true, postIds });
  } catch (error: any) {
    await logActivity(user.id, 'publish_failed', { error: error.message });

    // Mark as failed
    if (draftId) {
      await supabase.from('drafts').update({ status: 'failed' }).eq('id', draftId);
    }

    return NextResponse.json({ error: error.message || 'Publishing failed' }, { status: 500 });
  }
}
