import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = "temp-company-id"; // TODO: Get from session

    const rules = await prisma.anomalyDetectionRule.findMany({
      where: { companyId },
      include: {
        channel: { select: { id: true, name: true } },
      },
      orderBy: [{ isActive: "desc" }, { severity: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, rules, count: rules.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, metric, channelId, sensitivity, windowDays, minDataPoints, severity } = body;

    if (!name || !type || !metric) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const companyId = "temp-company-id"; // TODO: Get from session

    const rule = await prisma.anomalyDetectionRule.create({
      data: {
        companyId,
        name,
        description,
        type,
        metric,
        channelId: channelId || null,
        sensitivity: sensitivity || 0.7,
        windowDays: windowDays || 30,
        minDataPoints: minDataPoints || 7,
        severity: severity || "medium",
      },
    });

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
}
