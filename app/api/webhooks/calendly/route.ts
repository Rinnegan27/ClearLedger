import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { trackBooking } from "@/lib/integrations/touchpoint-tracker";
import { createNotification } from "@/lib/notifications/create";
import crypto from "crypto";

/**
 * POST /api/webhooks/calendly
 *
 * Handle incoming webhooks from Calendly for booking events.
 * Tracks touchpoints and creates/updates bookings.
 *
 * Calendly Webhook Documentation:
 * https://developer.calendly.com/api-docs/docs/webhooks-overview
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("calendly-webhook-signature");
    const payload = await req.text();

    // Verify webhook signature
    if (!verifyCalendlySignature(payload, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);

    // Handle different event types
    switch (event.event) {
      case "invitee.created":
        return await handleInviteeCreated(event.payload);

      case "invitee.canceled":
        return await handleInviteeCanceled(event.payload);

      default:
        console.log(`Unhandled Calendly event type: ${event.event}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("Error processing Calendly webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle new booking (invitee.created)
 */
async function handleInviteeCreated(payload: any) {
  const {
    event,
    invitee,
    questions_and_answers: questionsAndAnswers,
    tracking,
  } = payload;

  // Extract customer information
  const customerName = invitee.name;
  const customerEmail = invitee.email;
  const scheduledTime = new Date(event.start_time);
  const eventType = event.name;
  const externalId = invitee.uri; // Calendly's unique identifier

  // Extract UTM parameters from tracking
  const utmParams = tracking?.utm_source
    ? {
        source: tracking.utm_source,
        medium: tracking.utm_medium,
        campaign: tracking.utm_campaign,
        content: tracking.utm_content,
        term: tracking.utm_term,
      }
    : undefined;

  // Extract phone number from questions if available
  let customerPhone: string | null = null;
  if (questionsAndAnswers && Array.isArray(questionsAndAnswers)) {
    const phoneQuestion = questionsAndAnswers.find(
      (qa: any) =>
        qa.question.toLowerCase().includes("phone") ||
        qa.question.toLowerCase().includes("number")
    );
    if (phoneQuestion) {
      customerPhone = phoneQuestion.answer;
    }
  }

  // TODO: Map to actual company/channel
  const companyId = "temp-company-id";
  let channelId = "temp-channel-id";

  // Try to find channel based on UTM source
  if (utmParams?.source) {
    const channel = await prisma.marketingChannel.findFirst({
      where: {
        companyId,
        OR: [
          { name: { contains: utmParams.source, mode: "insensitive" } },
          { type: { contains: utmParams.source, mode: "insensitive" } },
        ],
      },
    });
    if (channel) {
      channelId = channel.id;
    }
  }

  // Create or update booking
  const booking = await prisma.booking.upsert({
    where: { externalId: externalId },
    update: {
      customerName,
      customerEmail,
      customerPhone,
      serviceName: eventType,
      scheduledDate: scheduledTime,
      status: "SCHEDULED",
      metadata: JSON.stringify({
        calendlyEventUri: event.uri,
        eventType,
        tracking: utmParams,
        questionsAndAnswers,
      }),
    },
    create: {
      companyId,
      channelId,
      externalId,
      customerName,
      customerEmail,
      customerPhone,
      serviceName: eventType,
      bookingDate: new Date(),
      scheduledDate: scheduledTime,
      status: "SCHEDULED",
      metadata: JSON.stringify({
        calendlyEventUri: event.uri,
        eventType,
        tracking: utmParams,
        questionsAndAnswers,
      }),
    },
  });

  // Track touchpoint for attribution
  await trackBooking(
    companyId,
    channelId,
    booking.id,
    customerEmail,
    customerPhone || undefined,
    utmParams
  );

  // Send notification to user
  // TODO: Get actual user ID
  const userId = "temp-user-id";
  const estimatedRevenue = 1200; // Could be based on event type

  await createNotification(userId, {
    type: "booking",
    title: "New Booking Confirmed",
    message: `${customerName} booked ${eventType} for ${scheduledTime.toLocaleDateString()}`,
    data: {
      bookingId: booking.id,
      customerName,
      customerEmail,
      eventType,
      scheduledTime: scheduledTime.toISOString(),
      estimatedRevenue,
    },
  });

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    tracked: true,
  });
}

/**
 * Handle canceled booking (invitee.canceled)
 */
async function handleInviteeCanceled(payload: any) {
  const { invitee } = payload;
  const externalId = invitee.uri;

  // Update booking status
  const booking = await prisma.booking.updateMany({
    where: { externalId },
    data: { status: "CANCELED" },
  });

  if (booking.count > 0) {
    console.log(`✓ Booking ${externalId} marked as canceled`);
  }

  return NextResponse.json({
    success: true,
    canceled: booking.count > 0,
  });
}

/**
 * Verify Calendly webhook signature
 */
function verifyCalendlySignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) {
    console.warn("No Calendly webhook signature provided");
    return true; // Temporarily allow unsigned requests in development
  }

  const webhookSecret = process.env.CALENDLY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("CALENDLY_WEBHOOK_SECRET not configured");
    return true; // Allow in development
  }

  // Calendly uses HMAC-SHA256 for signing
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
