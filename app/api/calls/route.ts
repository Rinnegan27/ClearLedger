import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

/**
 * GET /api/calls
 *
 * Fetch calls with filtering, sorting, and analytics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status"); // "missed" | "answered" | "all"
    const leadQuality = searchParams.get("leadQuality"); // "hot" | "warm" | "cold" | "spam" | "all"
    const channelId = searchParams.get("channelId");

    // Build where clause
    const where: any = {
      // TODO: Add proper companyId filtering
      // companyId: session.user.companyId,
    };

    if (startDate && endDate) {
      where.callDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (leadQuality && leadQuality !== "all") {
      where.leadQuality = leadQuality;
    }

    if (channelId) {
      where.channelId = channelId;
    }

    // Fetch calls
    const calls = await prisma.call.findMany({
      where,
      orderBy: { callDate: "desc" },
      take: 100, // Limit to 100 most recent
      select: {
        id: true,
        externalId: true,
        phoneNumber: true,
        callerName: true,
        duration: true,
        status: true,
        callDate: true,
        sentiment: true,
        leadQuality: true,
        leadScore: true,
        attributedValue: true,
        transcription: true,
        recordingUrl: true,
        tags: true,
        metadata: true,
        channelId: true,
        channel: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    // Parse urgency from metadata
    const callsWithUrgency = calls.map((call) => {
      let urgency = "unknown";
      try {
        if (call.metadata) {
          const metadata =
            typeof call.metadata === "string"
              ? JSON.parse(call.metadata)
              : call.metadata;
          urgency = metadata.aiAnalysis?.urgency || "unknown";
        }
      } catch (error) {
        // Ignore JSON parse errors
      }

      return {
        ...call,
        urgency,
        channelName: call.channel?.name,
        metadata: undefined, // Don't send full metadata to client
      };
    });

    // Calculate summary statistics
    const totalCalls = callsWithUrgency.length;
    const missedCalls = callsWithUrgency.filter(
      (c) => c.status === "missed"
    ).length;
    const avgLeadScore =
      totalCalls > 0
        ? callsWithUrgency.reduce((sum, c) => sum + (c.leadScore || 0), 0) /
          totalCalls
        : 0;

    const estimatedLostRevenue = callsWithUrgency
      .filter((c) => c.status === "missed")
      .reduce((sum, c) => sum + (c.attributedValue || 0), 0);

    const highValueMissedCalls = callsWithUrgency.filter(
      (c) => c.status === "missed" && (c.leadScore || 0) > 7
    ).length;

    // Lead quality distribution
    const leadQualityDistribution: Record<string, number> = {
      hot: 0,
      warm: 0,
      cold: 0,
      spam: 0,
    };

    callsWithUrgency.forEach((call) => {
      const quality = call.leadQuality || "cold";
      if (quality in leadQualityDistribution) {
        leadQualityDistribution[quality]++;
      }
    });

    // Urgency distribution
    const urgencyDistribution: Record<string, number> = {
      immediate: 0,
      soon: 0,
      planning: 0,
      browsing: 0,
    };

    callsWithUrgency.forEach((call) => {
      const urgency = call.urgency || "browsing";
      if (urgency in urgencyDistribution) {
        urgencyDistribution[urgency]++;
      }
    });

    return NextResponse.json({
      calls: callsWithUrgency,
      summary: {
        totalCalls,
        missedCalls,
        avgLeadScore,
        estimatedLostRevenue,
        highValueMissedCalls,
        leadQualityDistribution,
        urgencyDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch calls",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
