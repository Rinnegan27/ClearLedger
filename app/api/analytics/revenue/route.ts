import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  calculateAllChannelRevenue,
  calculateRevenueSummary,
  calculatePeriodComparison,
} from "@/lib/analytics/revenue-calculator";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get company ID from user's companies (assuming first company for now)
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const compareStartDate = searchParams.get("compareStartDate");
    const compareEndDate = searchParams.get("compareEndDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // TODO: Get actual company ID from session
    const companyId = "temp-company-id"; // Replace with actual logic

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate revenue for all channels
    const channels = await calculateAllChannelRevenue(companyId, start, end);

    // Calculate summary
    const summary = await calculateRevenueSummary(companyId, start, end);

    // Calculate period comparison if comparison dates provided
    let comparison = null;
    if (compareStartDate && compareEndDate) {
      comparison = await calculatePeriodComparison(
        companyId,
        start,
        end,
        new Date(compareStartDate),
        new Date(compareEndDate)
      );
    }

    return NextResponse.json({
      summary,
      channels,
      comparison,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    return NextResponse.json(
      { error: "Failed to calculate revenue" },
      { status: 500 }
    );
  }
}
