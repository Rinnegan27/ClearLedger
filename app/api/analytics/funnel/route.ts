import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  calculateFunnel,
  compareFunnelsByChannel,
  calculateTimeToConvert,
} from "@/lib/analytics/funnel-calculator";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const channelId = searchParams.get("channelId");
    const compareChannels = searchParams.get("compareChannels") === "true";

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

    // Calculate overall funnel
    const funnel = await calculateFunnel(
      companyId,
      start,
      end,
      channelId || null
    );

    // Calculate time to convert metrics
    const timeMetrics = await calculateTimeToConvert(
      companyId,
      start,
      end
    );

    // Compare funnels by channel if requested
    let channelComparison = null;
    if (compareChannels) {
      channelComparison = await compareFunnelsByChannel(companyId, start, end);
    }

    return NextResponse.json({
      funnel,
      timeMetrics,
      channelComparison,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error("Error calculating funnel:", error);
    return NextResponse.json(
      { error: "Failed to calculate funnel" },
      { status: 500 }
    );
  }
}
