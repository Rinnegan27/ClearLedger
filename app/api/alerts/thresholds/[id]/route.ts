import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

/**
 * PATCH /api/alerts/thresholds/[id]
 * Update an alert threshold
 */
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

    // TODO: Verify threshold belongs to user's company

    const threshold = await prisma.alertThreshold.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      threshold,
    });
  } catch (error) {
    console.error("Error updating alert threshold:", error);
    return NextResponse.json(
      { error: "Failed to update alert threshold" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/thresholds/[id]
 * Delete an alert threshold
 */
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

    // TODO: Verify threshold belongs to user's company

    await prisma.alertThreshold.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Alert threshold deleted",
    });
  } catch (error) {
    console.error("Error deleting alert threshold:", error);
    return NextResponse.json(
      { error: "Failed to delete alert threshold" },
      { status: 500 }
    );
  }
}
