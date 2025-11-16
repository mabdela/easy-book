import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ParsedCommand } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getSystemPrompt(): string {
  // Get today's date in multiple formats for the LLM
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const todayReadable = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `You are a command parser that extracts structured information from natural language booking requests.

CRITICAL: Today's date is ${todayReadable} (${todayISO}). Use this as the reference point for all relative date calculations.

Extract the following information:
- people: Array of person names mentioned
- daysOfWeek: Array of day abbreviations ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
- timeRange: Object with "start" and "end" in 24-hour format "HH:MM"
- dateRange: Object with "start" and "end" in "YYYY-MM-DD" format
- timezone: IANA timezone (e.g., "America/Toronto")

IMPORTANT - Time Range Examples (CRITICAL):
- "from 10 to 12" or "10 to 12" or "10am to 12pm" → {"start": "10:00", "end": "12:00"}
- "from 9 to 11" or "9am-11am" → {"start": "09:00", "end": "11:00"}
- "from 2pm to 5pm" or "2 to 5" → {"start": "14:00", "end": "17:00"}
- "at 10" or "at 10am" or "at 10:00" → {"start": "10:00", "end": "11:00"} (MUST be 1-hour slot, NOT 10:00-17:00)
- "9am" or "9:00" → {"start": "09:00", "end": "10:00"} (MUST be 1-hour slot)
- If only a SINGLE time is specified (e.g., "at 10am", "10am"), the end time MUST be start time + 1 hour
- NEVER use the default 9:00-17:00 range when a specific time is mentioned

IMPORTANT - Date Range Examples (USE TODAY'S DATE: ${todayISO}):
- "next week" → calculate next 7 days starting from ${todayISO}
- "this week" → current week (Monday to Sunday) containing ${todayISO}
- "next month" → first day to last day of next month
- "December" → December 1 to December 31 of current/next year
- "December 2025" → December 1, 2025 to December 31, 2025
- "from December 1 to December 10" → 2025-12-01 to 2025-12-10
- "next 10 days" → ${todayISO} to ${getDateInDays(today, 10)} (10 days from today, inclusive)
- "next 5 days" → ${todayISO} to ${getDateInDays(today, 5)} (5 days from today, inclusive)
- If no date specified, use default: current month or next month if we're past the 20th

Return ONLY valid JSON with this exact structure. If information is missing, make reasonable defaults:
- Default timezone: "America/Toronto"
- Default date range: Current month or next month if we're past the 20th
- Default time: 9:00 to 17:00 if not specified`;
}

function getDateInDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: command },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to parse command' },
        { status: 500 }
      );
    }

    const parsed: ParsedCommand = JSON.parse(content);

    // Validate the parsed structure
    if (
      !parsed.people ||
      !Array.isArray(parsed.people) ||
      !parsed.daysOfWeek ||
      !Array.isArray(parsed.daysOfWeek) ||
      !parsed.timeRange ||
      !parsed.dateRange
    ) {
      return NextResponse.json(
        { error: 'Invalid parsed command structure' },
        { status: 500 }
      );
    }

    // Set default timezone if not provided
    if (!parsed.timezone) {
      parsed.timezone = 'America/Toronto';
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error parsing command:', error);
    return NextResponse.json(
      { error: 'Failed to parse command', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

