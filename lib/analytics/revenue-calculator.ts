/**
 * Revenue Calculator
 *
 * Calculates revenue, profit, ROI, and other metrics by channel
 */

import prisma from "@/lib/db";

export interface ChannelRevenue {
  channelId: string;
  channelName: string;
  spend: number;
  revenue: number;
  cost: number;
  profit: number;
  roi: number;
  bookings: number;
  costPerBooking: number;
  revenuePerBooking: number;
  conversionRate: number;
  clicks: number;
}

export interface RevenueSummary {
  totalSpend: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  roi: number;
  totalBookings: number;
  avgCostPerBooking: number;
  avgRevenuePerBooking: number;
}

/**
 * Calculate revenue metrics for a specific channel
 */
export async function calculateChannelRevenue(
  companyId: string,
  channelId: string,
  startDate: Date,
  endDate: Date
): Promise<Omit<ChannelRevenue, "channelName">> {
  // 1. Get all ad spend for the channel
  const adSpendData = await prisma.adSpend.aggregate({
    where: {
      companyId,
      channelId,
      date: { gte: startDate, lte: endDate }
    },
    _sum: {
      amount: true,
      clicks: true,
      impressions: true
    }
  });

  const totalSpend = adSpendData._sum.amount || 0;
  const totalClicks = adSpendData._sum.clicks || 0;

  // 2. Get all completed bookings attributed to this channel
  const bookings = await prisma.booking.findMany({
    where: {
      companyId,
      channelId,
      bookingDate: { gte: startDate, lte: endDate },
      status: "COMPLETED"
    },
    select: {
      revenue: true,
      cost: true
    }
  });

  // 3. Calculate totals
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.revenue || 0), 0);
  const totalCost = bookings.reduce((sum, b) => sum + (b.cost || 0), 0);
  const profit = totalRevenue - totalCost - totalSpend;
  const roi = totalSpend > 0 ? (profit / totalSpend) * 100 : 0;
  const bookingCount = bookings.length;
  const costPerBooking = bookingCount > 0 ? totalSpend / bookingCount : 0;
  const revenuePerBooking = bookingCount > 0 ? totalRevenue / bookingCount : 0;
  const conversionRate = totalClicks > 0 ? (bookingCount / totalClicks) * 100 : 0;

  return {
    channelId,
    spend: totalSpend,
    revenue: totalRevenue,
    cost: totalCost,
    profit,
    roi,
    bookings: bookingCount,
    costPerBooking,
    revenuePerBooking,
    conversionRate,
    clicks: totalClicks
  };
}

/**
 * Calculate revenue for all channels
 */
export async function calculateAllChannelRevenue(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<ChannelRevenue[]> {
  // Get all active channels
  const channels = await prisma.marketingChannel.findMany({
    where: { companyId, isActive: true },
    select: { id: true, name: true }
  });

  // Calculate revenue for each channel in parallel
  const channelRevenuePromises = channels.map(async (channel) => {
    const metrics = await calculateChannelRevenue(companyId, channel.id, startDate, endDate);
    return {
      ...metrics,
      channelName: channel.name
    };
  });

  return Promise.all(channelRevenuePromises);
}

/**
 * Calculate summary metrics across all channels
 */
export async function calculateRevenueSummary(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<RevenueSummary> {
  const channelData = await calculateAllChannelRevenue(companyId, startDate, endDate);

  const totalSpend = channelData.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0);
  const totalCost = channelData.reduce((sum, c) => sum + c.cost, 0);
  const totalProfit = totalRevenue - totalCost - totalSpend;
  const roi = totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0;
  const totalBookings = channelData.reduce((sum, c) => sum + c.bookings, 0);
  const avgCostPerBooking = totalBookings > 0 ? totalSpend / totalBookings : 0;
  const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  return {
    totalSpend,
    totalRevenue,
    totalCost,
    totalProfit,
    roi,
    totalBookings,
    avgCostPerBooking,
    avgRevenuePerBooking
  };
}

/**
 * Calculate period-over-period comparison
 */
export async function calculatePeriodComparison(
  companyId: string,
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date
) {
  const [currentSummary, previousSummary] = await Promise.all([
    calculateRevenueSummary(companyId, currentStart, currentEnd),
    calculateRevenueSummary(companyId, previousStart, previousEnd)
  ]);

  return {
    current: currentSummary,
    previous: previousSummary,
    changes: {
      revenueChange: previousSummary.totalRevenue > 0
        ? ((currentSummary.totalRevenue - previousSummary.totalRevenue) / previousSummary.totalRevenue) * 100
        : 0,
      profitChange: previousSummary.totalProfit > 0
        ? ((currentSummary.totalProfit - previousSummary.totalProfit) / previousSummary.totalProfit) * 100
        : 0,
      roiChange: currentSummary.roi - previousSummary.roi,
      bookingsChange: previousSummary.totalBookings > 0
        ? ((currentSummary.totalBookings - previousSummary.totalBookings) / previousSummary.totalBookings) * 100
        : 0
    }
  };
}
