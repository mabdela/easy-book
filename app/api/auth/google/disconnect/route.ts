import { NextResponse } from 'next/server';
import { disconnect } from '@/lib/googleCalendar';

export async function POST() {
  try {
    await disconnect();
    return NextResponse.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}

