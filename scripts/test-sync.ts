/**
 * Test Script for Data Sync
 *
 * Run with: npx tsx scripts/test-sync.ts
 */

import { GoogleAdsClient } from "../lib/integrations/google-ads";
import { MetaAdsClient } from "../lib/integrations/meta-ads";
import prisma from "../lib/db";

async function testGoogleAdsSync() {
  console.log("\n🔵 Testing Google Ads Sync...\n");

  try {
    // Ensure company and channel exist
    let company = await prisma.company.findFirst({
      where: { id: "temp-company-id" },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          id: "temp-company-id",
          name: "Test Company",
          industry: "HVAC",
          website: "https://example.com",
        },
      });
      console.log("✓ Created test company");
    }

    let channel = await prisma.marketingChannel.findFirst({
      where: {
        companyId: company.id,
        type: "google_ads",
      },
    });

    if (!channel) {
      channel = await prisma.marketingChannel.create({
        data: {
          companyId: company.id,
          name: "Google Ads",
          type: "google_ads",
          description: "Google Ads campaigns",
        },
      });
      console.log("✓ Created Google Ads channel");
    }

    // Create client and sync
    const client = new GoogleAdsClient({
      clientId: "mock",
      clientSecret: "mock",
      developerToken: "mock",
      refreshToken: "mock",
      customerId: "mock",
    });

    const startTime = Date.now();
    const recordsSynced = await client.syncToDatabase(company.id, channel.id);
    const duration = Date.now() - startTime;

    console.log(`✓ Synced ${recordsSynced} records in ${duration}ms`);

    // Verify data was saved
    const adSpendCount = await prisma.adSpend.count({
      where: {
        companyId: company.id,
        channelId: channel.id,
      },
    });

    const campaignCount = await prisma.campaign.count({
      where: {
        companyId: company.id,
        channelId: channel.id,
      },
    });

    console.log(`✓ Verified: ${campaignCount} campaigns, ${adSpendCount} ad spend records\n`);

    // Show sample data
    const sampleSpend = await prisma.adSpend.findFirst({
      where: {
        companyId: company.id,
        channelId: channel.id,
      },
      include: {
        campaign: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (sampleSpend) {
      console.log("Sample Record:");
      console.log(`  Campaign: ${sampleSpend.campaign?.name}`);
      console.log(`  Date: ${sampleSpend.date.toISOString().split("T")[0]}`);
      console.log(`  Spend: $${sampleSpend.amount.toFixed(2)}`);
      console.log(`  Impressions: ${sampleSpend.impressions}`);
      console.log(`  Clicks: ${sampleSpend.clicks}`);
      console.log(`  Conversions: ${sampleSpend.conversions}`);
      console.log(`  CTR: ${(sampleSpend.clickThroughRate! * 100).toFixed(2)}%`);
    }

    return true;
  } catch (error) {
    console.error("✗ Google Ads sync failed:", error);
    return false;
  }
}

async function testMetaAdsSync() {
  console.log("\n🔴 Testing Meta Ads Sync...\n");

  try {
    const company = await prisma.company.findFirst({
      where: { id: "temp-company-id" },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    let channel = await prisma.marketingChannel.findFirst({
      where: {
        companyId: company.id,
        type: "meta_ads",
      },
    });

    if (!channel) {
      channel = await prisma.marketingChannel.create({
        data: {
          companyId: company.id,
          name: "Meta Ads",
          type: "meta_ads",
          description: "Facebook and Instagram ads",
        },
      });
      console.log("✓ Created Meta Ads channel");
    }

    const client = new MetaAdsClient({
      appId: "mock",
      appSecret: "mock",
      accessToken: "mock",
      adAccountId: "mock",
    });

    const startTime = Date.now();
    const recordsSynced = await client.syncToDatabase(company.id, channel.id);
    const duration = Date.now() - startTime;

    console.log(`✓ Synced ${recordsSynced} records in ${duration}ms`);

    const adSpendCount = await prisma.adSpend.count({
      where: {
        companyId: company.id,
        channelId: channel.id,
      },
    });

    const campaignCount = await prisma.campaign.count({
      where: {
        companyId: company.id,
        channelId: channel.id,
      },
    });

    console.log(`✓ Verified: ${campaignCount} campaigns, ${adSpendCount} ad spend records\n`);

    // Show sample data
    const sampleSpend = await prisma.adSpend.findFirst({
      where: {
        companyId: company.id,
        channelId: channel.id,
      },
      include: {
        campaign: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (sampleSpend) {
      console.log("Sample Record:");
      console.log(`  Campaign: ${sampleSpend.campaign?.name}`);
      console.log(`  Date: ${sampleSpend.date.toISOString().split("T")[0]}`);
      console.log(`  Spend: $${sampleSpend.amount.toFixed(2)}`);
      console.log(`  Impressions: ${sampleSpend.impressions}`);
      console.log(`  Clicks: ${sampleSpend.clicks}`);
      console.log(`  Conversions: ${sampleSpend.conversions}`);
      console.log(`  CPM: $${((sampleSpend.amount / sampleSpend.impressions) * 1000).toFixed(2)}`);
    }

    return true;
  } catch (error) {
    console.error("✗ Meta Ads sync failed:", error);
    return false;
  }
}

async function testRevenueDashboard() {
  console.log("\n📊 Testing Revenue Dashboard Data...\n");

  try {
    const company = await prisma.company.findFirst({
      where: { id: "temp-company-id" },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    // Calculate metrics for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const adSpends = await prisma.adSpend.findMany({
      where: {
        companyId: company.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        channel: true,
      },
    });

    const totalSpend = adSpends.reduce((sum, spend) => sum + spend.amount, 0);
    const totalImpressions = adSpends.reduce((sum, spend) => sum + spend.impressions, 0);
    const totalClicks = adSpends.reduce((sum, spend) => sum + spend.clicks, 0);
    const totalConversions = adSpends.reduce((sum, spend) => sum + spend.conversions, 0);

    console.log("30-Day Summary:");
    console.log(`  Total Spend: $${totalSpend.toFixed(2)}`);
    console.log(`  Total Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`  Total Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`  Total Conversions: ${totalConversions}`);
    console.log(`  Avg CTR: ${((totalClicks / totalImpressions) * 100).toFixed(2)}%`);
    console.log(`  Avg CVR: ${((totalConversions / totalClicks) * 100).toFixed(2)}%`);
    console.log(`  Cost Per Conversion: $${(totalSpend / totalConversions).toFixed(2)}\n`);

    // Channel breakdown
    const channelMap = new Map<string, { spend: number; conversions: number }>();

    adSpends.forEach((spend) => {
      const channelName = spend.channel?.name || "Unknown";
      const existing = channelMap.get(channelName) || { spend: 0, conversions: 0 };
      channelMap.set(channelName, {
        spend: existing.spend + spend.amount,
        conversions: existing.conversions + spend.conversions,
      });
    });

    console.log("Channel Breakdown:");
    channelMap.forEach((data, channel) => {
      const cpa = data.conversions > 0 ? data.spend / data.conversions : 0;
      console.log(
        `  ${channel}: $${data.spend.toFixed(2)} spend, ${data.conversions} conversions, $${cpa.toFixed(2)} CPA`
      );
    });

    return true;
  } catch (error) {
    console.error("✗ Revenue dashboard test failed:", error);
    return false;
  }
}

async function main() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   Data Sync Integration Test Suite       ║");
  console.log("╚═══════════════════════════════════════════╝");

  const results = {
    googleAds: false,
    metaAds: false,
    dashboard: false,
  };

  results.googleAds = await testGoogleAdsSync();
  results.metaAds = await testMetaAdsSync();
  results.dashboard = await testRevenueDashboard();

  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║             Test Results                  ║");
  console.log("╠═══════════════════════════════════════════╣");
  console.log(`║  Google Ads Sync: ${results.googleAds ? "✅ PASS" : "❌ FAIL"}                 ║`);
  console.log(`║  Meta Ads Sync:   ${results.metaAds ? "✅ PASS" : "❌ FAIL"}                 ║`);
  console.log(`║  Dashboard Data:  ${results.dashboard ? "✅ PASS" : "❌ FAIL"}                 ║`);
  console.log("╚═══════════════════════════════════════════╝\n");

  const allPassed = results.googleAds && results.metaAds && results.dashboard;

  if (allPassed) {
    console.log("🎉 All tests passed! Your data sync is working perfectly.\n");
    console.log("Next steps:");
    console.log("  1. Start the dev server: npm run dev");
    console.log("  2. Go to /dashboard/integrations");
    console.log("  3. Click 'Sync Now' on Google Ads or Meta Ads");
    console.log("  4. Check /dashboard to see the synced data\n");
  } else {
    console.log("❌ Some tests failed. Please check the errors above.\n");
    process.exit(1);
  }

  await prisma.$disconnect();
}

main();
