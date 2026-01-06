/**
 * Missed Call Recovery Analyzer
 *
 * Identifies missed calls, estimates lost revenue, and provides recovery recommendations
 */

import prisma from "@/lib/db";
import { startOfDay, subDays, format } from "date-fns";

export interface MissedCallAnalysis {
  companyId: string;
  period: {
    start: Date;
    end: Date;
  };

  // Summary stats
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  missedRate: number; // percentage

  // Revenue impact
  averageBookingValue: number;
  estimatedConversionRate: number;
  estimatedLostBookings: number;
  estimatedLostRevenue: number;

  // Time patterns
  peakMissedHours: Array<{
    hour: number;
    missedCount: number;
    displayHour: string;
  }>;

  // Day patterns
  peakMissedDays: Array<{
    dayOfWeek: number;
    dayName: string;
    missedCount: number;
  }>;

  // Recent missed calls
  recentMissedCalls: Array<{
    id: string;
    phoneNumber: string;
    callerName: string | null;
    callDate: Date;
    estimatedValue: number;
    channelName: string | null;
  }>;

  // Recommendations
  recommendations: Array<{
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    expectedImpact: string;
  }>;
}

/**
 * Get day name from day of week number
 */
function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek];
}

/**
 * Format hour for display (12-hour format)
 */
function formatHour(hour: number): string {
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

/**
 * Analyze missed calls for a company
 */
export async function analyzeMissedCalls(
  companyId: string,
  days: number = 30
): Promise<MissedCallAnalysis> {
  const endDate = new Date();
  const startDate = subDays(startOfDay(endDate), days);

  // Get all calls in period
  const calls = await prisma.call.findMany({
    where: {
      companyId,
      callDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      channel: {
        select: { name: true },
      },
      booking: true,
    },
    orderBy: {
      callDate: "desc",
    },
  });

  const totalCalls = calls.length;
  const answeredCalls = calls.filter((c) => c.status === "answered" || c.status === "completed").length;
  const missedCalls = calls.filter((c) => c.status === "missed" || c.status === "no-answer").length;
  const missedRate = totalCalls > 0 ? (missedCalls / totalCalls) * 100 : 0;

  // Calculate average booking value from successful bookings
  const bookings = calls.filter((c) => c.booking).map((c) => c.booking!);
  const averageBookingValue =
    bookings.length > 0
      ? bookings.reduce((sum, b) => sum + (b.revenue || 0), 0) / bookings.length
      : 500; // Default estimate

  // Calculate conversion rate from answered calls to bookings
  const answeredCallsCount = calls.filter((c) => c.status === "answered" || c.status === "completed").length;
  const bookingsFromCalls = calls.filter((c) => c.booking).length;
  const estimatedConversionRate =
    answeredCallsCount > 0 ? bookingsFromCalls / answeredCallsCount : 0.3; // Default 30%

  // Estimate lost revenue
  const estimatedLostBookings = Math.round(missedCalls * estimatedConversionRate);
  const estimatedLostRevenue = estimatedLostBookings * averageBookingValue;

  // Analyze time patterns
  const hourCounts = new Map<number, number>();
  const dayCounts = new Map<number, number>();

  const missedCallsList = calls.filter((c) => c.status === "missed" || c.status === "no-answer");

  missedCallsList.forEach((call) => {
    const hour = call.callDate.getHours();
    const day = call.callDate.getDay();

    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });

  // Top 5 peak hours
  const peakMissedHours = Array.from(hourCounts.entries())
    .map(([hour, count]) => ({
      hour,
      missedCount: count,
      displayHour: formatHour(hour),
    }))
    .sort((a, b) => b.missedCount - a.missedCount)
    .slice(0, 5);

  // Top days of week
  const peakMissedDays = Array.from(dayCounts.entries())
    .map(([dayOfWeek, count]) => ({
      dayOfWeek,
      dayName: getDayName(dayOfWeek),
      missedCount: count,
    }))
    .sort((a, b) => b.missedCount - a.missedCount);

  // Recent missed calls (last 20)
  const recentMissedCalls = missedCallsList.slice(0, 20).map((call) => ({
    id: call.id,
    phoneNumber: call.phoneNumber,
    callerName: call.callerName,
    callDate: call.callDate,
    estimatedValue: averageBookingValue * estimatedConversionRate,
    channelName: call.channel?.name || null,
  }));

  // Generate recommendations
  const recommendations: MissedCallAnalysis["recommendations"] = [];

  // High missed rate
  if (missedRate > 25) {
    recommendations.push({
      priority: "high",
      title: "Critical: High Missed Call Rate",
      description: `You're missing ${missedRate.toFixed(1)}% of calls (${missedCalls} calls). Add staff, extend hours, or enable voicemail-to-text to capture these leads.`,
      expectedImpact: `Recover up to $${estimatedLostRevenue.toLocaleString()} in revenue`,
    });
  }

  // Peak hour coverage
  if (peakMissedHours.length > 0 && peakMissedHours[0].missedCount > 5) {
    const peakHour = peakMissedHours[0];
    recommendations.push({
      priority: "high",
      title: `Add Coverage During Peak Hours (${peakHour.displayHour})`,
      description: `${peakHour.missedCount} calls missed during ${peakHour.displayHour}. Ensure adequate staffing during this time or set up call forwarding.`,
      expectedImpact: `Capture ${Math.round(peakHour.missedCount * estimatedConversionRate)} additional bookings per month`,
    });
  }

  // Weekend/after-hours
  const weekendMissed = (dayCounts.get(0) || 0) + (dayCounts.get(6) || 0);
  if (weekendMissed > missedCalls * 0.3) {
    recommendations.push({
      priority: "medium",
      title: "Weekend Coverage Gap",
      description: `${weekendMissed} calls missed on weekends. Consider weekend hours or automated booking system.`,
      expectedImpact: `Recover ${Math.round(weekendMissed * estimatedConversionRate)} weekend bookings`,
    });
  }

  // Follow-up automation
  if (missedCalls > 10) {
    recommendations.push({
      priority: "medium",
      title: "Implement Automated Follow-Up",
      description: "Set up automatic SMS/email follow-up for missed calls within 5 minutes. Include booking link and callback scheduling.",
      expectedImpact: `Convert 15-25% of missed calls into bookings (${Math.round(missedCalls * 0.2)} additional bookings)`,
    });
  }

  // Call-back system
  if (missedCalls > 20) {
    recommendations.push({
      priority: "medium",
      title: "Deploy Call-Back Queue System",
      description: "Implement a system to track and prioritize missed call returns. Target callback within 2 hours for best results.",
      expectedImpact: "Improve conversion rate by 30% on missed call follow-ups",
    });
  }

  // Voicemail optimization
  recommendations.push({
    priority: "low",
    title: "Optimize Voicemail Message",
    description: "Update voicemail with clear next steps: text booking link, expected callback time, and alternative contact methods.",
    expectedImpact: "Increase callback engagement by 20%",
  });

  return {
    companyId,
    period: {
      start: startDate,
      end: endDate,
    },
    totalCalls,
    answeredCalls,
    missedCalls,
    missedRate,
    averageBookingValue,
    estimatedConversionRate: estimatedConversionRate * 100, // Convert to percentage
    estimatedLostBookings,
    estimatedLostRevenue,
    peakMissedHours,
    peakMissedDays,
    recentMissedCalls,
    recommendations: recommendations.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    }),
  };
}
