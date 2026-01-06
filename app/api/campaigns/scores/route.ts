import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { scoreCampaigns } from "@/lib/scoring/campaign-scorer";
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
    const months = parseInt(searchParams.get("months") || "1");

    const scores = await scoreCampaigns(companyUser.companyId, months);

    return NextResponse.json({ success: true, scores });
  } catch (error: any) {
    console.error("Failed to score campaigns:", error);
    return NextResponse.json(
      { error: "Failed to score campaigns", details: error.message },
      { status: 500 }
    );
  }
}
