import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { trackTouchpoint } from "@/lib/integrations/touchpoint-tracker";
import crypto from "crypto";

/**
 * POST /api/webhooks/shopify
 *
 * Handle incoming webhooks from Shopify for order tracking.
 * Tracks revenue attribution from e-commerce orders.
 *
 * Shopify Webhook Documentation:
 * https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-shopify-hmac-sha256");
    const shopifyTopic = req.headers.get("x-shopify-topic");
    const payload = await req.text();

    // Verify webhook signature
    if (!verifyShopifySignature(payload, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const data = JSON.parse(payload);

    // Handle different webhook topics
    switch (shopifyTopic) {
      case "orders/create":
        return await handleOrderCreate(data);

      case "orders/paid":
        return await handleOrderPaid(data);

      case "orders/cancelled":
        return await handleOrderCancelled(data);

      default:
        console.log(`Unhandled Shopify topic: ${shopifyTopic}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("Error processing Shopify webhook:", error);
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
 * Handle new order (orders/create)
 */
async function handleOrderCreate(order: any) {
  const {
    id: shopifyOrderId,
    email: customerEmail,
    customer,
    total_price: totalPrice,
    subtotal_price: subtotalPrice,
    total_tax: totalTax,
    created_at: createdAt,
    line_items: lineItems,
    landing_site: landingSite,
    referring_site: referringSite,
    source_name: sourceName,
  } = order;

  // Extract UTM parameters from landing site or notes
  const utmParams = extractUTMFromURL(landingSite || referringSite);

  // TODO: Map to actual company/channel
  const companyId = "temp-company-id";
  let channelId = "temp-channel-id";

  // Try to find channel based on UTM source or referrer
  if (utmParams?.source || referringSite) {
    const source = utmParams?.source || extractDomain(referringSite);
    const channel = await prisma.marketingChannel.findFirst({
      where: {
        companyId,
        OR: [
          { name: { contains: source, mode: "insensitive" } },
          { type: { contains: source, mode: "insensitive" } },
        ],
      },
    });
    if (channel) {
      channelId = channel.id;
    }
  }

  // Create booking for this order
  const booking = await prisma.booking.upsert({
    where: { externalId: String(shopifyOrderId) },
    update: {
      customerName: customer?.first_name
        ? `${customer.first_name} ${customer.last_name || ""}`.trim()
        : "Shopify Customer",
      customerEmail: customerEmail || customer?.email,
      customerPhone: customer?.phone || null,
      serviceName: lineItems
        ?.map((item: any) => item.name)
        .join(", ")
        .substring(0, 255) || "Shopify Order",
      status: "SCHEDULED", // Will update to COMPLETED when paid
      revenue: parseFloat(totalPrice),
      metadata: JSON.stringify({
        shopifyOrderId,
        subtotalPrice,
        totalTax,
        lineItems,
        landingSite,
        referringSite,
        sourceName,
        utmParams,
      }),
    },
    create: {
      companyId,
      channelId,
      externalId: String(shopifyOrderId),
      customerName: customer?.first_name
        ? `${customer.first_name} ${customer.last_name || ""}`.trim()
        : "Shopify Customer",
      customerEmail: customerEmail || customer?.email,
      customerPhone: customer?.phone || null,
      serviceName: lineItems
        ?.map((item: any) => item.name)
        .join(", ")
        .substring(0, 255) || "Shopify Order",
      bookingDate: new Date(createdAt),
      scheduledDate: new Date(createdAt),
      status: "SCHEDULED",
      revenue: parseFloat(totalPrice),
      metadata: JSON.stringify({
        shopifyOrderId,
        subtotalPrice,
        totalTax,
        lineItems,
        landingSite,
        referringSite,
        sourceName,
        utmParams,
      }),
    },
  });

  // Track touchpoint for attribution
  await trackTouchpoint({
    companyId,
    channelId,
    bookingId: booking.id,
    touchpointType: "booking_request",
    timestamp: new Date(createdAt),
    customerEmail: customerEmail || customer?.email,
    customerPhone: customer?.phone,
    utmParams,
    metadata: {
      platform: "shopify",
      shopifyOrderId,
      totalPrice,
      referringSite,
    },
  });

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    tracked: true,
  });
}

/**
 * Handle order paid (orders/paid)
 */
async function handleOrderPaid(order: any) {
  const { id: shopifyOrderId, total_price: totalPrice } = order;

  // Update booking to COMPLETED with revenue
  await prisma.booking.updateMany({
    where: { externalId: String(shopifyOrderId) },
    data: {
      status: "COMPLETED",
      completedDate: new Date(),
      revenue: parseFloat(totalPrice),
    },
  });

  console.log(`✓ Shopify order ${shopifyOrderId} marked as paid`);

  return NextResponse.json({ success: true });
}

/**
 * Handle order cancelled (orders/cancelled)
 */
async function handleOrderCancelled(order: any) {
  const { id: shopifyOrderId } = order;

  // Update booking to CANCELED
  await prisma.booking.updateMany({
    where: { externalId: String(shopifyOrderId) },
    data: { status: "CANCELED" },
  });

  console.log(`✓ Shopify order ${shopifyOrderId} marked as canceled`);

  return NextResponse.json({ success: true });
}

/**
 * Extract UTM parameters from URL
 */
function extractUTMFromURL(url: string | null): {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
} | undefined {
  if (!url) return undefined;

  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    const content = params.get("utm_content");
    const term = params.get("utm_term");

    if (!source) return undefined;

    return {
      source: source || undefined,
      medium: medium || undefined,
      campaign: campaign || undefined,
      content: content || undefined,
      term: term || undefined,
    };
  } catch {
    return undefined;
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string | null): string {
  if (!url) return "unknown";

  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

/**
 * Verify Shopify webhook signature
 */
function verifyShopifySignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) {
    console.warn("No Shopify webhook signature provided");
    return true; // Temporarily allow unsigned requests in development
  }

  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("SHOPIFY_WEBHOOK_SECRET not configured");
    return true; // Allow in development
  }

  // Shopify uses HMAC-SHA256 for signing with base64 encoding
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("base64");

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
