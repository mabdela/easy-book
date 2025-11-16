import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveContacts } from '@/lib/resolveContacts';
import { generateSlots } from '@/lib/generateSlots';
import { createGoogleEvent } from '@/lib/googleCalendar';
import type { BookingRequestPayload, BookingResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: BookingRequestPayload = await req.json();
    const { parsedCommand, contacts } = body;

    // Resolve any remaining unknown contacts
    const unknownPeople = contacts.filter((c) => !c.email).map((c) => c.name);
    if (unknownPeople.length > 0) {
      const resolution = await resolveContacts(unknownPeople);
      // Merge with provided contacts
      contacts.push(...resolution.resolved);
    }

    // Generate slots
    const slots = generateSlots(parsedCommand);

    // Create booking request
    const bookingRequest = await db.bookingRequest.create({
      data: {
        rawCommand: '',
        parsedJson: JSON.stringify(parsedCommand),
      },
    });

    // Create meetings and Google Calendar events
    const meetings = [];
    const attendeeNames = contacts.map((c) => c.name).join(' and ');
    
    for (const slot of slots) {
      // Create meeting in database
      const meeting = await db.meeting.create({
        data: {
          bookingRequestId: bookingRequest.id,
          start: slot.start,
          end: slot.end,
          title: `Meeting with ${attendeeNames}`,
          attendees: JSON.stringify(contacts),
        },
      });

      // Create Google Calendar event
      try {
        const googleEvent = await createGoogleEvent(
          slot.start,
          slot.end,
          contacts,
          meeting.title
        );

        // Update meeting with Google event ID
        await db.meeting.update({
          where: { id: meeting.id },
          data: { googleEventId: googleEvent.id },
        });

        meetings.push({
          id: meeting.id,
          start: meeting.start,
          end: meeting.end,
          title: meeting.title,
          googleEventId: googleEvent.id,
          googleEventLink: googleEvent.htmlLink,
        });
      } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        // Continue even if Google Calendar fails
        meetings.push({
          id: meeting.id,
          start: meeting.start,
          end: meeting.end,
          title: meeting.title,
        });
      }
    }

    const result: BookingResult = {
      bookingRequestId: bookingRequest.id,
      meetingCount: meetings.length,
      meetings,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error booking meetings:', error);
    return NextResponse.json(
      { error: 'Failed to book meetings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

