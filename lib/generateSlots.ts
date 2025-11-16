import { addDays, parseISO, setHours, setMinutes } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import type { ParsedCommand, Slot } from './types';

/**
 * Maps day abbreviations to JavaScript Date.getDay() values.
 * Sunday = 0, Monday = 1, etc.
 */
const DAY_MAP: Record<string, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 0,
};

/**
 * Generates meeting slots based on parsed command.
 * 
 * - Finds all dates within dateRange that match daysOfWeek
 * - Splits time range into 1-hour blocks
 * - Converts to UTC if timezone is specified
 * 
 * @param parsedCommand - Parsed booking command with date/time constraints
 * @returns Array of time slots (start and end dates)
 */
export function generateSlots(parsedCommand: ParsedCommand): Slot[] {
  const { daysOfWeek, timeRange, dateRange, timezone } = parsedCommand;
  const slots: Slot[] = [];

  // Parse date range
  const startDate = parseISO(dateRange.start);
  const endDate = parseISO(dateRange.end);

  // Parse time range
  const [startHour, startMinute] = timeRange.start.split(':').map(Number);
  const [endHour, endMinute] = timeRange.end.split(':').map(Number);

  // Generate all dates within range that match daysOfWeek
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dayAbbr = Object.keys(DAY_MAP).find(
      (key) => DAY_MAP[key] === dayOfWeek
    );

    if (dayAbbr && daysOfWeek.includes(dayAbbr)) {
      // Create slots for this date by splitting time range into 1-hour blocks
      let slotStartHour = startHour;
      let slotStartMinute = startMinute;

      while (slotStartHour < endHour || (slotStartHour === endHour && slotStartMinute < endMinute)) {
        const slotEndHour = slotStartHour + 1;
        const slotEndMinute = slotStartMinute;

        // Create slot start time
        let slotStart = setHours(currentDate, slotStartHour);
        slotStart = setMinutes(slotStart, slotStartMinute);

        // Create slot end time
        let slotEnd = setHours(currentDate, slotEndHour);
        slotEnd = setMinutes(slotEnd, slotEndMinute);

        // Convert to UTC if timezone is specified
        if (timezone) {
          slotStart = fromZonedTime(slotStart, timezone);
          slotEnd = fromZonedTime(slotEnd, timezone);
        }

        slots.push({ start: slotStart, end: slotEnd });

        // Move to next hour slot
        slotStartHour += 1;
        slotStartMinute = 0;
      }
    }

    // Move to next day
    currentDate = addDays(currentDate, 1);
  }

  return slots;
}

