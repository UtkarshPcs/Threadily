import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import CryptoJS from 'crypto-js';
import { rateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Strict rate limit for PIN attempts
  if (!rateLimit(user.id + ':pin', 5, 300000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 5 minutes.' }, { status: 429 });
  }

  const { pin } = await request.json();
  if (!pin || pin.length < 4) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
  }

  const { data: profile } = await supabase.from('profiles').select('pin_hash').eq('id', user.id).single();

  if (!profile?.pin_hash) {
    // No PIN set, allow through
    return NextResponse.json({ verified: true });
  }

  const hash = CryptoJS.SHA256(pin).toString();
  if (hash !== profile.pin_hash) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
  }

  return NextResponse.json({ verified: true });
}

// Set PIN
export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pin } = await request.json();
  if (!pin || pin.length < 4 || pin.length > 6) {
    return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
  }

  const hash = CryptoJS.SHA256(pin).toString();
  await supabase.from('profiles').update({ pin_hash: hash }).eq('id', user.id);

  return NextResponse.json({ success: true });
}
