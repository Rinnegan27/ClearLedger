# Debugging Guide for ClearLedger

## Common Issues and Solutions

### 1. Internal Server Error (500)

#### Symptoms
- Pages show "Internal Server Error"
- API routes return 500 status code
- Console shows database errors

#### Diagnosis
```bash
# Check if Prisma client is generated
ls -la app/generated/prisma/

# Check database connection
npx prisma db pull

# View database schema
npx prisma studio
```

#### Solutions

**Database not synced:**
```bash
npx prisma db push
npx prisma generate
npm run dev
```

**Prisma client out of date:**
```bash
npx prisma generate
```

**Missing environment variables:**
```bash
# Check .env file has:
DATABASE_URL="file:./prisma/dev.db"  # For SQLite
# OR
DATABASE_URL="postgresql://..."      # For PostgreSQL
```

---

### 2. Module Not Found Errors

#### Symptoms
- Build fails with "Cannot find module"
- TypeScript errors about missing packages

#### Solutions

**Install missing dependencies:**
```bash
npm install
```

**Regenerate Prisma client:**
```bash
npx prisma generate
```

---

### 3. Type Errors in New Features

#### Symptoms
- TypeScript compilation errors
- Type mismatches in API routes

#### Solutions

**Check Prisma types:**
```bash
# Regenerate after schema changes
npx prisma generate
```

**Common fixes:**
```typescript
// Fix 1: Await params in Next.js 15 routes
const { id } = await params;  // NOT: const { id } = params;

// Fix 2: Include relations in Prisma queries
const data = await prisma.model.findMany({
  include: { relation: true }  // Include related data
});

// Fix 3: Handle null values
const value = data?.field || defaultValue;
```

---

### 4. Cron Jobs Not Running

#### Symptoms
- Automated reports not sending
- Alerts not checking

#### Diagnosis
```bash
# Test cron endpoint manually
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/check-alerts

# Check Vercel cron logs (production)
vercel logs
```

#### Solutions

**Verify cron secret:**
```bash
# Add to .env
CRON_SECRET="your-secret-key"
```

**Test locally:**
```bash
# Install cron simulator
npm install -g vercel-cron-local

# Run cron jobs locally
vercel-cron-local
```

---

### 5. Email Not Sending

#### Symptoms
- Reports generate but emails don't arrive
- Email API errors in logs

#### Diagnosis
```bash
# Check if RESEND_API_KEY is set
grep RESEND_API_KEY .env

# Test email endpoint
curl -X POST http://localhost:3000/api/insights/generate \
  -H "Content-Type: application/json" \
  -d '{"period":"weekly","sendEmail":true}'
```

#### Solutions

**Set up Resend API key:**
```bash
# Add to .env
RESEND_API_KEY="re_..."
EMAIL_FROM="reports@yourdomain.com"
```

**Test without email:**
- Visit /dashboard/insights
- Click "Generate Report" (without email)
- Verify report generates correctly

---

### 6. Database Queries Slow

#### Symptoms
- Pages load slowly
- API endpoints timeout
- High database CPU usage

#### Diagnosis
```bash
# Open Prisma Studio to inspect data
npx prisma studio

# Check indexes
npx prisma db pull
# Review prisma/schema.prisma for @@index directives
```

#### Solutions

**Add missing indexes:**
```prisma
model AlertEvent {
  // ...
  @@index([companyId, dateTriggered])
  @@index([acknowledged])
}
```

**Limit query results:**
```typescript
// Add pagination
const results = await prisma.model.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' }
});
```

---

### 7. Authentication Issues

#### Symptoms
- "Unauthorized" errors
- Session not persisting
- Can't access dashboard

#### Solutions

**Check NextAuth configuration:**
```bash
# Verify .env has:
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Clear cookies and sessions:**
```bash
# Delete session cookies in browser
# OR restart dev server
```

---

## Quick Health Check

Run this command to verify all systems:

```bash
# Create a health check script
cat > check-health.sh << 'EOF'
#!/bin/bash
echo "=== ClearLedger Health Check ==="
echo ""

echo "✓ Checking database..."
npx prisma db push --help > /dev/null && echo "  Database CLI: OK" || echo "  Database CLI: FAIL"

echo "✓ Checking Prisma client..."
[ -d "app/generated/prisma" ] && echo "  Prisma client: GENERATED" || echo "  Prisma client: MISSING"

echo "✓ Checking dependencies..."
npm list date-fns > /dev/null 2>&1 && echo "  date-fns: INSTALLED" || echo "  date-fns: MISSING"

echo "✓ Checking build..."
npm run build > /dev/null 2>&1 && echo "  Build: SUCCESS" || echo "  Build: FAILED"

echo ""
echo "=== Health Check Complete ==="
EOF

chmod +x check-health.sh
./check-health.sh
```

---

## Useful Debug Endpoints

### Check Database Health
```bash
GET /api/debug/health
```
Returns database connection status and table existence.

### Manual Alert Check
```bash
POST /api/cron/check-alerts
Headers: Authorization: Bearer YOUR_CRON_SECRET
```

### Generate Test Report
```bash
POST /api/insights/generate
Body: {"period": "weekly", "sendEmail": false}
```

### Get Campaign Scores
```bash
GET /api/campaigns/scores?months=1
```

### Analyze Missed Calls
```bash
GET /api/recovery/missed-calls?days=30
```

---

## Environment Variables Checklist

Create a `.env` file with:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Email (Optional - for reports)
RESEND_API_KEY="re_your_key"
EMAIL_FROM="reports@yourdomain.com"

# Cron Security (Optional - for automated jobs)
CRON_SECRET="your-secret-key"

# OAuth (Optional - for integrations)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
META_APP_ID="..."
META_APP_SECRET="..."
```

---

## Getting Help

1. **Check browser console** (F12) for client-side errors
2. **Check terminal** where `npm run dev` is running for server errors
3. **Use Prisma Studio** to inspect database: `npx prisma studio`
4. **Check logs** in production: `vercel logs` or similar

---

**Last Updated**: December 31, 2025
