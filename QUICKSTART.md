# ClearLedger - Quick Start Guide

Welcome to ClearLedger! This guide will get you up and running in minutes.

## Current Status ✓

Your ClearLedger installation is complete with:
- ✓ Next.js 15 with TypeScript
- ✓ Tailwind CSS for styling
- ✓ Prisma ORM with PostgreSQL schema
- ✓ Dashboard UI with key metrics
- ✓ Integration templates for 5 platforms
- ✓ Development server tested and working

## What You Have

### 1. Landing Page
Visit [http://localhost:3000](http://localhost:3000) to see the marketing landing page explaining ClearLedger's value proposition.

### 2. Dashboard (Preview)
Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to see:
- Cost per booking metrics
- Total revenue and ROI
- Call analytics with missed call tracking
- Channel performance comparison
- Weekly actionable insights

**Note**: Dashboard currently shows placeholder data. Connect your database and integrations to see real data.

### 3. Database Schema
A complete schema is ready in `prisma/schema.prisma` for:
- User authentication
- Company/multi-tenant support
- Marketing channels and campaigns
- Ad spend tracking
- Call logs with transcription
- Bookings with revenue attribution
- Integration management

### 4. API Integration Templates
Ready-to-use clients for:
- **Google Ads** (`lib/integrations/google-ads.ts`)
- **Meta Ads** (`lib/integrations/meta-ads.ts`)
- **CallRail** (`lib/integrations/callrail.ts`)
- **Calendly** (`lib/integrations/calendly.ts`)
- **Shopify** (`lib/integrations/shopify.ts`)

Each includes authentication, data fetching, and database sync methods.

## Next Steps (In Order)

### Step 1: Set Up Your Database (Required)

**Option A: Quick Start with Prisma Postgres**
```bash
npx prisma dev
```
This creates a local PostgreSQL instance automatically.

**Option B: Use Your Own PostgreSQL**
1. Install PostgreSQL if needed
2. Create a database: `createdb clearledger`
3. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/clearledger"
```

Then push the schema:
```bash
npx prisma db push
```

### Step 2: Configure Authentication

Add to your `.env`:
```env
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

Then implement NextAuth.js:
- Create `app/api/auth/[...nextauth]/route.ts`
- Choose providers (Google, GitHub, Email, etc.)
- See: https://next-auth.js.org/getting-started/example

### Step 3: Connect Your First Integration

Pick one platform to start with:

**For Google Ads:**
1. Get API credentials (see README.md)
2. Add to `.env`:
```env
GOOGLE_ADS_CLIENT_ID="..."
GOOGLE_ADS_CLIENT_SECRET="..."
GOOGLE_ADS_DEVELOPER_TOKEN="..."
```
3. Build the integration UI to let users connect
4. Run initial sync to pull historical data

**For CallRail (Easier Start):**
1. Get API key from CallRail dashboard
2. Add to `.env`:
```env
CALLRAIL_API_KEY="your-api-key"
CALLRAIL_ACCOUNT_ID="your-account-id"
```
3. Create an API route to fetch calls
4. Display in dashboard

### Step 4: Connect Real Data to Dashboard

Update the placeholder functions in components:
- `components/dashboard/MetricsOverview.tsx` - Replace `getMetrics()` with Prisma queries
- `components/dashboard/ChannelPerformanceChart.tsx` - Query actual channel data
- `components/dashboard/CallInsightsCard.tsx` - Show real call stats
- `components/dashboard/WeeklyInsights.tsx` - Generate insights from your data

### Step 5: Build Integration Management UI

Create pages for:
- `/dashboard/integrations` - List connected services
- `/dashboard/integrations/connect` - OAuth flows for each platform
- `/dashboard/settings` - Company settings and preferences

### Step 6: Set Up Data Sync

Create cron jobs or API routes to:
1. Sync ad spend daily from Google Ads and Meta
2. Pull call logs from CallRail
3. Fetch new bookings from Calendly
4. Update revenue from Shopify

Use Vercel Cron Jobs or similar for production.

## Development Workflow

```bash
# Start development server
npm run dev

# Open Prisma Studio to view/edit database
npm run db:studio

# After schema changes
npx prisma db push
npm run db:generate

# Check for errors
npm run lint
```

## Testing Your Setup

1. **Start the server:**
```bash
npm run dev
```

2. **Visit the pages:**
- Landing: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

3. **Check database:**
```bash
npm run db:studio
```

4. **Verify integrations:**
Open `lib/integrations/google-ads.ts` and review the setup instructions.

## Common Issues

**"Can't connect to database"**
- Make sure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Try: `npx prisma db push`

**"Module not found" errors**
- Run: `npm install`
- Restart dev server

**"Prisma Client not generated"**
- Run: `npm run db:generate`

## Getting Help

- Check [README.md](README.md) for detailed documentation
- Review the database schema in `prisma/schema.prisma`
- Look at integration examples in `lib/integrations/`
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs

## Recommended Path

1. Set up database (30 mins)
2. Add authentication (1-2 hours)
3. Connect one integration - start with CallRail (2-3 hours)
4. Update dashboard to show real data (1-2 hours)
5. Add more integrations as needed
6. Deploy to Vercel (30 mins)

**You're all set to build ClearLedger!**

Start with the database setup, then pick one integration to get real data flowing. The foundation is solid and ready to grow with your needs.
