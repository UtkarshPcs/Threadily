import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { rewriteText, applyTone } from '@/lib/ai/client';
import { rateLimit } from '@/lib/security/rate-limit';
import { AITone } from '@/types';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(user.id + ':ai', 20, 60000)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  const { text, action, tone } = await request.json();
  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

  try {
    let result: string;
    if (tone) {
      result = await applyTone(text, tone as AITone);
    } else {
      result = await rewriteText(text, action || 'improve_clarity');
    }
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
