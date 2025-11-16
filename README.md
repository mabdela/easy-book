# Easy Book

AI-powered calendar booking application that converts natural language commands into Google Calendar events.

## Features

- Natural language command parsing using OpenAI
- Automatic contact resolution from database
- Google Calendar integration with OAuth
- Multi-meeting booking in a single command
- Professional, responsive UI

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account
- OpenAI API key

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable **Google Calendar API**
3. Create **OAuth 2.0 Client ID** credentials
4. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Secret to `.env.local`

### 4. Initialize Database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Connect Google Calendar** - Click "Connect Calendar" in the navigation bar
2. **Enter Booking Command** - Type a natural language command:
   - `"Book meetings with Alice and Bob on Mondays and Wednesdays from 10 to 12 next week"`
   - `"Schedule meetings with team on Tuesdays and Thursdays at 2pm next 10 days"`
3. **Review & Add Contacts** - Review parsed details and add missing email addresses
4. **Confirm Slots** - Review all generated meeting slots
5. **Book Meetings** - Create all meetings in Google Calendar

## Example Commands

- `"Book meetings with Alice and Bob on Mondays and Wednesdays from 10 to 12 next week"`
- `"Schedule meetings with team on Tuesdays and Thursdays at 2pm next 10 days"`
- `"Book meetings with John on Fridays from 9am to 11am in December"`

## Project Structure

```
app/              # Next.js pages and API routes
components/       # React components
lib/              # Core business logic
prisma/           # Database schema
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Prisma + SQLite**
- **Google Calendar API**
- **OpenAI API**

## Important Notes

- This is a **local-only MVP** - designed for localhost development
- No availability checking - creates all possible slots
- OAuth tokens stored in `tokens.json` (auto-generated)
- Database stored in `prisma/dev.db`

## License

MIT
