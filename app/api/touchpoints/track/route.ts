import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  trackTouchpoint,
  trackGoogleAdsClick,
  trackMetaAdsClick,
  trackCall,
  trackBooking,
  trackWebsiteVisit,
  type TouchPointData,
} from "@/lib/integrations/touchpoint-tracker";

/**
 * POST /api/touchpoints/track
 *
 * Track a touchpoint in the customer journey.
 * Can be called from webhooks, client-side tracking, or integrations.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    // Validate required fields
    if (!data.companyId || !data.channelId) {
      return NextResponse.json(
        { error: "companyId and channelId are required" },
        { status: 400 }
      );
    }

    // Track based on type
    switch (type) {
      case "google_ads_click":
        await trackGoogleAdsClick(
          data.companyId,
          data.channelId,
          data.campaignId,
          data.gclid,
          data.utmParams,
          data.customerEmail
        );
        break;

      case "meta_ads_click":
        await trackMetaAdsClick(
          data.companyId,
          data.channelId,
          data.campaignId,
          data.fbclid,
          data.utmParams,
          data.customerEmail
        );
        break;

      case "call":
        await trackCall(
          data.companyId,
          data.channelId,
          data.customerPhone,
          data.callerName,
          data.duration,
          data.callDate ? new Date(data.callDate) : undefined,
          data.utmParams
        );
        break;

      case "booking":
        await trackBooking(
          data.companyId,
          data.channelId,
          data.bookingId,
          data.customerEmail,
          data.customerPhone,
          data.utmParams
        );
        break;

      case "website_visit":
        await trackWebsiteVisit(
          data.companyId,
          data.channelId,
          data.utmParams,
          data.sessionId,
          data.customerEmail
        );
        break;

      case "custom":
        // Generic touchpoint tracking
        const touchpointData: TouchPointData = {
          companyId: data.companyId,
          channelId: data.channelId,
          campaignId: data.campaignId,
          touchpointType: data.touchpointType,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          bookingId: data.bookingId,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          utmParams: data.utmParams,
          clickId: data.clickId,
          metadata: data.metadata,
        };
        await trackTouchpoint(touchpointData);
        break;

      default:
        return NextResponse.json(
          {
            error: `Unknown touchpoint type: ${type}. Valid types: google_ads_click, meta_ads_click, call, booking, website_visit, custom`
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Touchpoint tracked successfully"
    });
  } catch (error) {
    console.error("Error tracking touchpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to track touchpoint",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
