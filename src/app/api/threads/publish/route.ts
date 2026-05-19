import { NextRequest, NextResponse } from 'next/server';
import { ThreadsClient } from '@/lib/threads/client';
import { rateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('threads_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Threads not connected. Go to Settings to connect your account.' }, { status: 401 });
  }

  if (!rateLimit('publish', 5, 60000)) {
    return NextResponse.json({ error: 'Rate limited. Max 5 publishes per minute.' }, { status: 429 });
  }

  const { blocks } = await request.json();

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return NextResponse.json({ error: 'No blocks to publish' }, { status: 400 });
  }

  try {
    const client = new ThreadsClient(token);
    const postIds = await client.publishThread(blocks);
    return NextResponse.json({ success: true, postIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Publishing failed' }, { status: 500 });
  }
}
