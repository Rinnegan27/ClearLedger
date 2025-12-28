# ClearLedger

**Know exactly what's making you money — and what's wasting it.**

ClearLedger gives local businesses a single, trusted view of how marketing spend turns into real revenue. We connect your ads, calls, and bookings into one clear system so you can see what's working, what to cut, and where money is being lost.

## Features

### Core Capabilities
- **360° Marketing View** - Unified dashboard showing all marketing channels in one place
- **Cost Per Booking** - See exactly how much each booked job costs across all channels
- **Call Analytics** - Track missed calls and their revenue impact
- **Revenue Attribution** - Connect bookings back to marketing channels automatically
- **Weekly Insights** - Plain-English reports on what's working and what needs attention

### Integrations
- Google Ads
- Meta Ads (Facebook/Instagram)
- CallRail (call tracking)
- Calendly (booking system)
- Shopify (e-commerce revenue)
- Stripe (payment tracking)

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI**: Tailwind CSS + Lucide Icons
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ (installed ✓)
- PostgreSQL database
- API credentials for integrations you want to use

### Installation

1. **Clone and install dependencies** (already done ✓)

```bash
cd clearledger
npm install
```

2. **Set up your database**

You have two options:

**Option A: Use Prisma Postgres (Recommended for development)**
```bash
npx prisma dev
```

**Option B: Use your own PostgreSQL database**
- Update `DATABASE_URL` in `.env` file
- Example: `DATABASE_URL="postgresql://user:password@localhost:5432/clearledger"`

3. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required for core functionality:
```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

Optional (add as you set up integrations):
- Google Ads credentials
- Meta Ads credentials
- CallRail API key
- Calendly API key
- Shopify credentials

4. **Run database migrations**

```bash
npx prisma db push
```

5. **Generate Prisma client** (already done ✓)

```bash
npm run db:generate
```

6. **Start the development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
clearledger/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Dashboard pages
│   ├── generated/            # Prisma client (generated)
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── dashboard/            # Dashboard-specific components
│   └── ui/                   # Reusable UI components
├── lib/                      # Utility libraries
│   ├── integrations/         # API integration clients
│   │   ├── google-ads.ts
│   │   ├── meta-ads.ts
│   │   ├── callrail.ts
│   │   ├── calendly.ts
│   │   └── shopify.ts
│   ├── prisma.ts             # Prisma client instance
│   └── utils.ts              # Helper functions
├── prisma/                   # Database schema
│   └── schema.prisma         # Prisma schema definition
├── types/                    # TypeScript type definitions
│   └── index.ts
└── public/                   # Static assets
```

## Database Schema

The database is designed to track:

- **Users & Companies** - Multi-tenant support with role-based access
- **Marketing Channels** - Google Ads, Meta, Organic, etc.
- **Campaigns** - Individual marketing campaigns with performance data
- **Ad Spend** - Daily spend tracking with metrics (clicks, conversions, etc.)
- **Calls** - Call tracking with status, duration, transcription
- **Bookings** - Scheduled jobs with revenue and attribution
- **Integrations** - Connected services with sync logs

View the full schema in [prisma/schema.prisma](prisma/schema.prisma)

## Key Metrics Calculated

1. **Cost Per Booking** = Total Marketing Spend / Total Bookings
2. **ROI** = ((Revenue - Cost) / Cost) × 100
3. **Missed Call Rate** = Missed Calls / Total Calls
4. **Lost Revenue from Missed Calls** = Missed Calls × Average Booking Value
5. **Channel Performance** = Revenue by source with attribution

## Integration Setup Guides

### Google Ads

1. Create a Google Ads Manager account
2. Apply for API access at [Google Ads API](https://developers.google.com/google-ads/api/docs/first-call/oauth)
3. Get your Developer Token
4. Set up OAuth 2.0 credentials
5. Add to `.env`:
```env
GOOGLE_ADS_CLIENT_ID="your-client-id"
GOOGLE_ADS_CLIENT_SECRET="your-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-dev-token"
```

### Meta Ads (Facebook/Instagram)

1. Create a Meta App at [Facebook Developers](https://developers.facebook.com/apps)
2. Add the Marketing API product
3. Generate an access token with `ads_read` permission
4. Add to `.env`:
```env
META_APP_ID="your-app-id"
META_APP_SECRET="your-app-secret"
META_ACCESS_TOKEN="your-access-token"
```

### CallRail

1. Sign up at [CallRail](https://www.callrail.com/)
2. Go to Settings > Integrations > API Keys
3. Generate a new API key
4. Add to `.env`:
```env
CALLRAIL_API_KEY="your-api-key"
CALLRAIL_ACCOUNT_ID="your-account-id"
```

### Calendly

1. Log in to [Calendly](https://calendly.com/)
2. Go to Integrations & Apps > API & Webhooks
3. Generate a Personal Access Token
4. Add to `.env`:
```env
CALENDLY_API_KEY="your-api-key"
```

### Shopify

1. Go to your Shopify Admin > Apps > App and sales channel settings
2. Develop apps > Create an app
3. Configure Admin API scopes (read_orders, read_products)
4. Install the app and get the access token
5. Add to `.env`:
```env
SHOPIFY_STORE_URL="yourstore.myshopify.com"
SHOPIFY_ACCESS_TOKEN="your-access-token"
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database commands
npm run db:push       # Push schema changes to database
npm run db:studio     # Open Prisma Studio (database GUI)
npm run db:generate   # Regenerate Prisma client
```

## Next Steps

1. **Set up authentication** - Implement NextAuth.js with your preferred provider (Google, GitHub, etc.)
2. **Connect integrations** - Add your API credentials and test connections
3. **Import historical data** - Run initial sync for each integration
4. **Customize insights** - Adjust the AI-generated insights based on your business needs
5. **Set up webhooks** - Configure real-time data syncing from booking/call platforms
6. **Deploy to production** - Push to Vercel or your preferred hosting platform

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env`
4. Deploy!

Vercel will automatically:
- Build your Next.js app
- Set up serverless functions for API routes
- Provide a production URL
- Enable automatic deployments on git push

## Support & Documentation

- **Prisma Docs**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

## Roadmap

- [ ] Complete authentication system
- [ ] Build integration connection UI
- [ ] Implement data sync jobs
- [ ] Add AI-powered insights generation
- [ ] Create custom reporting tools
- [ ] Mobile app for on-the-go insights
- [ ] Multi-currency support
- [ ] Advanced analytics and forecasting

## License

MIT

---

**Built for owner-operators. Start with clarity. Grow with confidence.**
