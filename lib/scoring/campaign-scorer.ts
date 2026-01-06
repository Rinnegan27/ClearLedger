/**
 * Campaign Performance Scoring System
 *
 * Assigns letter grades (A-F) to campaigns based on:
 * - ROAS (Return on Ad Spend)
 * - ROI (Return on Investment)
 * - Conversion Rate
 * - Cost Per Acquisition
 * - Booking Volume
 */

import prisma from "@/lib/db";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";

export type LetterGrade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "F";

export interface CampaignScore {
  campaignId: string;
  campaignName: string;
  channelName: string;

  // Metrics
  spend: number;
  revenue: number;
  bookings: number;
  calls: number;
  roas: number;
  roi: number;
  cpa: number; // Cost Per Acquisition
  conversionRate: number;

  // Scoring
  overallGrade: LetterGrade;
  overallScore: number; // 0-100
  componentScores: {
    roasScore: number;
    roiScore: number;
    cpaScore: number;
    conversionScore: number;
    volumeScore: number;
  };

  // Insights
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

/**
 * Convert numeric score (0-100) to letter grade
 */
function scoreToGrade(score: number): LetterGrade {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}

/**
 * Score ROAS (0-100)
 *
 * Scoring scale:
 * - 5x+ ROAS = 100
 * - 3x ROAS = 80
 * - 2x ROAS = 60
 * - 1x ROAS = 40
 * - <1x ROAS = 0-40
 */
function scoreROAS(roas: number): number {
  if (roas >= 5) return 100;
  if (roas >= 3) return 80 + ((roas - 3) / 2) * 20;
  if (roas >= 2) return 60 + ((roas - 2) / 1) * 20;
  if (roas >= 1) return 40 + ((roas - 1) / 1) * 20;
  return roas * 40;
}

/**
 * Score ROI (0-100)
 *
 * Scoring scale:
 * - 400%+ ROI = 100
 * - 200% ROI = 80
 * - 100% ROI = 60
 * - 0% ROI = 40
 * - Negative ROI = 0-40
 */
function scoreROI(roi: number): number {
  if (roi >= 400) return 100;
  if (roi >= 200) return 80 + ((roi - 200) / 200) * 20;
  if (roi >= 100) return 60 + ((roi - 100) / 100) * 20;
  if (roi >= 0) return 40 + (roi / 100) * 20;
  return Math.max(0, 40 + (roi / 100) * 40);
}

/**
 * Score CPA (Cost Per Acquisition) - lower is better (0-100)
 *
 * Uses industry benchmarks and relative comparison
 */
function scoreCPA(cpa: number, averageCPA: number): number {
  if (averageCPA === 0) return 50; // No baseline

  const ratio = cpa / averageCPA;

  if (ratio <= 0.5) return 100; // 50% better than average
  if (ratio <= 0.75) return 90;
  if (ratio <= 0.9) return 80;
  if (ratio <= 1.0) return 70;
  if (ratio <= 1.25) return 50;
  if (ratio <= 1.5) return 30;
  if (ratio <= 2.0) return 10;
  return 0;
}

/**
 * Score conversion rate (0-100)
 *
 * Scoring scale:
 * - 50%+ conversion = 100
 * - 30% conversion = 80
 * - 15% conversion = 60
 * - 5% conversion = 40
 * - <5% conversion = 0-40
 */
function scoreConversionRate(rate: number): number {
  if (rate >= 50) return 100;
  if (rate >= 30) return 80 + ((rate - 30) / 20) * 20;
  if (rate >= 15) return 60 + ((rate - 15) / 15) * 20;
  if (rate >= 5) return 40 + ((rate - 5) / 10) * 20;
  return (rate / 5) * 40;
}

/**
 * Score volume (bookings) - relative to company average
 */
function scoreVolume(bookings: number, averageBookings: number): number {
  if (averageBookings === 0) return bookings > 0 ? 70 : 30;

  const ratio = bookings / averageBookings;

  if (ratio >= 2.0) return 100;
  if (ratio >= 1.5) return 90;
  if (ratio >= 1.2) return 80;
  if (ratio >= 1.0) return 70;
  if (ratio >= 0.75) return 50;
  if (ratio >= 0.5) return 30;
  return 10;
}

/**
 * Generate insights based on component scores
 */
function generateInsights(
  componentScores: CampaignScore["componentScores"],
  metrics: Pick<CampaignScore, "roas" | "roi" | "cpa" | "conversionRate" | "bookings">
): { strengths: string[]; weaknesses: string[]; recommendation: string } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Identify strengths (score >= 80)
  if (componentScores.roasScore >= 80) {
    strengths.push(`Excellent ROAS of ${metrics.roas.toFixed(2)}x`);
  }
  if (componentScores.roiScore >= 80) {
    strengths.push(`Strong ROI of ${metrics.roi.toFixed(0)}%`);
  }
  if (componentScores.conversionScore >= 80) {
    strengths.push(`High conversion rate of ${metrics.conversionRate.toFixed(1)}%`);
  }
  if (componentScores.volumeScore >= 80) {
    strengths.push(`High booking volume (${metrics.bookings} bookings)`);
  }
  if (componentScores.cpaScore >= 80) {
    strengths.push(`Low cost per acquisition ($${metrics.cpa.toFixed(0)})`);
  }

  // Identify weaknesses (score < 50)
  if (componentScores.roasScore < 50) {
    weaknesses.push(`Poor ROAS of ${metrics.roas.toFixed(2)}x - not profitable`);
  }
  if (componentScores.roiScore < 50) {
    weaknesses.push(`Negative or low ROI (${metrics.roi.toFixed(0)}%)`);
  }
  if (componentScores.conversionScore < 50) {
    weaknesses.push(`Low conversion rate (${metrics.conversionRate.toFixed(1)}%)`);
  }
  if (componentScores.volumeScore < 50) {
    weaknesses.push(`Low booking volume (${metrics.bookings} bookings)`);
  }
  if (componentScores.cpaScore < 50) {
    weaknesses.push(`High cost per acquisition ($${metrics.cpa.toFixed(0)})`);
  }

  // Generate recommendation
  let recommendation = "";

  if (componentScores.roasScore < 50 && componentScores.roiScore < 50) {
    recommendation = "URGENT: Pause or restructure - campaign is losing money. Review targeting, ad creative, and landing pages.";
  } else if (componentScores.roasScore >= 80 && componentScores.volumeScore >= 70) {
    recommendation = "Scale up budget by 20-30% - campaign is performing well with good volume.";
  } else if (componentScores.roasScore >= 80 && componentScores.volumeScore < 50) {
    recommendation = "Increase budget to capture more volume while maintaining excellent efficiency.";
  } else if (componentScores.conversionScore < 50) {
    recommendation = "Focus on improving lead quality and follow-up speed to boost conversion rate.";
  } else if (componentScores.cpaScore < 50) {
    recommendation = "Optimize targeting and bidding strategy to reduce acquisition costs.";
  } else if (weaknesses.length > strengths.length) {
    recommendation = "Monitor closely and test improvements to targeting, creative, or offer.";
  } else {
    recommendation = "Continue current strategy with regular monitoring and minor optimizations.";
  }

  return { strengths, weaknesses, recommendation };
}

/**
 * Calculate campaign scores for a company
 */
export async function scoreCampaigns(
  companyId: string,
  months: number = 1
): Promise<CampaignScore[]> {
  const endDate = endOfMonth(new Date());
  const startDate = startOfMonth(subMonths(endDate, months - 1));

  // Get all active campaigns
  const campaigns = await prisma.campaign.findMany({
    where: {
      companyId,
      startDate: { lte: endDate },
      OR: [
        { endDate: null },
        { endDate: { gte: startDate } },
      ],
    },
    include: {
      channel: { select: { name: true } },
    },
  });

  // Calculate metrics for each campaign
  const campaignMetrics = await Promise.all(
    campaigns.map(async (campaign) => {
      // Get spend
      const spendData = await prisma.adSpend.aggregate({
        where: {
          campaignId: campaign.id,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });
      const spend = spendData._sum.amount || 0;

      // Get touchpoints and bookings
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
      const bookingCount = bookingIds.size;

      // Get calls for conversion rate
      const calls = await prisma.call.findMany({
        where: {
          companyId,
          callDate: { gte: startDate, lte: endDate },
        },
      });
      const callCount = calls.length;

      // Calculate metrics
      const roas = spend > 0 ? revenue / spend : 0;
      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
      const cpa = bookingCount > 0 ? spend / bookingCount : 0;
      const conversionRate = callCount > 0 ? (bookingCount / callCount) * 100 : 0;

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        channelName: campaign.channel.name,
        spend,
        revenue,
        bookings: bookingCount,
        calls: callCount,
        roas,
        roi,
        cpa,
        conversionRate,
      };
    })
  );

  // Calculate company averages for relative scoring
  const totalBookings = campaignMetrics.reduce((sum, c) => sum + c.bookings, 0);
  const averageBookings = totalBookings / Math.max(campaignMetrics.length, 1);

  const campaignsWithCPA = campaignMetrics.filter((c) => c.cpa > 0);
  const averageCPA = campaignsWithCPA.length > 0
    ? campaignsWithCPA.reduce((sum, c) => sum + c.cpa, 0) / campaignsWithCPA.length
    : 0;

  // Score each campaign
  const scoredCampaigns: CampaignScore[] = campaignMetrics
    .map((metrics) => {
      const roasScore = scoreROAS(metrics.roas);
      const roiScore = scoreROI(metrics.roi);
      const cpaScore = scoreCPA(metrics.cpa, averageCPA);
      const conversionScore = scoreConversionRate(metrics.conversionRate);
      const volumeScore = scoreVolume(metrics.bookings, averageBookings);

      // Weighted overall score
      // ROAS is most important (35%), followed by ROI (25%), CPA (20%), conversion (15%), volume (5%)
      const overallScore =
        roasScore * 0.35 +
        roiScore * 0.25 +
        cpaScore * 0.20 +
        conversionScore * 0.15 +
        volumeScore * 0.05;

      const componentScores = {
        roasScore,
        roiScore,
        cpaScore,
        conversionScore,
        volumeScore,
      };

      const { strengths, weaknesses, recommendation } = generateInsights(
        componentScores,
        metrics
      );

      return {
        ...metrics,
        overallGrade: scoreToGrade(overallScore),
        overallScore,
        componentScores,
        strengths,
        weaknesses,
        recommendation,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore); // Sort by score descending

  return scoredCampaigns;
}

/**
 * Get grade color for UI
 */
export function getGradeColor(grade: LetterGrade): {
  bg: string;
  text: string;
  border: string;
} {
  const gradeBase = grade.charAt(0);

  switch (gradeBase) {
    case "A":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    case "B":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    case "C":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      };
    case "D":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      };
    case "F":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
}
