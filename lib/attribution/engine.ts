/**
 * Attribution Engine
 *
 * Core logic for calculating revenue attribution across marketing touchpoints
 */

import prisma from "@/lib/db";
import { applyAttributionModel, type AttributionModel, type ChannelAttribution } from "./models";

/**
 * Calculate attribution for a single booking
 */
export async function calculateAttribution(
  bookingId: string,
  model: AttributionModel = "last-touch"
): Promise<ChannelAttribution[]> {
  // 1. Fetch all touchpoints for this booking, sorted by timestamp
  const touchpoints = await prisma.touchPoint.findMany({
    where: { bookingId },
    orderBy: { timestamp: "asc" }
  });

  if (touchpoints.length === 0) {
    return [];
  }

  // 2. Get booking revenue
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const revenue = booking.revenue || 0;

  // 3. Apply attribution model
  return applyAttributionModel(touchpoints, revenue, model);
}

/**
 * Calculate attribution for all bookings in a date range
 */
export async function calculateBulkAttribution(
  companyId: string,
  startDate: Date,
  endDate: Date,
  model: AttributionModel = "last-touch"
): Promise<{ bookingsProcessed: number; totalRevenue: number }> {
  // Get all completed bookings in date range
  const bookings = await prisma.booking.findMany({
    where: {
      companyId,
      bookingDate: { gte: startDate, lte: endDate },
      status: "COMPLETED"
    },
    include: { touchpoints: true }
  });

  let totalRevenue = 0;
  let bookingsProcessed = 0;

  // Process each booking
  for (const booking of bookings) {
    if (!booking.revenue) continue;

    const attribution = await calculateAttribution(booking.id, model);

    // Update booking with attribution results
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        attributionModel: model,
        attributionData: JSON.stringify(attribution),
        firstTouchChannelId: booking.touchpoints[0]?.channelId || null,
        lastTouchChannelId: booking.touchpoints[booking.touchpoints.length - 1]?.channelId || null
      }
    });

    totalRevenue += booking.revenue;
    bookingsProcessed++;
  }

  return { bookingsProcessed, totalRevenue };
}

/**
 * Get attribution summary by channel for a company
 */
export async function getAttributionSummary(
  companyId: string,
  startDate: Date,
  endDate: Date,
  model: AttributionModel = "last-touch"
): Promise<Record<string, { revenue: number; weight: number }>> {
  // Get all completed bookings with touchpoints
  const bookings = await prisma.booking.findMany({
    where: {
      companyId,
      bookingDate: { gte: startDate, lte: endDate },
      status: "COMPLETED"
    },
    include: {
      touchpoints: {
        orderBy: { timestamp: "asc" }
      }
    }
  });

  // Aggregate attribution by channel
  const channelSummary: Record<string, { revenue: number; weight: number }> = {};

  for (const booking of bookings) {
    if (!booking.revenue || booking.touchpoints.length === 0) continue;

    const attribution = applyAttributionModel(booking.touchpoints, booking.revenue, model);

    attribution.forEach(attr => {
      if (!channelSummary[attr.channelId]) {
        channelSummary[attr.channelId] = { revenue: 0, weight: 0 };
      }
      channelSummary[attr.channelId].revenue += attr.revenue;
      channelSummary[attr.channelId].weight += attr.weight;
    });
  }

  return channelSummary;
}

/**
 * Compare different attribution models side-by-side
 */
export async function compareAttributionModels(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<AttributionModel, Record<string, number>>> {
  const models: AttributionModel[] = ["first-touch", "last-touch", "linear", "time-decay", "position-based"];
  const comparison: Record<string, Record<string, number>> = {};

  for (const model of models) {
    const summary = await getAttributionSummary(companyId, startDate, endDate, model);
    comparison[model] = Object.fromEntries(
      Object.entries(summary).map(([channelId, data]) => [channelId, data.revenue])
    );
  }

  return comparison as Record<AttributionModel, Record<string, number>>;
}
