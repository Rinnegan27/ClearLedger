# OAuth Integrations Setup Guide

This guide explains how to set up OAuth integrations for Google Ads, Meta (Facebook) Ads, and Shopify in clearm.ai.

## Overview

The integration buttons on the `/dashboard/integrations` page now initiate OAuth flows to connect:
- **Google Ads** - Track campaign performance and ad spend
- **Meta Ads** - Monitor Facebook and Instagram ad campaigns
- **Shopify** - Connect e-commerce store to track sales

## Prerequisites

1. Create developer accounts with each platform
2. Set up OAuth applications to get API credentials
3. Configure environment variables in `.env`

---

## 1. Google Ads OAuth Setup

### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Ads API**

### Configure OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application**
4. Add authorized redirect URI:
   ```
   http://localhost:3000/api/integrations/google/callback
   ```
   For production:
   ```
   https://yourdomain.com/api/integrations/google/callback
   ```
5. Save **Client ID** and **Client Secret**

### Environment Variables

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### OAuth Scopes

The integration requests the following scope:
- `https://www.googleapis.com/auth/adwords` - Read/write access to Google Ads data

---

## 2. Meta (Facebook) Ads OAuth Setup

### Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** as the app type
4. Fill in app details and create

### Configure OAuth Settings

1. In your app dashboard, go to **Settings** → **Basic**
2. Note your **App ID** and **App Secret**
3. Add **Facebook Login** product to your app
4. In **Facebook Login** settings, add OAuth redirect URI:
   ```
   http://localhost:3000/api/integrations/meta/callback
   ```
   For production:
   ```
   https://yourdomain.com/api/integrations/meta/callback
   ```

### Environment Variables

Add to your `.env` file:

```env
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
```

### OAuth Scopes

The integration requests the following scopes:
- `ads_read` - Read ads insights and campaign data
- `business_management` - Access business assets

---

## 3. Shopify OAuth Setup

### Create Shopify App

1. Go to your [Shopify Partner Dashboard](https://partners.shopify.com/)
2. Click **Apps** → **Create app**
3. Select **Public app**
4. Fill in app details

### Configure OAuth Settings

1. In your app settings, note the **API key** and **API secret key**
2. Add allowed redirection URL:
   ```
   http://localhost:3000/api/integrations/shopify/callback
   ```
   For production:
   ```
   https://yourdomain.com/api/integrations/shopify/callback
   ```

### Environment Variables

Add to your `.env` file:

```env
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
```

### OAuth Scopes

The integration requests the following scopes:
- `read_orders` - Access to order data
- `read_products` - Access to product catalog
- `read_customers` - Access to customer information

---

## How the OAuth Flow Works

### For Users

1. Click **Connect Now** on an integration card
2. For Shopify, enter your store domain when prompted
3. Get redirected to the platform's OAuth consent page
4. Authorize clearm.ai to access your data
5. Get redirected back with success/error message

### Technical Flow

1. **Initiation**: `/api/integrations/{platform}` route redirects to OAuth provider
2. **User Authorization**: User grants permissions on the platform
3. **Callback**: Platform redirects to `/api/integrations/{platform}/callback` with authorization code
4. **Token Exchange**: Backend exchanges code for access tokens
5. **Storage**: Tokens are stored (implement database storage)
6. **Redirect**: User redirected back to integrations page

---

## Next Steps: Token Storage

The current implementation includes TODO comments for token storage. You'll need to:

### 1. Set Up Database Schema

Example Prisma schema:

```prisma
model Integration {
  id           String   @id @default(cuid())
  userId       String
  platform     String   // 'google', 'meta', 'shopify'
  accessToken  String
  refreshToken String?
  expiresAt    DateTime?
  shopDomain   String?  // For Shopify
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, platform])
}
```

### 2. Implement Token Storage Functions

Create `/lib/integrations.ts`:

```typescript
import { prisma } from '@/lib/prisma';

export async function storeIntegrationTokens(
  userId: string,
  platform: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    shop?: string;
  }
) {
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null;

  await prisma.integration.upsert({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      shopDomain: tokens.shop,
    },
    create: {
      userId,
      platform,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      shopDomain: tokens.shop,
    },
  });
}
```

### 3. Update Callback Routes

Replace the TODO comments in callback routes with actual storage calls:

```typescript
// In /app/api/integrations/google/callback/route.ts
import { getServerSession } from 'next-auth';
import { storeIntegrationTokens } from '@/lib/integrations';

// ... after getting tokens
const session = await getServerSession();
if (session?.user?.id) {
  await storeIntegrationTokens(session.user.id, 'google', tokens);
}
```

### 4. Fetch Integration Status

Update the integrations page to show real connection status:

```typescript
// In /app/dashboard/integrations/page.tsx
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export default async function IntegrationsPage() {
  const session = await getServerSession();

  // Fetch user's integrations
  const userIntegrations = await prisma.integration.findMany({
    where: { userId: session?.user?.id },
  });

  const connectedPlatforms = new Set(
    userIntegrations.map(i => i.platform)
  );

  // Update integration status based on database
  const marketingIntegrations = [
    {
      name: "Google Ads",
      status: connectedPlatforms.has('google') ? 'connected' : 'available',
      // ... rest
    },
    // ...
  ];

  // ...
}
```

---

## Testing

### Test Mode

1. Start your dev server: `npm run dev`
2. Navigate to `/dashboard/integrations`
3. Click **Connect Now** on any integration
4. You'll see errors if environment variables aren't set

### Production Checklist

- [ ] Update all callback URLs in OAuth app settings to use production domain
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production URL
- [ ] Ensure all API credentials are set in production environment
- [ ] Implement token storage in database
- [ ] Add token refresh logic for expired tokens
- [ ] Implement error handling and user notifications
- [ ] Add integration disconnect functionality
- [ ] Test the full OAuth flow on production

---

## Security Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use environment variables** for all secrets
3. **Implement CSRF protection** - Add state parameter validation
4. **Secure token storage** - Encrypt tokens in database
5. **Token refresh** - Implement automatic token refresh before expiry
6. **Scope minimization** - Only request necessary permissions

---

## Troubleshooting

### "Redirect URI mismatch" Error

- Ensure callback URLs in your OAuth app settings exactly match the URLs in your code
- Check for trailing slashes and http vs https

### "Invalid client" Error

- Verify `CLIENT_ID` and `CLIENT_SECRET` are correctly set
- Ensure there are no extra spaces in environment variables

### "Access denied" Error

- User declined authorization
- Check that all required scopes are approved by the platform

### Tokens Not Saving

- Implement database storage (currently TODO)
- Check database connection
- Verify user session exists

---

## Support

For platform-specific OAuth documentation:
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Meta Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [Shopify OAuth](https://shopify.dev/docs/apps/auth/oauth)
