import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';

const TOKENS_PATH = path.join(process.cwd(), 'tokens.json');

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not provided' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens to file
    await fs.writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2));

    // Redirect to home page
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete Google OAuth' },
      { status: 500 }
    );
  }
}

