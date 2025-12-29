import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop'); // User needs to provide their shop domain

  if (!shop) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?error=missing_shop_domain`
    );
  }

  // Initiate Shopify OAuth flow - Shopify will show its own error if credentials are invalid
  const shopifyAuthUrl = new URL(`https://${shop}/admin/oauth/authorize`);

  const apiKey = process.env.SHOPIFY_API_KEY || 'YOUR_API_KEY_HERE';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  shopifyAuthUrl.searchParams.append('client_id', apiKey);
  shopifyAuthUrl.searchParams.append('scope', 'read_orders,read_products,read_customers');
  shopifyAuthUrl.searchParams.append('redirect_uri', `${appUrl}/api/integrations/shopify/callback`);
  shopifyAuthUrl.searchParams.append('state', 'random_state_string'); // Should be a secure random string

  console.log('Redirecting to Shopify OAuth for shop:', shop);

  return NextResponse.redirect(shopifyAuthUrl.toString());
}
