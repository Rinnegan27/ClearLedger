import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  calculateBulkAttribution,
  getAttributionSummary,
  compareAttributionModels,
} from "@/lib/attribution/engine";
import type { AttributionModel } from "@/lib/attribution/models";
import prisma from "@/lib/db";

/**
 * GET /api/attribution/calculate
 *
 * Fetch attribution data (summary only, doesn't recalculate)
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
    const model = searchParams.get("model");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const validModels: AttributionModel[] = [
      "first-touch",
      "last-touch",
      "linear",
      "time-decay",
      "position-based",
    ];

    const attributionModel = (model as AttributionModel) || "time-decay";

    if (!validModels.includes(attributionModel)) {
      return NextResponse.json(
        { error: `Invalid attribution model. Must be one of: ${validModels.join(", ")}` },
        { status: 400 }
      );
    }

    // TODO: Get actual company ID from session
    const companyId = "temp-company-id";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get summary by channel (read-only, doesn't update DB)
    const channelSummary = await getAttributionSummary(
      companyId,
      start,
      end,
      attributionModel
    );

    // Calculate totals from channel summary
    const totalRevenue = Object.values(channelSummary).reduce((sum, ch) => sum + ch.revenue, 0);
    const channels = Object.entries(channelSummary).map(([id, data]) => ({
      channelId: id,
      ...data
    }));

    return NextResponse.json({
      model: attributionModel,
      totalRevenue,
      channels,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error("Error fetching attribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch attribution data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attribution/calculate
 *
 * Recalculate attribution for all bookings in date range
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { startDate, endDate, model, compareModels } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const validModels: AttributionModel[] = [
      "first-touch",
      "last-touch",
      "linear",
      "time-decay",
      "position-based",
    ];

    if (model && !validModels.includes(model)) {
      return NextResponse.json(
        { error: `Invalid attribution model. Must be one of: ${validModels.join(", ")}` },
        { status: 400 }
      );
    }

    // TODO: Get actual company ID from session
    const companyId = "temp-company-id"; // Replace with actual logic

    const start = new Date(startDate);
    const end = new Date(endDate);
    const attributionModel = (model as AttributionModel) || "last-touch";

    // Calculate attribution for all bookings in date range
    const bulkResults = await calculateBulkAttribution(
      companyId,
      start,
      end,
      attributionModel
    );

    // Get summary by channel
    const channelSummary = await getAttributionSummary(
      companyId,
      start,
      end,
      attributionModel
    );

    // Compare all attribution models if requested
    let modelComparison = null;
    if (compareModels) {
      modelComparison = await compareAttributionModels(companyId, start, end);
    }

    // Convert channel summary to array format
    const channels = Object.entries(channelSummary).map(([id, data]) => ({
      channelId: id,
      ...data
    }));

    return NextResponse.json({
      model: attributionModel,
      bookingsProcessed: bulkResults.bookingsProcessed,
      totalRevenue: bulkResults.totalRevenue,
      channels,
      modelComparison,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error("Error calculating attribution:", error);
    return NextResponse.json(
      { error: "Failed to calculate attribution" },
      { status: 500 }
    );
  }
}
