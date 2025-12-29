/**
 * Funnel Calculator
 *
 * Calculates conversion funnel metrics from impressions to paid invoices
 */

import prisma from "@/lib/db";

export interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
  dropRate: number;
}

export interface FunnelData {
  stages: FunnelStage[];
  biggestLeak: {
    stage: string;
    dropRate: number;
  };
  overallConversionRate: number;
}

/**
 * Calculate conversion funnel for a company or specific channel
 */
export async function calculateFunnel(
  companyId: string,
  startDate: Date,
  endDate: Date,
  channelId?: string | null
): Promise<FunnelData> {
  const whereClause: any = {
    companyId,
    ...(channelId && { channelId })
  };

  // 1. Get ad impressions and clicks
  const adData = await prisma.adSpend.aggregate({
    where: {
      ...whereClause,
      date: { gte: startDate, lte: endDate }
    },
    _sum: {
      impressions: true,
      clicks: true
    }
  });

  const impressions = adData._sum.impressions || 0;
  const clicks = adData._sum.clicks || 0;

  // 2. Get calls
  const calls = await prisma.call.count({
    where: {
      ...whereClause,
      callDate: { gte: startDate, lte: endDate }
    }
  });

  // 3. Get bookings (scheduled)
  const bookings = await prisma.booking.count({
    where: {
      ...whereClause,
      bookingDate: { gte: startDate, lte: endDate }
    }
  });

  // 4. Get completed jobs
  const completed = await prisma.booking.count({
    where: {
      ...whereClause,
      bookingDate: { gte: startDate, lte: endDate },
      status: "COMPLETED"
    }
  });

  // 5. Get paid invoices
  const paid = await prisma.booking.count({
    where: {
      ...whereClause,
      bookingDate: { gte: startDate, lte: endDate },
      status: "COMPLETED",
      revenue: { gt: 0 }
    }
  });

  // Build funnel stages
  const stages: FunnelStage[] = [
    {
      stage: "Impressions",
      count: impressions,
      rate: 1.0,
      dropRate: 0
    },
    {
      stage: "Clicks",
      count: clicks,
      rate: impressions > 0 ? clicks / impressions : 0,
      dropRate: impressions > 0 ? 1 - (clicks / impressions) : 0
    },
    {
      stage: "Calls",
      count: calls,
      rate: clicks > 0 ? calls / clicks : 0,
      dropRate: clicks > 0 ? 1 - (calls / clicks) : 0
    },
    {
      stage: "Bookings",
      count: bookings,
      rate: calls > 0 ? bookings / calls : 0,
      dropRate: calls > 0 ? 1 - (bookings / calls) : 0
    },
    {
      stage: "Completed",
      count: completed,
      rate: bookings > 0 ? completed / bookings : 0,
      dropRate: bookings > 0 ? 1 - (completed / bookings) : 0
    },
    {
      stage: "Paid",
      count: paid,
      rate: completed > 0 ? paid / completed : 0,
      dropRate: completed > 0 ? 1 - (paid / completed) : 0
    }
  ];

  // Find biggest leak (excluding first stage)
  const leaks = stages.slice(1);
  const biggestLeak = leaks.reduce((max, stage) =>
    stage.dropRate > max.dropRate ? stage : max
  , leaks[0]);

  // Calculate overall conversion rate
  const overallConversionRate = impressions > 0 ? paid / impressions : 0;

  return {
    stages,
    biggestLeak: {
      stage: `${stages[stages.indexOf(biggestLeak) - 1].stage} → ${biggestLeak.stage}`,
      dropRate: biggestLeak.dropRate
    },
    overallConversionRate
  };
}

/**
 * Compare funnels across multiple channels
 */
export async function compareFunnelsByChannel(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, FunnelData>> {
  // Get all active channels
  const channels = await prisma.marketingChannel.findMany({
    where: { companyId, isActive: true },
    select: { id: true, name: true }
  });

  const funnelComparison: Record<string, FunnelData> = {};

  for (const channel of channels) {
    const funnelData = await calculateFunnel(companyId, startDate, endDate, channel.id);
    funnelComparison[channel.name] = funnelData;
  }

  return funnelComparison;
}

/**
 * Calculate time-to-convert metrics
 */
export async function calculateTimeToConvert(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  avgDaysToBook: number;
  avgDaysToComplete: number;
  avgDaysToPayment: number;
}> {
  const completedBookings = await prisma.booking.findMany({
    where: {
      companyId,
      bookingDate: { gte: startDate, lte: endDate },
      status: "COMPLETED",
      completedDate: { not: null }
    },
    select: {
      bookingDate: true,
      scheduledDate: true,
      completedDate: true
    }
  });

  if (completedBookings.length === 0) {
    return {
      avgDaysToBook: 0,
      avgDaysToComplete: 0,
      avgDaysToPayment: 0
    };
  }

  let totalDaysToComplete = 0;
  let totalDaysToPayment = 0;

  completedBookings.forEach(booking => {
    if (booking.completedDate) {
      // Days from booking to completion
      const daysToComplete =
        (new Date(booking.completedDate).getTime() - new Date(booking.bookingDate).getTime()) /
        (1000 * 60 * 60 * 24);
      totalDaysToComplete += daysToComplete;

      // Assume payment happens same day as completion (can be enhanced later)
      totalDaysToPayment += daysToComplete;
    }
  });

  return {
    avgDaysToBook: 0, // Would need call data to calculate
    avgDaysToComplete: totalDaysToComplete / completedBookings.length,
    avgDaysToPayment: totalDaysToPayment / completedBookings.length
  };
}
