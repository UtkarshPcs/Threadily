import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function logApiActivity(request: NextRequest, action: string, metadata?: Record<string, unknown>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      metadata,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });
  } catch {
    // Don't fail the request if logging fails
  }
}

export function detectSuspiciousActivity(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') || '';
  // Flag requests with no user agent or known bot patterns
  if (!ua || ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
    return true;
  }
  return false;
}
