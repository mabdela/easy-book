import { NextRequest, NextResponse } from 'next/server';
import { resolveContacts } from '@/lib/resolveContacts';

export async function POST(req: NextRequest) {
  try {
    const { people } = await req.json();

    if (!people || !Array.isArray(people)) {
      return NextResponse.json(
        { error: 'People array is required' },
        { status: 400 }
      );
    }

    const result = await resolveContacts(people);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error resolving contacts:', error);
    return NextResponse.json(
      { error: 'Failed to resolve contacts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

