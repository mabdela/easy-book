import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/googleCalendar';

export async function GET() {
  try {
    const connected = await isAuthenticated();
    return NextResponse.json({ connected });
  } catch (error) {
    return NextResponse.json({ connected: false });
  }
}

