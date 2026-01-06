import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const rule = await prisma.anomalyDetectionRule.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.anomalyDetectionRule.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Rule deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
