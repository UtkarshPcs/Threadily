import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateHooks } from '@/lib/ai/client';
import { rateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(user.id + ':ai', 20, 60000)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const { topic } = await request.json();
  if (!topic) return NextResponse.json({ error: 'No topic provided' }, { status: 400 });

  try {
    const hooks = await generateHooks(topic);
    return NextResponse.json({ hooks });
  } catch {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
