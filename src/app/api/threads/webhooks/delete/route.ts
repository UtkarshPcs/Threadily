import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Meta sends this when a user requests data deletion
  const body = await request.json();
  console.log('Data deletion requested:', body);
  // Return confirmation URL as required by Meta
  return NextResponse.json({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/deletion-status`,
    confirmation_code: crypto.randomUUID(),
  });
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
