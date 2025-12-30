import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

/**
 * GET /api/integrations/channels
 *
 * Fetch all marketing channels for the company
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Get actual company ID from session
    const companyId = "temp-company-id";

    const channels = await prisma.marketingChannel.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      channels,
      total: channels.length,
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch channels",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
