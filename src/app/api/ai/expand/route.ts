import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { expandThread } from '@/lib/ai/client';
import { rateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(user.id + ':ai', 20, 60000)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const { idea } = await request.json();
  if (!idea) return NextResponse.json({ error: 'No idea provided' }, { status: 400 });

  try {
    const blocks = await expandThread(idea);
    return NextResponse.json({ blocks });
  } catch {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
