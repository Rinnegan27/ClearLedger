/**
 * TouchPoint Tracker
 *
 * Unified system for tracking customer journey touchpoints across all marketing channels.
 * This is critical for multi-touch attribution to work correctly.
 */

import prisma from "@/lib/db";

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface TouchPointData {
  // Booking identification (one of these is required)
  bookingId?: string;
  customerPhone?: string;
  customerEmail?: string;

  // Touchpoint details
  companyId: string;
  channelId: string;
  campaignId?: string;
  touchpointType: "ad_click" | "call" | "booking_request" | "website_visit" | "email_click" | "social_click";
  timestamp: Date;

  // UTM parameters (from URL tracking)
  utmParams?: UTMParams;

  // Click IDs (for platform-specific attribution)
  clickId?: string; // GCLID (Google), FBCLID (Facebook), etc.

  // Additional metadata
  metadata?: Record<string, any>;
}

/**
 * Find or create a booking based on customer contact information
 */
async function findOrCreateBooking(
  companyId: string,
  channelId: string,
  customerPhone?: string,
  customerEmail?: string
): Promise<string> {
  // Try to find existing booking by phone or email
  if (customerPhone || customerEmail) {
    const whereConditions: any = {
      companyId,
      OR: []
    };

    if (customerPhone) {
      whereConditions.OR.push({ customerPhone });
    }
    if (customerEmail) {
      whereConditions.OR.push({ customerEmail });
    }

    const existingBooking = await prisma.booking.findFirst({
      where: whereConditions,
      orderBy: { createdAt: "desc" }
    });

    if (existingBooking) {
      return existingBooking.id;
    }
  }

  // Create a pending booking to track this customer journey
  const newBooking = await prisma.booking.create({
    data: {
      companyId,
      channelId,
      customerName: "Unknown", // Will be updated when more info is available
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      serviceName: "Unknown", // Will be updated later
      bookingDate: new Date(),
      scheduledDate: new Date(), // Placeholder
      status: "PENDING",
    }
  });

  return newBooking.id;
}

/**
 * Track a touchpoint in the customer journey
 *
 * This is the main function called by all integration points (ads, calls, bookings, etc.)
 */
export async function trackTouchpoint(data: TouchPointData): Promise<void> {
  try {
    // Get or create booking ID
    let bookingId = data.bookingId;

    if (!bookingId) {
      bookingId = await findOrCreateBooking(
        data.companyId,
        data.channelId,
        data.customerPhone,
        data.customerEmail
      );
    }

    // Create the touchpoint record
    await prisma.touchPoint.create({
      data: {
        bookingId,
        channelId: data.channelId,
        campaignId: data.campaignId || null,
        touchpointType: data.touchpointType,
        timestamp: data.timestamp,
        utmSource: data.utmParams?.source || null,
        utmMedium: data.utmParams?.medium || null,
        utmCampaign: data.utmParams?.campaign || null,
        utmContent: data.utmParams?.content || null,
        utmTerm: data.utmParams?.term || null,
        clickId: data.clickId || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      }
    });

    // Update booking with first/last touch channel if needed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { touchpoints: { orderBy: { timestamp: "asc" } } }
    });

    if (booking) {
      const firstTouch = booking.touchpoints[0];
      const lastTouch = booking.touchpoints[booking.touchpoints.length - 1];

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          firstTouchChannelId: firstTouch?.channelId || data.channelId,
          lastTouchChannelId: lastTouch?.channelId || data.channelId,
        }
      });
    }

    console.log(`✓ Tracked touchpoint: ${data.touchpointType} for booking ${bookingId}`);
  } catch (error) {
    console.error("Error tracking touchpoint:", error);
    throw error;
  }
}

/**
 * Track a Google Ads click
 */
export async function trackGoogleAdsClick(
  companyId: string,
  channelId: string,
  campaignId: string,
  gclid: string,
  utmParams?: UTMParams,
  customerEmail?: string
): Promise<void> {
  return trackTouchpoint({
    companyId,
    channelId,
    campaignId,
    touchpointType: "ad_click",
    timestamp: new Date(),
    clickId: gclid,
    utmParams,
    customerEmail,
    metadata: {
      platform: "google_ads",
      gclid
    }
  });
}

/**
 * Track a Meta Ads (Facebook/Instagram) click
 */
export async function trackMetaAdsClick(
  companyId: string,
  channelId: string,
  campaignId: string,
  fbclid: string,
  utmParams?: UTMParams,
  customerEmail?: string
): Promise<void> {
  return trackTouchpoint({
    companyId,
    channelId,
    campaignId,
    touchpointType: "ad_click",
    timestamp: new Date(),
    clickId: fbclid,
    utmParams,
    customerEmail,
    metadata: {
      platform: "meta_ads",
      fbclid
    }
  });
}

/**
 * Track a phone call (from CallRail)
 */
export async function trackCall(
  companyId: string,
  channelId: string,
  customerPhone: string,
  callerName?: string,
  duration?: number,
  callDate?: Date,
  utmParams?: UTMParams
): Promise<void> {
  return trackTouchpoint({
    companyId,
    channelId,
    touchpointType: "call",
    timestamp: callDate || new Date(),
    customerPhone,
    utmParams,
    metadata: {
      callerName,
      duration,
      platform: "callrail"
    }
  });
}

/**
 * Track a booking (from Calendly or manual entry)
 */
export async function trackBooking(
  companyId: string,
  channelId: string,
  bookingId: string,
  customerEmail?: string,
  customerPhone?: string,
  utmParams?: UTMParams
): Promise<void> {
  return trackTouchpoint({
    companyId,
    channelId,
    bookingId,
    touchpointType: "booking_request",
    timestamp: new Date(),
    customerEmail,
    customerPhone,
    utmParams,
    metadata: {
      platform: "calendly"
    }
  });
}

/**
 * Track a website visit (for organic/direct traffic)
 */
export async function trackWebsiteVisit(
  companyId: string,
  channelId: string,
  utmParams?: UTMParams,
  sessionId?: string,
  customerEmail?: string
): Promise<void> {
  return trackTouchpoint({
    companyId,
    channelId,
    touchpointType: "website_visit",
    timestamp: new Date(),
    utmParams,
    customerEmail,
    metadata: {
      sessionId,
      referrer: utmParams?.source || "direct"
    }
  });
}

/**
 * Batch track multiple touchpoints at once
 * Useful for historical data import or bulk processing
 */
export async function trackTouchpointBatch(
  touchpoints: TouchPointData[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const touchpoint of touchpoints) {
    try {
      await trackTouchpoint(touchpoint);
      success++;
    } catch (error) {
      console.error(`Failed to track touchpoint:`, error);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Get all touchpoints for a specific booking
 */
export async function getBookingTouchpoints(bookingId: string) {
  return prisma.touchPoint.findMany({
    where: { bookingId },
    orderBy: { timestamp: "asc" },
    include: {
      channel: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      campaign: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

/**
 * Get customer journey summary
 * Shows the complete path from first touch to conversion
 */
export async function getCustomerJourney(bookingId: string) {
  const touchpoints = await getBookingTouchpoints(bookingId);

  return {
    touchpointCount: touchpoints.length,
    firstTouch: touchpoints[0],
    lastTouch: touchpoints[touchpoints.length - 1],
    timeline: touchpoints.map(tp => ({
      timestamp: tp.timestamp,
      channel: tp.channel.name,
      type: tp.touchpointType,
      campaign: tp.campaign?.name,
      utmSource: tp.utmSource,
      utmMedium: tp.utmMedium
    })),
    channels: [...new Set(touchpoints.map(tp => tp.channel.name))],
    avgTimeBetweenTouches: touchpoints.length > 1
      ? (touchpoints[touchpoints.length - 1].timestamp.getTime() - touchpoints[0].timestamp.getTime()) / (touchpoints.length - 1)
      : 0
  };
}
