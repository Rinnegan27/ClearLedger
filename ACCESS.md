# ClearLedger - Access Guide

## 🚀 Quick Start

The platform is **ready to use** with sample data and a test account!

---

## 🌐 Live URLs

### Landing Page
**URL:** http://localhost:3000

**Features:**
- Product overview and feature showcase
- Sign In button (top right + hero section)
- Get Started button for new user registration

### Authentication Pages
- **Sign In:** http://localhost:3000/auth/signin
- **Sign Up:** http://localhost:3000/auth/signup
- **Password Reset:** http://localhost:3000/auth/forgot-password

### Dashboard Pages
- **Main Dashboard:** http://localhost:3000/dashboard
- **Attribution:** http://localhost:3000/dashboard/attribution
- **Funnel:** http://localhost:3000/dashboard/funnel
- **Calls:** http://localhost:3000/dashboard/calls
- **Optimizer:** http://localhost:3000/dashboard/optimizer
- **Integrations:** http://localhost:3000/dashboard/integrations
- **Insights:** http://localhost:3000/dashboard/insights

---

## 🔐 Test Account Credentials

### Quick Login (Pre-Created Account)
```
Email: test@clearm.ai
Password: Test1234!
```

**Account Details:**
- ✅ Email Verified (can login immediately)
- ✅ Linked to demo company with sample data
- ✅ Has access to all dashboards
- ✅ Sample data includes: 4 channels, 60 ad spend records, 48 calls, 36 bookings

**To Login:**
1. Visit http://localhost:3000/auth/signin
2. Enter email: `test@clearm.ai`
3. Enter password: `Test1234!`
4. Click "Sign In"
5. Access all dashboards immediately

---

## 📊 Sample Data Overview

The database is seeded with comprehensive sample data:

| Data Type | Count | Details |
|-----------|-------|---------|
| **Companies** | 2 | demo-company-id + temp-company-id |
| **Marketing Channels** | 4 | Google Ads, Meta Ads, Organic Search, Referral |
| **Ad Spend** | 60 records | Last 30 days × 2 channels |
| **Calls** | 48 calls | With AI analysis (lead scores, quality, urgency) |
| **Bookings** | 36 bookings | With revenue, cost, profit data |
| **TouchPoints** | 18 | Multi-touch attribution data |
| **Users** | 2 | demo@clearledger.com + test@clearm.ai |

---

## 🛠️ Creating Additional Test Accounts

### Method 1: Via UI (Sign Up Page)
1. Visit http://localhost:3000/auth/signup
2. Fill out the form:
   - Name (min 2 chars)
   - Email
   - Password (min 8 chars, must include: uppercase, lowercase, number, special char)
   - Confirm Password
   - Accept Terms
3. Click "Sign Up"
4. You'll be redirected to the verification page
5. Check email for verification link (if SMTP configured)
6. Click the verification link in the email
7. Sign in at http://localhost:3000/auth/signin

**Note:** If SMTP is not configured, use Method 2 (script) instead, which creates a pre-verified account.

### Method 2: Via Script (No Email Verification)
```bash
npx tsx prisma/create-test-user.ts
```

This creates the `test@clearm.ai` account (can be run multiple times, it will update the password).

To create custom accounts, modify `prisma/create-test-user.ts`:
```typescript
const user = await prisma.user.upsert({
  where: { email: "your-email@example.com" },
  update: { password: hashedPassword, emailVerified: new Date() },
  create: {
    email: "your-email@example.com",
    name: "Your Name",
    password: hashedPassword,
    emailVerified: new Date(),
  },
});
```

---

## 📚 What You Can Do

### 1. Main Dashboard
- View revenue, spend, profit, ROI by channel
- Real-time metrics with 60s auto-refresh
- Dynamic date range filtering (last 7, 30, 90 days)
- Channel performance table

### 2. Attribution Dashboard
- Test 5 attribution models:
  - First Touch
  - Last Touch
  - Linear
  - Time Decay (7-day half-life)
  - Position-Based (40/40/20)
- See how different models attribute revenue
- Channel breakdown with percentages
- Recalculate attribution with one click

### 3. Conversion Funnel Dashboard
- 6-stage funnel visualization:
  1. Impressions
  2. Clicks
  3. Calls
  4. Bookings
  5. Completed
  6. Paid
- Automatic leak detection (biggest drop-off highlighted)
- Color-coded drop-off warnings
- Optimization tips for each stage

### 4. Call Intelligence Dashboard
- 48 calls with AI analysis
- Lead quality distribution (hot/warm/cold/spam)
- Urgency distribution (immediate/soon/planning/browsing)
- Missed call alerts (~14 missed calls in sample data)
- High-value missed calls (~4 with score > 7)
- Estimated lost revenue tracking
- One-click callback functionality

### 5. Budget Optimizer Dashboard
- AI-driven budget allocation
- Interactive sliders for manual adjustments
- Current vs. recommended comparison
- ROI improvement projections
- Constraint-based optimization (min/max per channel)

---

## 🔄 Resetting/Reseeding Data

### To Reset All Data
```bash
npx prisma migrate reset
```
This will:
1. Drop all tables
2. Recreate schema
3. Run seed automatically

### To Reseed Without Reset
```bash
npx prisma db seed
```
This will add data (may create duplicates if run multiple times).

### To Start Fresh
```bash
npx prisma migrate reset --skip-seed
npx prisma db seed
npx tsx prisma/create-test-user.ts
```

---

## ⚙️ Environment Variables

Required `.env` variables:

```bash
# Database
DATABASE_URL="file:./dev.db"  # SQLite for local dev

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Email (Optional - for verification emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@clearm.ai"

# OpenAI (Optional - for AI call analysis)
OPENAI_API_KEY="sk-..."

# Webhooks (Optional - for signature verification)
CALENDLY_WEBHOOK_SECRET="your-secret"
CALLRAIL_WEBHOOK_SECRET="your-secret"
SHOPIFY_WEBHOOK_SECRET="your-secret"
```

**Currently Working Without:**
- SMTP (email verification can be skipped with test account)
- OPENAI_API_KEY (sample data includes pre-analyzed calls)
- Webhook secrets (development mode allows unsigned requests)

---

## 🐛 Troubleshooting

### Issue: Can't login with test account
**Solution:**
1. Verify account exists: `npx prisma studio` → User table → look for test@clearm.ai
2. Recreate account: `npx tsx prisma/create-test-user.ts`
3. Check password is correct: `Test1234!` (case-sensitive)

### Issue: Dashboard shows "No data available"
**Solution:**
1. Check if data was seeded: `npx prisma studio` → View tables
2. Reseed database: `npx prisma db seed`
3. Verify you're using correct company ID (demo-company-id or temp-company-id)

### Issue: "Unauthorized" error on dashboards
**Solution:**
1. Ensure you're signed in (check for session cookie)
2. Sign out and sign in again
3. Check NEXTAUTH_SECRET is set in .env

### Issue: Landing page shows no buttons
**Solution:**
1. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Restart dev server: Stop `npm run dev`, then start again
3. Clear browser cache

---

## 📞 Support

**Server Status:** Check with `curl http://localhost:3000`
**Database Tool:** `npx prisma studio` (opens GUI at http://localhost:5555)
**Logs:** Check terminal where `npm run dev` is running

**Common Commands:**
```bash
# Start server
npm run dev

# View database
npx prisma studio

# Reset everything
npx prisma migrate reset

# Create test user
npx tsx prisma/create-test-user.ts

# Run tests
npx tsx test-e2e.ts
```

---

## 🎯 Recommended Exploration Path

1. **Sign In:** http://localhost:3000/auth/signin (test@clearm.ai / Test1234!)
2. **Main Dashboard:** See revenue, spend, profit overview
3. **Funnel:** Analyze 6-stage conversion funnel
4. **Calls:** Review AI lead scoring and missed call alerts
5. **Attribution:** Compare different attribution models
6. **Optimizer:** Run AI budget optimization

**Time to Explore:** ~15 minutes to see all features

---

## ✅ You're All Set!

The platform is fully functional with:
- ✅ Test account ready (test@clearm.ai / Test1234!)
- ✅ Sample data loaded (60 ad spend, 48 calls, 36 bookings)
- ✅ All 5 dashboards operational
- ✅ Real-time features working
- ✅ Landing page with auth flow

**Start here:** http://localhost:3000

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
