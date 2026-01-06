/**
 * Automated Report Sending Cron Job
 *
 * This endpoint should be called:
 * - Weekly: Every Monday at 9:00 AM
 * - Monthly: 1st of each month at 9:00 AM
 *
 * Setup for Vercel:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-reports",
 *     "schedule": "0 9 * * 1"  // Every Monday at 9am for weekly reports
 *   }, {
 *     "path": "/api/cron/send-reports?period=monthly",
 *     "schedule": "0 9 1 * *"  // 1st of month at 9am for monthly reports
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { generateAllReports } from "@/lib/insights/report-generator";
import { sendCompanyReport } from "@/lib/insights/email-sender";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") || "weekly") as "weekly" | "monthly";

    console.log(`[Cron] Starting ${period} report generation...`);
    const startTime = Date.now();

    // Generate reports for all companies
    const reports = await generateAllReports(period);

    // Send emails
    const emailResults = await Promise.all(
      reports.map(async (report) => {
        const company = await prisma.company.findUnique({
          where: { id: report.companyId },
          select: { name: true },
        });

        if (!company) {
          return { companyId: report.companyId, success: false, error: "Company not found" };
        }

        const result = await sendCompanyReport(report, company.name);
        return {
          companyId: report.companyId,
          companyName: company.name,
          ...result,
        };
      })
    );

    const duration = Date.now() - startTime;
    const successCount = emailResults.filter(r => r.success).length;
    const failureCount = emailResults.filter(r => !r.success).length;

    console.log(
      `[Cron] Report sending completed in ${duration}ms:`,
      `${reports.length} reports generated,`,
      `${successCount} emails sent,`,
      `${failureCount} failures`
    );

    return NextResponse.json({
      success: true,
      message: `${period} report sending completed`,
      results: {
        reportsGenerated: reports.length,
        emailsSent: successCount,
        emailsFailed: failureCount,
        duration: `${duration}ms`,
        details: emailResults,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Report sending failed:", error);
    return NextResponse.json(
      {
        error: "Report sending failed",
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
