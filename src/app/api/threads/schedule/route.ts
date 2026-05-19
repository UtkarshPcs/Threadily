import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(user.id, 10, 60000)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const { draftId, scheduledAt } = await request.json();

  if (!draftId || !scheduledAt) {
    return NextResponse.json({ error: 'Missing draftId or scheduledAt' }, { status: 400 });
  }

  if (new Date(scheduledAt) < new Date()) {
    return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 });
  }

  const { error } = await supabase.from('scheduled_posts').insert({
    draft_id: draftId,
    user_id: user.id,
    scheduled_at: scheduledAt,
    status: 'pending',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('drafts').update({ status: 'scheduled', scheduled_at: scheduledAt }).eq('id', draftId);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('scheduled_posts')
    .select('*, drafts(*)')
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: true });

  return NextResponse.json(data || []);
}
