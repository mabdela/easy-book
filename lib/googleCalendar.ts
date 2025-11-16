import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';
import type { ContactInfo } from './types';

const TOKENS_PATH = path.join(process.cwd(), 'tokens.json');

interface TokenData {
  refresh_token?: string;
  access_token?: string;
  expiry_date?: number;
}

/**
 * Loads Google OAuth tokens from local file.
 * @returns Token data or null if file doesn't exist
 */
async function loadTokens(): Promise<TokenData | null> {
  try {
    const data = await fs.readFile(TOKENS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Saves Google OAuth tokens to local file.
 * @param tokens - Token data to save
 */
async function saveTokens(tokens: TokenData): Promise<void> {
  await fs.writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

/**
 * Gets authenticated Google OAuth client.
 * Automatically refreshes access token if expired.
 * @returns OAuth2 client instance
 */
export async function getGoogleAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const tokens = await loadTokens();
  if (tokens) {
    oauth2Client.setCredentials(tokens);
    
    // Refresh token if needed
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await saveTokens(credentials as TokenData);
      oauth2Client.setCredentials(credentials);
    }
  }

  return oauth2Client;
}

/**
 * Checks if Google Calendar is authenticated.
 * @returns True if refresh token exists
 */
export async function isAuthenticated(): Promise<boolean> {
  const tokens = await loadTokens();
  return !!(tokens && tokens.refresh_token);
}

/**
 * Disconnects Google Calendar by deleting tokens file.
 * @throws Error if file deletion fails (except when file doesn't exist)
 */
export async function disconnect(): Promise<void> {
  try {
    await fs.unlink(TOKENS_PATH);
  } catch (error) {
    // File doesn't exist, which is fine
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Creates a Google Calendar event.
 * 
 * @param start - Event start time
 * @param end - Event end time
 * @param attendees - Array of contact information
 * @param title - Event title
 * @returns Event ID and HTML link
 * @throws Error if not authenticated or event creation fails
 */
export async function createGoogleEvent(
  start: Date,
  end: Date,
  attendees: ContactInfo[],
  title: string
): Promise<{ id: string; htmlLink?: string }> {
  // Check if user is authenticated first
  const tokens = await loadTokens();
  if (!tokens || !tokens.refresh_token) {
    throw new Error('Google Calendar not authenticated. Please connect your Google Calendar first.');
  }

  const auth = await getGoogleAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: title,
    start: {
      dateTime: start.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: 'UTC',
    },
    attendees: attendees.map((contact) => ({ email: contact.email })),
    sendUpdates: 'all' as const,
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return {
      id: response.data.id || '',
      htmlLink: response.data.htmlLink || undefined,
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
}

