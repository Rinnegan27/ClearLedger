import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

/**
 * GET /api/alerts/thresholds
 * Fetch all alert thresholds for the user's company
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Get actual company ID from session
    const companyId = "temp-company-id";

    const thresholds = await prisma.alertThreshold.findMany({
      where: { companyId },
      include: {
        channel: {
          select: { id: true, name: true },
        },
        campaign: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isActive: "desc" }, { severity: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      thresholds,
      count: thresholds.length,
    });
  } catch (error) {
    console.error("Error fetching alert thresholds:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert thresholds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/thresholds
 * Create a new alert threshold
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      metric,
      channelId,
      campaignId,
      operator,
      threshold,
      lookbackDays,
      severity,
      notifyEmail,
      notifyInApp,
    } = body;

    // Validate required fields
    if (!name || !metric || !operator || threshold === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Get actual company ID from session
    const companyId = "temp-company-id";

    const alertThreshold = await prisma.alertThreshold.create({
      data: {
        companyId,
        name,
        description,
        metric,
        channelId: channelId || null,
        campaignId: campaignId || null,
        operator,
        threshold,
        lookbackDays: lookbackDays || 1,
        severity: severity || "medium",
        notifyEmail: notifyEmail !== false,
        notifyInApp: notifyInApp !== false,
      },
    });

    return NextResponse.json({
      success: true,
      threshold: alertThreshold,
    });
  } catch (error) {
    console.error("Error creating alert threshold:", error);
    return NextResponse.json(
      { error: "Failed to create alert threshold" },
      { status: 500 }
    );
  }
}
