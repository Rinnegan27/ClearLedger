/**
 * Daily Sync Cron Job
 *
 * This endpoint should be called daily (e.g., at 2am) to sync data from all integrations.
 *
 * Setup for Vercel:
 * 1. Add to vercel.json:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/sync-daily",
 *        "schedule": "0 2 * * *"
 *      }]
 *    }
 *
 * Setup for other platforms:
 * - Use external cron service (cron-job.org, EasyCron, etc.)
 * - Schedule: 0 2 * * * (daily at 2am)
 * - URL: https://your-domain.com/api/cron/sync-daily
 * - Add Authorization header with CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsClient } from "@/lib/integrations/google-ads";
import { MetaAdsClient } from "@/lib/integrations/meta-ads";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting daily integration sync...");

    const results = {
      googleAds: { success: false, recordsSynced: 0, error: null as string | null },
      metaAds: { success: false, recordsSynced: 0, error: null as string | null },
    };

    // Get all companies that have integrations enabled
    const companies = await prisma.company.findMany({
      include: {
        integrations: {
          where: {
            isActive: true,
            type: {
              in: ["google_ads", "meta_ads"],
            },
          },
        },
      },
    });

    for (const company of companies) {
      console.log(`[Cron] Syncing data for company: ${company.name} (${company.id})`);

      // Sync Google Ads
      const googleIntegration = company.integrations.find((i) => i.type === "google_ads");
      if (googleIntegration) {
        try {
          const googleChannel = await prisma.marketingChannel.findFirst({
            where: {
              companyId: company.id,
              type: "google_ads",
            },
          });

          if (googleChannel) {
            // Parse credentials from encrypted JSON string
            const credentials = JSON.parse(googleIntegration.credentials);
            const client = new GoogleAdsClient({
              clientId: credentials.clientId || "mock",
              clientSecret: credentials.clientSecret || "mock",
              developerToken: credentials.developerToken || "mock",
              refreshToken: credentials.refreshToken || "mock",
              customerId: credentials.customerId || "mock",
            });

            const syncLog = await prisma.syncLog.create({
              data: {
                integrationId: googleIntegration.id,
                status: "in_progress",
                startedAt: new Date(),
              },
            });

            try {
              const recordsSynced = await client.syncToDatabase(company.id, googleChannel.id);

              await prisma.syncLog.update({
                where: { id: syncLog.id },
                data: {
                  status: "success",
                  recordsSynced,
                  completedAt: new Date(),
                },
              });

              await prisma.integration.update({
                where: { id: googleIntegration.id },
                data: { lastSyncedAt: new Date() },
              });

              results.googleAds.success = true;
              results.googleAds.recordsSynced += recordsSynced;
              console.log(`[Cron] Google Ads sync completed: ${recordsSynced} records`);
            } catch (syncError: any) {
              await prisma.syncLog.update({
                where: { id: syncLog.id },
                data: {
                  status: "failed",
                  errorMessage: syncError.message,
                  completedAt: new Date(),
                },
              });
              results.googleAds.error = syncError.message;
              console.error("[Cron] Google Ads sync failed:", syncError);
            }
          }
        } catch (error: any) {
          results.googleAds.error = error.message;
          console.error("[Cron] Google Ads sync error:", error);
        }
      }

      // Sync Meta Ads
      const metaIntegration = company.integrations.find((i) => i.type === "meta_ads");
      if (metaIntegration) {
        try {
          const metaChannel = await prisma.marketingChannel.findFirst({
            where: {
              companyId: company.id,
              type: "meta_ads",
            },
          });

          if (metaChannel) {
            // Parse credentials from encrypted JSON string
            const credentials = JSON.parse(metaIntegration.credentials);
            const client = new MetaAdsClient({
              appId: credentials.appId || "mock",
              appSecret: credentials.appSecret || "mock",
              accessToken: credentials.accessToken || "mock",
              adAccountId: credentials.adAccountId || "mock",
            });

            const syncLog = await prisma.syncLog.create({
              data: {
                integrationId: metaIntegration.id,
                status: "in_progress",
                startedAt: new Date(),
              },
            });

            try {
              const recordsSynced = await client.syncToDatabase(company.id, metaChannel.id);

              await prisma.syncLog.update({
                where: { id: syncLog.id },
                data: {
                  status: "success",
                  recordsSynced,
                  completedAt: new Date(),
                },
              });

              await prisma.integration.update({
                where: { id: metaIntegration.id },
                data: { lastSyncedAt: new Date() },
              });

              results.metaAds.success = true;
              results.metaAds.recordsSynced += recordsSynced;
              console.log(`[Cron] Meta Ads sync completed: ${recordsSynced} records`);
            } catch (syncError: any) {
              await prisma.syncLog.update({
                where: { id: syncLog.id },
                data: {
                  status: "failed",
                  errorMessage: syncError.message,
                  completedAt: new Date(),
                },
              });
              results.metaAds.error = syncError.message;
              console.error("[Cron] Meta Ads sync failed:", syncError);
            }
          }
        } catch (error: any) {
          results.metaAds.error = error.message;
          console.error("[Cron] Meta Ads sync error:", error);
        }
      }
    }

    console.log("[Cron] Daily sync completed", results);

    return NextResponse.json({
      success: true,
      message: "Daily sync completed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Daily sync failed:", error);
    return NextResponse.json(
      { error: "Daily sync failed", details: error.message },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
