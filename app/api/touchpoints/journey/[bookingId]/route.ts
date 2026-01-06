import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getCustomerJourney,
  getBookingTouchpoints,
} from "@/lib/integrations/touchpoint-tracker";

/**
 * GET /api/touchpoints/journey/[bookingId]
 *
 * Get the complete customer journey for a specific booking.
 * Returns all touchpoints in chronological order with analytics.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    // Get customer journey summary
    const journey = await getCustomerJourney(bookingId);

    // Get detailed touchpoints
    const touchpoints = await getBookingTouchpoints(bookingId);

    return NextResponse.json({
      bookingId,
      journey,
      touchpoints,
    });
  } catch (error) {
    console.error("Error retrieving customer journey:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve customer journey",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
