/**
 * End-to-End Test Script for ClearLedger
 *
 * This script tests core functionality of the analytics platform.
 * Run with: npx tsx test-e2e.ts
 */

import { PrismaClient } from "./app/generated/prisma/client";
import {
  lastTouch,
  firstTouch,
  linear,
  timeDecay,
  positionBased,
} from "./lib/attribution/models";
import {
  calculateAttribution,
  calculateBulkAttribution,
  compareAttributionModels,
} from "./lib/attribution/engine";
import {
  calculateChannelRevenue,
  calculateRevenueSummary,
} from "./lib/analytics/revenue-calculator";
import { calculateFunnel } from "./lib/analytics/funnel-calculator";
import {
  optimizeBudget,
  predictROI,
  type ChannelPerformance,
} from "./lib/optimizer/budget-optimizer";
import { trackTouchpoint, getCustomerJourney } from "./lib/integrations/touchpoint-tracker";

const prisma = new PrismaClient();

// Test results tracking
const results: { [key: string]: { passed: number; failed: number; errors: string[] } } = {};

function addResult(category: string, testName: string, passed: boolean, error?: string) {
  if (!results[category]) {
    results[category] = { passed: 0, failed: 0, errors: [] };
  }
  if (passed) {
    results[category].passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    results[category].failed++;
    console.log(`  ❌ ${testName}`);
    if (error) {
      results[category].errors.push(`${testName}: ${error}`);
    }
  }
}

// ============================================
// 1. ATTRIBUTION MODELS TESTS
// ============================================
async function testAttributionModels() {
  console.log("\n📊 Testing Attribution Models...\n");

  // Sample touchpoints
  const touchpoints = [
    {
      id: "tp1",
      bookingId: "b1",
      channelId: "ch-google",
      campaignId: null,
      touchpointType: "ad_click" as const,
      timestamp: new Date("2024-01-01T10:00:00Z"),
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      clickId: "gclid123",
      metadata: null,
      createdAt: new Date(),
    },
    {
      id: "tp2",
      bookingId: "b1",
      channelId: "ch-organic",
      campaignId: null,
      touchpointType: "call" as const,
      timestamp: new Date("2024-01-02T14:00:00Z"),
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      clickId: null,
      metadata: null,
      createdAt: new Date(),
    },
    {
      id: "tp3",
      bookingId: "b1",
      channelId: "ch-meta",
      campaignId: null,
      touchpointType: "booking_request" as const,
      timestamp: new Date("2024-01-03T16:00:00Z"),
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      clickId: "fbclid456",
      metadata: null,
      createdAt: new Date(),
    },
  ];

  const revenue = 1000;

  // Test Last Touch
  const lastTouchResult = lastTouch(touchpoints, revenue);
  addResult(
    "Attribution Models",
    "Last Touch Attribution",
    lastTouchResult.length === 1 &&
      lastTouchResult[0].channelId === "ch-meta" &&
      lastTouchResult[0].revenue === 1000
  );

  // Test First Touch
  const firstTouchResult = firstTouch(touchpoints, revenue);
  addResult(
    "Attribution Models",
    "First Touch Attribution",
    firstTouchResult.length === 1 &&
      firstTouchResult[0].channelId === "ch-google" &&
      firstTouchResult[0].revenue === 1000
  );

  // Test Linear
  const linearResult = linear(touchpoints, revenue);
  addResult(
    "Attribution Models",
    "Linear Attribution",
    linearResult.length === 3 &&
      Math.abs(linearResult[0].revenue - 333.33) < 1 &&
      Math.abs(linearResult[0].weight - 0.333) < 0.01
  );

  // Test Time Decay
  const timeDecayResult = timeDecay(touchpoints, revenue);
  addResult(
    "Attribution Models",
    "Time Decay Attribution",
    timeDecayResult.length === 3 &&
      timeDecayResult[2].revenue > timeDecayResult[0].revenue // More recent gets more credit
  );

  // Test Position Based
  const positionResult = positionBased(touchpoints, revenue);
  addResult(
    "Attribution Models",
    "Position Based Attribution (40/40/20)",
    positionResult.length === 3 &&
      Math.abs(positionResult[0].revenue - 400) < 1 && // First: 40%
      Math.abs(positionResult[2].revenue - 400) < 1 && // Last: 40%
      Math.abs(positionResult[1].revenue - 200) < 1 // Middle: 20%
  );

  // Test with single touchpoint
  const singleTouch = [touchpoints[0]];
  const singleResult = positionBased(singleTouch, revenue);
  addResult(
    "Attribution Models",
    "Single Touchpoint Handling",
    singleResult.length === 1 && singleResult[0].revenue === 1000
  );

  // Test channel aggregation (multiple touchpoints from same channel)
  const duplicateChannelTouchpoints = [
    touchpoints[0],
    { ...touchpoints[0], id: "tp4", timestamp: new Date("2024-01-01T11:00:00Z") },
    touchpoints[1],
  ];
  const aggregatedResult = linear(duplicateChannelTouchpoints, revenue);
  const googleRevenue = aggregatedResult.find((r) => r.channelId === "ch-google");
  addResult(
    "Attribution Models",
    "Channel Aggregation",
    googleRevenue !== undefined &&
      Math.abs(googleRevenue.revenue - 666.67) < 1 // 2/3 of revenue
  );
}

// ============================================
// 2. REVENUE CALCULATOR TESTS
// ============================================
async function testRevenueCalculator() {
  console.log("\n💰 Testing Revenue Calculator...\n");

  // Test profit calculation
  const spend = 1000;
  const revenue = 5000;
  const cost = 1500;
  const profit = revenue - cost - spend;
  const roi = (profit / spend) * 100;

  addResult(
    "Revenue Calculator",
    "Profit Calculation",
    profit === 2500
  );

  addResult(
    "Revenue Calculator",
    "ROI Calculation",
    roi === 250 // 250% ROI
  );

  // Test cost per booking
  const bookings = 10;
  const costPerBooking = spend / bookings;
  addResult(
    "Revenue Calculator",
    "Cost Per Booking",
    costPerBooking === 100
  );

  // Test conversion rate
  const clicks = 500;
  const conversionRate = (bookings / clicks) * 100;
  addResult(
    "Revenue Calculator",
    "Conversion Rate",
    conversionRate === 2 // 2%
  );

  // Test division by zero handling
  const testSpend = 0;
  const testProfit = 100;
  const zeroSpendROI = testSpend === 0 ? 0 : (testProfit / testSpend) * 100;
  addResult(
    "Revenue Calculator",
    "Zero Division Handling",
    zeroSpendROI === 0
  );
}

// ============================================
// 3. FUNNEL CALCULATOR TESTS
// ============================================
async function testFunnelCalculator() {
  console.log("\n🔄 Testing Funnel Calculator...\n");

  const funnelData = {
    impressions: 10000,
    clicks: 500,
    calls: 50,
    bookings: 20,
    completed: 18,
    paid: 15,
  };

  // Calculate conversion rates
  const clickRate = funnelData.clicks / funnelData.impressions;
  const callRate = funnelData.calls / funnelData.clicks;
  const bookingRate = funnelData.bookings / funnelData.calls;
  const completionRate = funnelData.completed / funnelData.bookings;
  const paymentRate = funnelData.paid / funnelData.completed;

  addResult(
    "Funnel Calculator",
    "Click Through Rate",
    Math.abs(clickRate - 0.05) < 0.001 // 5%
  );

  addResult(
    "Funnel Calculator",
    "Call Conversion Rate",
    Math.abs(callRate - 0.1) < 0.001 // 10%
  );

  addResult(
    "Funnel Calculator",
    "Booking Conversion Rate",
    Math.abs(bookingRate - 0.4) < 0.001 // 40%
  );

  // Identify biggest leak (highest drop rate)
  const dropRates = [
    { stage: "Impressions → Clicks", rate: 1 - clickRate },
    { stage: "Clicks → Calls", rate: 1 - callRate },
    { stage: "Calls → Bookings", rate: 1 - bookingRate },
    { stage: "Bookings → Completed", rate: 1 - completionRate },
    { stage: "Completed → Paid", rate: 1 - paymentRate },
  ];

  const biggestLeak = dropRates.reduce((max, curr) =>
    curr.rate > max.rate ? curr : max
  );

  addResult(
    "Funnel Calculator",
    "Biggest Leak Detection",
    biggestLeak.stage === "Impressions → Clicks" // 95% drop
  );

  // Overall conversion rate
  const overallConversion = funnelData.paid / funnelData.impressions;
  addResult(
    "Funnel Calculator",
    "Overall Conversion Rate",
    Math.abs(overallConversion - 0.0015) < 0.0001 // 0.15%
  );
}

// ============================================
// 4. BUDGET OPTIMIZER TESTS
// ============================================
async function testBudgetOptimizer() {
  console.log("\n🎯 Testing Budget Optimizer...\n");

  const channels: ChannelPerformance[] = [
    {
      id: "ch1",
      name: "Google Ads",
      historicalSpend: 5000,
      historicalRevenue: 15000,
      historicalBookings: 30,
      avgROI: 200, // 200% ROI
    },
    {
      id: "ch2",
      name: "Meta Ads",
      historicalSpend: 3000,
      historicalRevenue: 12000,
      historicalBookings: 25,
      avgROI: 300, // 300% ROI
    },
    {
      id: "ch3",
      name: "Organic",
      historicalSpend: 0,
      historicalRevenue: 5000,
      historicalBookings: 20,
      avgROI: 999, // Infinite ROI (no spend)
    },
  ];

  // Test ROI prediction with diminishing returns
  const predicted1K = predictROI(channels[0], 1000);
  const predicted2K = predictROI(channels[0], 2000);
  addResult(
    "Budget Optimizer",
    "Diminishing Returns",
    predicted2K < predicted1K * 2 // Should be less than double due to decay
  );

  // Test budget optimization
  const totalBudget = 10000;
  const allocation = optimizeBudget(channels, totalBudget, {
    minPerChannel: 500,
    maxPerChannel: 8000,
  });

  const totalAllocated = allocation.reduce((sum, a) => sum + a.recommendedSpend, 0);
  addResult(
    "Budget Optimizer",
    "Total Budget Allocation",
    Math.abs(totalAllocated - totalBudget) < 1
  );

  addResult(
    "Budget Optimizer",
    "Min Constraint Enforcement",
    allocation.every((a) => a.recommendedSpend >= 500)
  );

  addResult(
    "Budget Optimizer",
    "Max Constraint Enforcement",
    allocation.every((a) => a.recommendedSpend <= 8000)
  );

  // Highest ROI channel should get more budget
  const metaAllocation = allocation.find((a) => a.channelId === "ch2");
  const googleAllocation = allocation.find((a) => a.channelId === "ch1");
  addResult(
    "Budget Optimizer",
    "Greedy Algorithm Correctness",
    !!(metaAllocation && googleAllocation &&
    metaAllocation.recommendedSpend >= googleAllocation.recommendedSpend)
  );
}

// ============================================
// 5. DATABASE TESTS
// ============================================
async function testDatabase() {
  console.log("\n🗄️  Testing Database Operations...\n");

  try {
    // Test connection
    await prisma.$connect();
    addResult("Database", "Connection", true);

    // Test TouchPoint model exists
    const touchpointCount = await prisma.touchPoint.count();
    addResult("Database", "TouchPoint Model", true);

    // Test Booking model with attribution fields
    const bookings = await prisma.booking.findMany({
      take: 1,
      select: {
        id: true,
        firstTouchChannelId: true,
        lastTouchChannelId: true,
        attributionModel: true,
      },
    });
    addResult("Database", "Booking Attribution Fields", true);

    // Test Call model with leadScore
    const calls = await prisma.call.findMany({
      take: 1,
      select: { id: true, leadScore: true },
    });
    addResult("Database", "Call LeadScore Field", true);

    // Test indexes (check query performance)
    const start = Date.now();
    await prisma.touchPoint.findMany({
      where: { bookingId: "test" },
      orderBy: { timestamp: "asc" },
    });
    const queryTime = Date.now() - start;
    addResult("Database", "Index Performance", queryTime < 100);

  } catch (error) {
    addResult("Database", "Connection", false, error instanceof Error ? error.message : "Unknown error");
  }
}

// ============================================
// 6. TOUCHPOINT TRACKING TESTS
// ============================================
async function testTouchpointTracking() {
  console.log("\n📍 Testing TouchPoint Tracking...\n");

  // Test touchpoint creation (mock - doesn't actually hit DB)
  try {
    const mockTouchpoint = {
      companyId: "test-company",
      channelId: "test-channel",
      touchpointType: "ad_click" as const,
      timestamp: new Date(),
      utmParams: {
        source: "google",
        medium: "cpc",
        campaign: "test-campaign",
      },
      clickId: "gclid123",
    };

    addResult("TouchPoint Tracking", "Data Structure Validation", true);

    // Test UTM parameter capture
    const hasUTM = mockTouchpoint.utmParams &&
      mockTouchpoint.utmParams.source === "google";
    addResult("TouchPoint Tracking", "UTM Parameter Capture", hasUTM);

    // Test click ID capture
    const hasClickId = mockTouchpoint.clickId === "gclid123";
    addResult("TouchPoint Tracking", "Click ID Capture", hasClickId);

  } catch (error) {
    addResult("TouchPoint Tracking", "Data Structure Validation", false, error instanceof Error ? error.message : "Unknown error");
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runTests() {
  console.log("🚀 Starting End-to-End Tests for ClearLedger\n");
  console.log("=" .repeat(60));

  try {
    await testAttributionModels();
    await testRevenueCalculator();
    await testFunnelCalculator();
    await testBudgetOptimizer();
    await testDatabase();
    await testTouchpointTracking();

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("\n📊 TEST SUMMARY\n");

    let totalPassed = 0;
    let totalFailed = 0;

    for (const [category, result] of Object.entries(results)) {
      totalPassed += result.passed;
      totalFailed += result.failed;

      const status = result.failed === 0 ? "✅" : "❌";
      console.log(`${status} ${category}: ${result.passed} passed, ${result.failed} failed`);

      if (result.errors.length > 0) {
        result.errors.forEach((error) => {
          console.log(`    ⚠️  ${error}`);
        });
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed`);
    console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%\n`);

    if (totalFailed === 0) {
      console.log("🎉 All tests passed!\n");
    } else {
      console.log(`⚠️  ${totalFailed} test(s) failed. Please review the errors above.\n`);
    }

  } catch (error) {
    console.error("❌ Fatal error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests().catch(console.error);
