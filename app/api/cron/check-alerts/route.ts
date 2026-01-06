/**
 * Alert Checking Cron Job
 *
 * This endpoint should be called daily at 2:15am (after the sync-daily job at 2am).
 * It checks all configured thresholds and anomaly detection rules across all companies.
 *
 * Setup for Vercel:
 * 1. Add to vercel.json:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/check-alerts",
 *        "schedule": "15 2 * * *"
 *      }]
 *    }
 *
 * Setup for other platforms:
 * - Use external cron service (cron-job.org, EasyCron, etc.)
 * - Schedule: 15 2 * * * (daily at 2:15am)
 * - URL: https://your-domain.com/api/cron/check-alerts
 * - Add Authorization header with CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAllCompanies } from "@/lib/alerts/alert-checker";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting alert checking...");
    const startTime = Date.now();

    const results = await checkAllCompanies();

    const duration = Date.now() - startTime;

    console.log(
      `[Cron] Alert checking completed in ${duration}ms:`,
      `${results.companies} companies,`,
      `${results.totalThresholdsTriggered} threshold violations,`,
      `${results.totalAnomaliesDetected} anomalies detected`
    );

    return NextResponse.json({
      success: true,
      message: "Alert checking completed",
      results: {
        companiesChecked: results.companies,
        thresholdsTriggered: results.totalThresholdsTriggered,
        anomaliesDetected: results.totalAnomaliesDetected,
        duration: `${duration}ms`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Alert checking failed:", error);
    return NextResponse.json(
      {
        error: "Alert checking failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
