/**
 * Parsed command structure from AI/NLP parsing.
 * Represents a natural language booking request converted to structured data.
 */
export interface ParsedCommand {
  /** Array of person names mentioned in the command */
  people: string[];
  /** Day abbreviations: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] */
  daysOfWeek: string[];
  /** Time range in 24-hour format */
  timeRange: {
    start: string; // "HH:MM" (24-hour)
    end: string; // "HH:MM" (24-hour)
  };
  /** Date range in ISO format */
  dateRange: {
    start: string; // "YYYY-MM-DD"
    end: string; // "YYYY-MM-DD"
  };
  /** IANA timezone identifier (e.g., "America/Toronto") */
  timezone: string;
}

/**
 * Contact information with name and email.
 */
export interface ContactInfo {
  name: string;
  email: string;
}

/**
 * Result of contact resolution process.
 * Separates resolved contacts from unknown names that need email input.
 */
export interface ContactResolutionResult {
  resolved: ContactInfo[];
  unknown: string[];
}

/**
 * Time slot for a meeting.
 */
export interface Slot {
  start: Date;
  end: Date;
}

/**
 * Payload for booking request API.
 */
export interface BookingRequestPayload {
  parsedCommand: ParsedCommand;
  contacts: ContactInfo[];
}

/**
 * Result of booking creation.
 */
export interface BookingResult {
  bookingRequestId: string;
  meetingCount: number;
  meetings: {
    id: string;
    start: Date;
    end: Date;
    title: string;
    googleEventId?: string;
    googleEventLink?: string;
  }[];
}

