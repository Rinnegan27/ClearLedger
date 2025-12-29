import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications/create";
import prisma from "@/lib/db";

/**
 * Test endpoint to create notifications
 * In production, this would be called by webhook events from CallRail, Calendly, etc.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, userId } = body;

    // Get user or use first user for testing
    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    // Create notification based on type
    let notification;

    switch (type) {
      case "missed_call":
        notification = await createNotification({
          userId: user.id,
          type: "missed_call",
          title: "Missed Call Alert",
          message: `Missed call from (555) 123-4567 at ${new Date().toLocaleTimeString()}`,
          data: {
            phoneNumber: "(555) 123-4567",
            estimatedValue: 500,
            callDate: new Date().toISOString(),
          },
        });
        break;

      case "booking":
        notification = await createNotification({
          userId: user.id,
          type: "booking",
          title: "New Booking Confirmed",
          message: "John Doe booked Consultation for tomorrow at 2:00 PM",
          data: {
            customerName: "John Doe",
            service: "Consultation",
            scheduledTime: new Date(Date.now() + 86400000).toISOString(),
            estimatedRevenue: 1200,
          },
        });
        break;

      case "campaign_alert":
        notification = await createNotification({
          userId: user.id,
          type: "campaign_alert",
          title: "Budget Exceeded",
          message: "Campaign 'Summer Sale' exceeded budget by 15%",
          data: {
            campaignName: "Summer Sale",
            budget: 1000,
            spend: 1150,
            overspend: 150,
          },
        });
        break;

      case "sync_failure":
        notification = await createNotification({
          userId: user.id,
          type: "sync_failure",
          title: "Google Ads Sync Failed",
          message: "Failed to sync data: Authentication error",
          data: {
            integration: "Google Ads",
            error: "Authentication error",
            lastSync: new Date().toISOString(),
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
