import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check if new tables exist
    const alertThresholds = await prisma.alertThreshold.findMany({ take: 1 });
    const anomalyRules = await prisma.anomalyDetectionRule.findMany({ take: 1 });
    const alertEvents = await prisma.alertEvent.findMany({ take: 1 });

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      tables: {
        alertThresholds: "exists",
        anomalyRules: "exists",
        alertEvents: "exists",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
