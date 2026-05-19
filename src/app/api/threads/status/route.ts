import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('threads_token')?.value;
  return NextResponse.json({ connected: !!token });
}
