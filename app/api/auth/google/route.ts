import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return NextResponse.json(
        { 
          error: 'Google OAuth not configured',
          details: 'Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in .env.local'
        },
        { status: 500 }
      );
    }

    // Construct redirect URI if not fully qualified
    let redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!redirectUri.startsWith('http')) {
      // If relative, construct from request
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host') || 'localhost:3000';
      redirectUri = `${protocol}://${host}${redirectUri.startsWith('/') ? '' : '/'}${redirectUri}`;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const scopes = ['https://www.googleapis.com/auth/calendar.events'];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'select_account consent', // Show account selector AND force consent to get refresh token
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate Google OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

