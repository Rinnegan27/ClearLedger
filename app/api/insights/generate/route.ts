import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { generateInsightReport } from "@/lib/insights/report-generator";
import { sendCompanyReport } from "@/lib/insights/email-sender";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company
    const companyUser = await prisma.companyUser.findFirst({
      where: { userId: session.user.id },
      include: { company: true },
    });

    if (!companyUser) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    const body = await req.json();
    const period = (body.period || "weekly") as "weekly" | "monthly";
    const sendEmail = body.sendEmail === true;

    // Generate report
    const report = await generateInsightReport(companyUser.companyId, period);

    // Optionally send email
    let emailResult = null;
    if (sendEmail) {
      emailResult = await sendCompanyReport(report, companyUser.company.name);
    }

    return NextResponse.json({
      success: true,
      report,
      emailSent: emailResult?.success || false,
      emailError: emailResult?.error,
    });
  } catch (error: any) {
    console.error("Failed to generate insight report:", error);
    return NextResponse.json(
      { error: "Failed to generate report", details: error.message },
      { status: 500 }
    );
  }
}
