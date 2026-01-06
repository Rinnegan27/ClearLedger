import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the event belongs to user's company
    const event = await prisma.alertEvent.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            users: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Alert event not found" }, { status: 404 });
    }

    if (event.company.users.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark as acknowledged
    const updatedEvent = await prisma.alertEvent.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: session.user.id,
      },
    });

    // Also mark the notification as read if it exists
    if (event.notificationId) {
      await prisma.notification.update({
        where: { id: event.notificationId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error("Failed to acknowledge alert:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge alert" },
      { status: 500 }
    );
  }
}
