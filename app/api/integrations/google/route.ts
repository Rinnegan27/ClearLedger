import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Initiate OAuth flow - Google will show its own error if credentials are invalid
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  const clientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  googleAuthUrl.searchParams.append('client_id', clientId);
  googleAuthUrl.searchParams.append('redirect_uri', `${appUrl}/api/integrations/google/callback`);
  googleAuthUrl.searchParams.append('response_type', 'code');
  googleAuthUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/adwords');
  googleAuthUrl.searchParams.append('access_type', 'offline');
  googleAuthUrl.searchParams.append('prompt', 'consent');

  console.log('Redirecting to Google OAuth with client_id:', clientId);

  return NextResponse.redirect(googleAuthUrl.toString());
}
