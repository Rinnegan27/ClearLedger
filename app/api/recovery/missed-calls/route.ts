import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { analyzeMissedCalls } from "@/lib/recovery/missed-call-analyzer";
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
    const days = parseInt(searchParams.get("days") || "30");

    const analysis = await analyzeMissedCalls(companyUser.companyId, days);

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Failed to analyze missed calls:", error);
    return NextResponse.json(
      { error: "Failed to analyze missed calls", details: error.message },
      { status: 500 }
    );
  }
}
