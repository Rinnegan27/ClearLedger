/**
 * Automated Insight Report Generator
 *
 * Generates comprehensive marketing performance reports including:
 * - Executive summary with key metrics
 * - Top performing campaigns and channels
 * - Period-over-period comparisons
 * - Actionable recommendations
 */

import prisma from "@/lib/db";
import { startOfWeek, startOfMonth, subWeeks, subMonths, endOfWeek, endOfMonth } from "date-fns";

export type ReportPeriod = "weekly" | "monthly";

export interface InsightReport {
  companyId: string;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;

  // Executive Summary
  summary: {
    totalSpend: number;
    totalRevenue: number;
    totalBookings: number;
    totalCalls: number;
    roas: number;
    roi: number;
    conversionRate: number;
  };

  // Period-over-period comparison
  comparison: {
    spendChange: number; // percentage
    revenueChange: number;
    bookingsChange: number;
    callsChange: number;
    roasChange: number;
  };

  // Top performers
  topChannels: Array<{
    channelId: string;
    channelName: string;
    spend: number;
    revenue: number;
    roas: number;
    bookings: number;
  }>;

  topCampaigns: Array<{
    campaignId: string;
    campaignName: string;
    channelName: string;
    spend: number;
    revenue: number;
    roas: number;
    bookings: number;
  }>;

  // Insights and recommendations
  insights: Array<{
    type: "opportunity" | "warning" | "success";
    title: string;
    description: string;
    metric?: string;
    change?: number;
  }>;

  recommendations: Array<{
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    expectedImpact: string;
  }>;
}

/**
 * Get date range for report period
 */
function getDateRange(period: ReportPeriod): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();

  if (period === "weekly") {
    const start = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }); // Last week Monday
    const end = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }); // Last week Sunday
    const prevStart = startOfWeek(subWeeks(now, 2), { weekStartsOn: 1 });
    const prevEnd = endOfWeek(subWeeks(now, 2), { weekStartsOn: 1 });
    return { start, end, prevStart, prevEnd };
  } else {
    const start = startOfMonth(subMonths(now, 1)); // Last month 1st
    const end = endOfMonth(subMonths(now, 1)); // Last month last day
    const prevStart = startOfMonth(subMonths(now, 2));
    const prevEnd = endOfMonth(subMonths(now, 2));
    return { start, end, prevStart, prevEnd };
  }
}

/**
 * Calculate metrics for a date range
 */
async function calculateMetrics(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  spend: number;
  revenue: number;
  bookings: number;
  calls: number;
  roas: number;
  roi: number;
  conversionRate: number;
}> {
  // Get ad spend
  const adSpends = await prisma.adSpend.findMany({
    where: {
      companyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalSpend = adSpends.reduce((sum, spend) => sum + spend.amount, 0);

  // Get bookings and revenue
  const bookings = await prisma.booking.findMany({
    where: {
      companyId,
      bookingDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.revenue || 0), 0);
  const totalBookings = bookings.length;

  // Get calls
  const calls = await prisma.call.findMany({
    where: {
      companyId,
      callDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalCalls = calls.length;

  // Calculate metrics
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
  const conversionRate = totalCalls > 0 ? (totalBookings / totalCalls) * 100 : 0;

  return {
    spend: totalSpend,
    revenue: totalRevenue,
    bookings: totalBookings,
    calls: totalCalls,
    roas,
    roi,
    conversionRate,
  };
}

/**
 * Get top performing channels
 */
async function getTopChannels(
  companyId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 5
) {
  // Get all channels for company
  const channels = await prisma.marketingChannel.findMany({
    where: { companyId, isActive: true },
  });

  const channelMetrics = await Promise.all(
    channels.map(async (channel) => {
      const spend = await prisma.adSpend.aggregate({
        where: {
          channelId: channel.id,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      const bookings = await prisma.booking.findMany({
        where: {
          channelId: channel.id,
          bookingDate: { gte: startDate, lte: endDate },
        },
      });

      const revenue = bookings.reduce((sum, b) => sum + (b.revenue || 0), 0);
      const totalSpend = spend._sum.amount || 0;
      const roas = totalSpend > 0 ? revenue / totalSpend : 0;

      return {
        channelId: channel.id,
        channelName: channel.name,
        spend: totalSpend,
        revenue,
        roas,
        bookings: bookings.length,
      };
    })
  );

  return channelMetrics
    .filter((m) => m.spend > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, limit);
}

/**
 * Get top performing campaigns
 */
async function getTopCampaigns(
  companyId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 5
) {
  const campaigns = await prisma.campaign.findMany({
    where: {
      companyId,
      startDate: { lte: endDate },
      OR: [{ endDate: null }, { endDate: { gte: startDate } }],
    },
    include: {
      channel: { select: { name: true } },
    },
  });

  const campaignMetrics = await Promise.all(
    campaigns.map(async (campaign) => {
      const spend = await prisma.adSpend.aggregate({
        where: {
          campaignId: campaign.id,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      const touchpoints = await prisma.touchPoint.findMany({
        where: {
          campaignId: campaign.id,
          timestamp: { gte: startDate, lte: endDate },
        },
        include: {
          booking: true,
        },
      });

      const bookingIds = new Set(touchpoints.map((tp) => tp.bookingId));
      const bookings = touchpoints
        .filter((tp) => tp.booking)
        .map((tp) => tp.booking);

      const revenue = bookings.reduce((sum, b) => sum + (b!.revenue || 0), 0);
      const totalSpend = spend._sum.amount || 0;
      const roas = totalSpend > 0 ? revenue / totalSpend : 0;

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        channelName: campaign.channel.name,
        spend: totalSpend,
        revenue,
        roas,
        bookings: bookingIds.size,
      };
    })
  );

  return campaignMetrics
    .filter((m) => m.spend > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, limit);
}

/**
 * Generate insights based on data analysis
 */
function generateInsights(
  current: Awaited<ReturnType<typeof calculateMetrics>>,
  previous: Awaited<ReturnType<typeof calculateMetrics>>
): InsightReport["insights"] {
  const insights: InsightReport["insights"] = [];

  // ROAS insights
  const roasChange = ((current.roas - previous.roas) / previous.roas) * 100;
  if (roasChange > 20) {
    insights.push({
      type: "success",
      title: "Strong ROAS Growth",
      description: `Return on ad spend increased by ${roasChange.toFixed(1)}%, indicating improved campaign efficiency.`,
      metric: "roas",
      change: roasChange,
    });
  } else if (roasChange < -15) {
    insights.push({
      type: "warning",
      title: "Declining ROAS",
      description: `Return on ad spend decreased by ${Math.abs(roasChange).toFixed(1)}%. Review campaign targeting and ad quality.`,
      metric: "roas",
      change: roasChange,
    });
  }

  // Conversion rate insights
  const convChange = current.conversionRate - previous.conversionRate;
  if (convChange > 5) {
    insights.push({
      type: "success",
      title: "Improved Conversion Rate",
      description: `Conversion rate increased by ${convChange.toFixed(1)} percentage points, showing better lead quality.`,
      metric: "conversionRate",
      change: convChange,
    });
  } else if (convChange < -5) {
    insights.push({
      type: "warning",
      title: "Lower Conversion Rate",
      description: `Conversion rate dropped by ${Math.abs(convChange).toFixed(1)} percentage points. Consider lead quality improvements.`,
      metric: "conversionRate",
      change: convChange,
    });
  }

  // Spend insights
  const spendChange = ((current.spend - previous.spend) / previous.spend) * 100;
  if (spendChange > 30 && roasChange < 0) {
    insights.push({
      type: "warning",
      title: "Increased Spend with Lower Returns",
      description: `Ad spend increased by ${spendChange.toFixed(1)}% but ROAS declined. Review budget allocation efficiency.`,
      metric: "spend",
      change: spendChange,
    });
  } else if (current.spend < previous.spend * 0.5) {
    insights.push({
      type: "opportunity",
      title: "Reduced Marketing Investment",
      description: "Ad spend significantly decreased. Consider if this aligns with business goals or if there's room to scale.",
      metric: "spend",
      change: spendChange,
    });
  }

  // Revenue insights
  const revenueChange = ((current.revenue - previous.revenue) / previous.revenue) * 100;
  if (revenueChange > 25) {
    insights.push({
      type: "success",
      title: "Strong Revenue Growth",
      description: `Revenue increased by ${revenueChange.toFixed(1)}%. Your marketing efforts are driving substantial business growth.`,
      metric: "revenue",
      change: revenueChange,
    });
  }

  return insights;
}

/**
 * Generate recommendations based on insights
 */
function generateRecommendations(
  current: Awaited<ReturnType<typeof calculateMetrics>>,
  previous: Awaited<ReturnType<typeof calculateMetrics>>,
  topChannels: Awaited<ReturnType<typeof getTopChannels>>,
  topCampaigns: Awaited<ReturnType<typeof getTopCampaigns>>
): InsightReport["recommendations"] {
  const recommendations: InsightReport["recommendations"] = [];

  // Top channel optimization
  if (topChannels.length > 1) {
    const best = topChannels[0];
    const worst = topChannels[topChannels.length - 1];

    if (best.roas > worst.roas * 3) {
      recommendations.push({
        priority: "high",
        title: `Scale ${best.channelName} Budget`,
        description: `${best.channelName} has a ROAS of ${best.roas.toFixed(2)}x, which is ${(best.roas / worst.roas).toFixed(1)}x better than ${worst.channelName}. Consider reallocating 20-30% of budget from underperforming channels.`,
        expectedImpact: `Could improve overall ROAS by ${((best.roas - worst.roas) / 2).toFixed(1)}x`,
      });
    }
  }

  // Conversion rate optimization
  if (current.conversionRate < 10) {
    recommendations.push({
      priority: "high",
      title: "Improve Lead Quality and Follow-up",
      description: `Current conversion rate is ${current.conversionRate.toFixed(1)}%, which is below industry benchmarks. Focus on better lead qualification and faster follow-up processes.`,
      expectedImpact: "Could increase bookings by 30-50% without additional ad spend",
    });
  }

  // ROAS optimization
  const roasChange = ((current.roas - previous.roas) / previous.roas) * 100;
  if (roasChange < -10) {
    recommendations.push({
      priority: "high",
      title: "Audit Underperforming Campaigns",
      description: "ROAS has declined significantly. Review ad creatives, targeting parameters, and landing page conversion rates for quick wins.",
      expectedImpact: "Could recover 15-25% of lost ROAS within 2 weeks",
    });
  }

  // Budget efficiency
  if (current.roas > 3) {
    recommendations.push({
      priority: "medium",
      title: "Consider Scaling Investment",
      description: `With a strong ROAS of ${current.roas.toFixed(2)}x, there's opportunity to increase ad spend while maintaining profitability. Test 20% budget increases on top performers.`,
      expectedImpact: `Could generate ${(current.revenue * 0.2).toLocaleString("en-US", { style: "currency", currency: "USD" })} additional revenue`,
    });
  }

  // Campaign diversification
  if (topCampaigns.length > 0 && topCampaigns[0].revenue > current.revenue * 0.7) {
    recommendations.push({
      priority: "medium",
      title: "Diversify Campaign Portfolio",
      description: "Over 70% of revenue comes from a single campaign, creating risk. Test 2-3 new campaign variants to reduce dependency.",
      expectedImpact: "Reduce business risk and discover new growth opportunities",
    });
  }

  return recommendations.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
}

/**
 * Generate complete insight report
 */
export async function generateInsightReport(
  companyId: string,
  period: ReportPeriod = "weekly"
): Promise<InsightReport> {
  const { start, end, prevStart, prevEnd } = getDateRange(period);

  // Calculate current and previous period metrics
  const [currentMetrics, previousMetrics, topChannels, topCampaigns] = await Promise.all([
    calculateMetrics(companyId, start, end),
    calculateMetrics(companyId, prevStart, prevEnd),
    getTopChannels(companyId, start, end),
    getTopCampaigns(companyId, start, end),
  ]);

  // Calculate period-over-period changes
  const comparison = {
    spendChange: previousMetrics.spend > 0
      ? ((currentMetrics.spend - previousMetrics.spend) / previousMetrics.spend) * 100
      : 0,
    revenueChange: previousMetrics.revenue > 0
      ? ((currentMetrics.revenue - previousMetrics.revenue) / previousMetrics.revenue) * 100
      : 0,
    bookingsChange: previousMetrics.bookings > 0
      ? ((currentMetrics.bookings - previousMetrics.bookings) / previousMetrics.bookings) * 100
      : 0,
    callsChange: previousMetrics.calls > 0
      ? ((currentMetrics.calls - previousMetrics.calls) / previousMetrics.calls) * 100
      : 0,
    roasChange: previousMetrics.roas > 0
      ? ((currentMetrics.roas - previousMetrics.roas) / previousMetrics.roas) * 100
      : 0,
  };

  // Generate insights and recommendations
  const insights = generateInsights(currentMetrics, previousMetrics);
  const recommendations = generateRecommendations(
    currentMetrics,
    previousMetrics,
    topChannels,
    topCampaigns
  );

  return {
    companyId,
    period,
    startDate: start,
    endDate: end,
    generatedAt: new Date(),
    summary: {
      totalSpend: currentMetrics.spend,
      totalRevenue: currentMetrics.revenue,
      totalBookings: currentMetrics.bookings,
      totalCalls: currentMetrics.calls,
      roas: currentMetrics.roas,
      roi: currentMetrics.roi,
      conversionRate: currentMetrics.conversionRate,
    },
    comparison,
    topChannels,
    topCampaigns,
    insights,
    recommendations,
  };
}

/**
 * Generate reports for all companies
 */
export async function generateAllReports(period: ReportPeriod = "weekly") {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  const reports = await Promise.all(
    companies.map(async (company) => {
      try {
        return await generateInsightReport(company.id, period);
      } catch (error) {
        console.error(`Failed to generate report for ${company.name}:`, error);
        return null;
      }
    })
  );

  return reports.filter((r) => r !== null) as InsightReport[];
}
