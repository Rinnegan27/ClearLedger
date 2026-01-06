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

    // Get user's company
    const companyUser = await prisma.companyUser.findFirst({
      where: { userId: session.user.id },
    });

    if (!companyUser) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const acknowledged = searchParams.get("acknowledged");
    const severity = searchParams.get("severity");

    // Build where clause
    const where: any = { companyId: companyUser.companyId };

    if (acknowledged !== null) {
      where.acknowledged = acknowledged === "true";
    }

    if (severity) {
      where.severity = severity;
    }

    const events = await prisma.alertEvent.findMany({
      where,
      include: {
        threshold: {
          select: { name: true, metric: true },
        },
        anomalyRule: {
          select: { name: true, type: true },
        },
        channel: {
          select: { name: true },
        },
        campaign: {
          select: { name: true },
        },
      },
      orderBy: [
        { acknowledged: "asc" },
        { dateTriggered: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Failed to fetch alert history:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert history" },
      { status: 500 }
    );
  }
}
