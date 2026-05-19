import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Meta sends this when a user deauthorizes the app
  const body = await request.json();
  console.log('Threads app uninstalled:', body);
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
