import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  calculateBulkAttribution,
  getAttributionSummary,
  compareAttributionModels,
  type AttributionModel,
} from "@/lib/attribution/engine";
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
    const summary = await getAttributionSummary(
      companyId,
      start,
      end,
      attributionModel
    );

    return NextResponse.json({
      model: attributionModel,
      totalRevenue: summary.totalRevenue,
      bookingsAttributed: summary.bookings.length,
      avgTouchpoints: summary.avgTouchpoints,
      channels: summary.channels,
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
    const attributionResults = await calculateBulkAttribution(
      companyId,
      start,
      end,
      attributionModel
    );

    // Get summary by channel
    const summary = await getAttributionSummary(
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

    // Update bookings with attribution data
    let bookingsUpdated = 0;
    for (const result of attributionResults) {
      await prisma.booking.update({
        where: { id: result.bookingId },
        data: {
          attributionModel,
          attributionData: JSON.stringify(result.attribution),
        },
      });
      bookingsUpdated++;
    }

    return NextResponse.json({
      model: attributionModel,
      summary,
      modelComparison,
      bookingsAttributed: bookingsUpdated,
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
