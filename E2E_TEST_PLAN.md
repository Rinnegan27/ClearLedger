# ClearLedger (clearm.ai) - End-to-End Test Plan

## Test Execution Date: 2025-12-29

---

## 1. AUTHENTICATION & USER MANAGEMENT

### 1.1 Sign Up Flow
- [ ] Navigate to /auth/signup
- [ ] Fill form with valid data
- [ ] Submit and verify user creation
- [ ] Verify email verification token generation
- [ ] Check password hashing (bcrypt)
- [ ] Verify validation errors for invalid inputs
- [ ] Test duplicate email prevention

### 1.2 Email Verification
- [ ] Click verification link from email
- [ ] Verify email marked as verified
- [ ] Test expired token handling
- [ ] Test invalid token handling

### 1.3 Sign In Flow
- [ ] Sign in with valid credentials
- [ ] Verify session creation
- [ ] Test invalid password
- [ ] Test non-existent email
- [ ] Test unverified email blocking

### 1.4 Password Reset Flow
- [ ] Request password reset
- [ ] Verify reset token generation
- [ ] Click reset link
- [ ] Set new password
- [ ] Verify old password invalidated
- [ ] Test expired reset token

### 1.5 Protected Routes
- [ ] Access /dashboard without auth (should redirect)
- [ ] Access /dashboard with valid session
- [ ] Verify middleware protection

---

## 2. CORE ANALYTICS LIBRARY

### 2.1 Attribution Models
- [ ] Test lastTouch attribution
- [ ] Test firstTouch attribution
- [ ] Test linear attribution
- [ ] Test timeDecay attribution (7-day half-life)
- [ ] Test positionBased attribution (40/40/20)
- [ ] Verify channel aggregation
- [ ] Test with single touchpoint
- [ ] Test with multiple touchpoints from same channel

### 2.2 Revenue Calculator
- [ ] Calculate channel revenue metrics
- [ ] Verify profit = revenue - cost - spend
- [ ] Verify ROI = (profit / spend) * 100
- [ ] Test cost per booking calculation
- [ ] Test conversion rate calculation
- [ ] Test with zero values (division by zero)
- [ ] Test period comparison

### 2.3 Funnel Calculator
- [ ] Calculate 6-stage funnel
- [ ] Verify conversion rates at each stage
- [ ] Identify biggest leak
- [ ] Test with incomplete data
- [ ] Test channel-specific funnels

### 2.4 AI Call Analyzer
- [ ] Analyze sample call transcription
- [ ] Verify lead score (0-10 range)
- [ ] Verify sentiment classification
- [ ] Verify lead quality (hot/warm/cold/spam)
- [ ] Test with short transcription
- [ ] Test error handling for API failures
- [ ] Verify cost estimation

### 2.5 Budget Optimizer
- [ ] Optimize budget allocation
- [ ] Verify diminishing returns (5% decay per $1K)
- [ ] Test marginal ROI calculation
- [ ] Verify min/max constraints
- [ ] Test scenario simulation
- [ ] Find optimal budget for target ROI

---

## 3. API ENDPOINTS

### 3.1 Analytics Endpoints
**GET /api/analytics/revenue**
- [ ] Fetch revenue data with date range
- [ ] Verify summary calculations
- [ ] Verify channel breakdown
- [ ] Test with invalid dates
- [ ] Test unauthorized access

**GET /api/analytics/funnel**
- [ ] Fetch funnel data
- [ ] Verify all 6 stages present
- [ ] Test channel filtering
- [ ] Test time metrics

**POST /api/attribution/calculate**
- [ ] Calculate attribution for date range
- [ ] Test all 5 attribution models
- [ ] Verify booking updates
- [ ] Test model comparison

**POST /api/calls/analyze**
- [ ] Analyze single call
- [ ] Analyze batch calls
- [ ] Verify database updates
- [ ] Test with missing transcription

**POST /api/optimizer/recommend**
- [ ] Get budget recommendations
- [ ] Test scenario simulation
- [ ] Verify optimal budget calculation
- [ ] Test with insufficient data

### 3.2 TouchPoint Endpoints
**POST /api/touchpoints/track**
- [ ] Track Google Ads click
- [ ] Track Meta Ads click
- [ ] Track phone call
- [ ] Track booking
- [ ] Track website visit
- [ ] Test custom touchpoint
- [ ] Verify booking creation/matching

**GET /api/touchpoints/journey/[bookingId]**
- [ ] Fetch customer journey
- [ ] Verify touchpoint chronology
- [ ] Verify journey analytics
- [ ] Test non-existent booking

---

## 4. WEBHOOK HANDLERS

### 4.1 CallRail Webhook
**POST /api/webhooks/callrail**
- [ ] Process incoming call webhook
- [ ] Verify call record creation
- [ ] Verify touchpoint tracking
- [ ] Test AI analysis integration
- [ ] Test missed call detection
- [ ] Verify high-value missed call notification
- [ ] Test signature verification (TODO)

### 4.2 Calendly Webhook
**POST /api/webhooks/calendly**
- [ ] Process invitee.created event
- [ ] Verify booking creation
- [ ] Verify touchpoint tracking
- [ ] Test UTM parameter extraction
- [ ] Test phone extraction from questions
- [ ] Verify new booking notification
- [ ] Process invitee.canceled event
- [ ] Test signature verification

### 4.3 Shopify Webhook
**POST /api/webhooks/shopify**
- [ ] Process orders/create event
- [ ] Process orders/paid event
- [ ] Process orders/cancelled event
- [ ] Verify revenue attribution
- [ ] Test UTM extraction from URL
- [ ] Verify booking status updates
- [ ] Test signature verification

---

## 5. TOUCHPOINT TRACKING SYSTEM

### 5.1 Touchpoint Creation
- [ ] Track touchpoint with existing booking
- [ ] Track touchpoint without booking (auto-create)
- [ ] Match by phone number
- [ ] Match by email
- [ ] Test UTM parameter capture
- [ ] Test click ID capture (GCLID, FBCLID)

### 5.2 Booking Matching
- [ ] Find existing booking by phone
- [ ] Find existing booking by email
- [ ] Create new pending booking
- [ ] Update first-touch attribution
- [ ] Update last-touch attribution

### 5.3 Customer Journey
- [ ] Retrieve complete journey
- [ ] Verify chronological ordering
- [ ] Calculate time between touches
- [ ] List all channels in journey
- [ ] Test with single touchpoint
- [ ] Test with complex journey (5+ touchpoints)

---

## 6. NOTIFICATION SYSTEM

### 6.1 SSE Connection
- [ ] Establish SSE connection
- [ ] Verify keep-alive pings
- [ ] Test connection in multiple tabs
- [ ] Test reconnection after disconnect
- [ ] Verify graceful cleanup

### 6.2 Notification Delivery
- [ ] Create notification via API
- [ ] Verify real-time delivery via SSE
- [ ] Verify toast notification display
- [ ] Test notification persistence
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Delete notification

### 6.3 Notification Types
- [ ] missed_call notification
- [ ] booking notification
- [ ] campaign_alert notification
- [ ] sync_failure notification

---

## 7. DASHBOARD UI

### 7.1 Main Dashboard
- [ ] Load dashboard with real data
- [ ] Verify metrics display (revenue, spend, bookings, cost/booking)
- [ ] Test date range filter
- [ ] Verify auto-refresh (60s interval)
- [ ] Test loading state
- [ ] Test error state
- [ ] Verify channel distribution chart
- [ ] Verify channel performance table

### 7.2 Integrations Page
- [ ] View all integrations
- [ ] Initiate OAuth flow (Google, Meta)
- [ ] Test connection status display
- [ ] Test last sync timestamp

### 7.3 Insights Page
- [ ] View call insights
- [ ] View weekly performance
- [ ] Test data visualization

---

## 8. DATABASE OPERATIONS

### 8.1 Schema Validation
- [ ] Verify all models exist
- [ ] Verify TouchPoint model structure
- [ ] Verify Booking attribution fields
- [ ] Verify Call leadScore field
- [ ] Check indexes on touchpoints

### 8.2 Data Integrity
- [ ] Test cascading deletes
- [ ] Verify foreign key constraints
- [ ] Test unique constraints
- [ ] Verify default values

### 8.3 Prisma Operations
- [ ] Test complex queries (joins)
- [ ] Test aggregations
- [ ] Test transactions
- [ ] Verify connection pooling

---

## 9. SECURITY

### 9.1 Authentication
- [ ] Verify password hashing (bcrypt, 12 rounds)
- [ ] Test session security (httpOnly cookies)
- [ ] Verify CSRF protection
- [ ] Test timing-safe comparisons

### 9.2 Authorization
- [ ] Verify middleware protection
- [ ] Test API route authorization
- [ ] Verify user can only access own data

### 9.3 Input Validation
- [ ] Test XSS prevention
- [ ] Test SQL injection prevention (Prisma)
- [ ] Verify Zod schema validation
- [ ] Test file upload restrictions (if any)

### 9.4 Webhook Security
- [ ] Verify signature validation (Calendly)
- [ ] Verify signature validation (Shopify)
- [ ] Test signature validation (CallRail - TODO)

---

## 10. PERFORMANCE

### 10.1 Response Times
- [ ] API endpoints < 500ms
- [ ] Dashboard load < 2s
- [ ] Attribution calculation < 10s
- [ ] AI call analysis < 5s

### 10.2 Database Performance
- [ ] Query execution < 100ms
- [ ] Verify index usage
- [ ] Test with 1000+ touchpoints
- [ ] Test with 100+ bookings

### 10.3 Real-time Performance
- [ ] SSE latency < 100ms
- [ ] Toast notification delay < 1s
- [ ] Auto-refresh overhead minimal

---

## 11. ERROR HANDLING

### 11.1 API Errors
- [ ] 400 Bad Request for invalid input
- [ ] 401 Unauthorized for missing auth
- [ ] 404 Not Found for missing resources
- [ ] 500 Internal Server Error with logging

### 11.2 Graceful Degradation
- [ ] API failure doesn't crash UI
- [ ] Missing data shows placeholders
- [ ] OpenAI failure returns fallback
- [ ] Database errors logged properly

---

## 12. INTEGRATION TESTING

### 12.1 End-to-End User Journey
1. [ ] User signs up
2. [ ] User verifies email
3. [ ] User signs in
4. [ ] User connects integrations (Google, Meta)
5. [ ] System receives webhook (CallRail call)
6. [ ] Touchpoint tracked automatically
7. [ ] AI analyzes call
8. [ ] Notification sent to user
9. [ ] User views notification
10. [ ] User views dashboard with real metrics
11. [ ] User filters by date range
12. [ ] User views attribution for booking
13. [ ] User gets budget recommendations
14. [ ] User views conversion funnel

### 12.2 Attribution Flow
1. [ ] Ad click tracked (Google Ads, GCLID)
2. [ ] Call received (CallRail webhook)
3. [ ] Booking created (Calendly webhook)
4. [ ] Order paid (Shopify webhook)
5. [ ] All touchpoints linked to booking
6. [ ] Attribution calculated (time-decay model)
7. [ ] Revenue distributed across channels
8. [ ] ROI calculated correctly

---

## TEST DATA REQUIREMENTS

### Sample Company
- ID: test-company-123
- Name: "HVAC Masters"
- Industry: "Home Services"

### Sample Channels
1. Google Ads (ID: ch-google-001)
2. Meta Ads (ID: ch-meta-001)
3. Organic (ID: ch-organic-001)
4. Referral (ID: ch-referral-001)

### Sample Bookings
- 10 completed bookings with revenue
- 5 pending bookings
- 2 canceled bookings
- Various touchpoint counts (1-7 per booking)

### Sample Calls
- 20 answered calls with transcriptions
- 5 missed calls
- Lead scores ranging 0-10

### Sample Ad Spend
- Daily spend data for 30 days
- Impressions, clicks, conversions
- Multiple campaigns per channel

---

## EXPECTED OUTCOMES

### Success Criteria
✅ All authentication flows work correctly
✅ All 5 attribution models calculate accurately
✅ Revenue analytics show correct profit/ROI
✅ AI call analysis returns valid scores
✅ Webhooks process and track touchpoints
✅ Real-time notifications delivered via SSE
✅ Dashboard displays real data from API
✅ No security vulnerabilities found
✅ Performance meets targets
✅ Error handling is graceful

### Known Issues / TODs
⚠️ Company/User ID mapping uses temp IDs
⚠️ Webhook signature verification incomplete
⚠️ Email service not configured (needs SMTP)
⚠️ OpenAI API key not set
⚠️ Historical data sync not implemented
⚠️ UI dashboards not built (attribution, funnel, calls, optimizer)

---

## NEXT STEPS AFTER TESTING
1. Fix identified bugs
2. Implement TODO items
3. Set up production environment variables
4. Configure webhook endpoints in external services
5. Build remaining UI dashboards
6. Deploy to production
7. Monitor real user usage
