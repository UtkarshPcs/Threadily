import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { saveDraft, getDrafts, deleteDraft } from '@/lib/supabase/queries';
import { rateLimit } from '@/lib/security/rate-limit';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const drafts = await getDrafts(user.id);
  return NextResponse.json(drafts);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(user.id, 30, 60000)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const body = await request.json();
  const draft = await saveDraft(user.id, body);
  return NextResponse.json(draft);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  await deleteDraft(id);
  return NextResponse.json({ success: true });
}
