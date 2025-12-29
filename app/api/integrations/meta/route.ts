import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Initiate Meta (Facebook) OAuth flow - Facebook will show its own error if credentials are invalid
  const metaAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');

  const appId = process.env.META_APP_ID || 'YOUR_APP_ID_HERE';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  metaAuthUrl.searchParams.append('client_id', appId);
  metaAuthUrl.searchParams.append('redirect_uri', `${appUrl}/api/integrations/meta/callback`);
  metaAuthUrl.searchParams.append('scope', 'ads_read,business_management');
  metaAuthUrl.searchParams.append('state', 'random_state_string'); // Should be a secure random string

  console.log('Redirecting to Meta OAuth with app_id:', appId);

  return NextResponse.redirect(metaAuthUrl.toString());
}
