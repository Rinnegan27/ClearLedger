/**
 * Alert Checker
 *
 * Evaluates configured thresholds and anomaly detection rules against actual metrics data.
 * Creates AlertEvents and Notifications when violations are detected.
 */

import prisma from "@/lib/db";
import { createNotification } from "@/lib/notifications/create";
import {
  DataPoint,
  detectAnomalies,
  getMostSignificantAnomaly,
  AnomalyResult,
} from "./anomaly-detector";

interface MetricData {
  date: Date;
  roas?: number;
  cpc?: number;
  ctr?: number;
  spend?: number;
  conversions?: number;
  clicks?: number;
  revenue?: number;
}

/**
 * Extract metric value from data
 */
function getMetricValue(data: MetricData, metric: string): number | null {
  switch (metric.toLowerCase()) {
    case "roas":
      return data.roas ?? null;
    case "cpc":
      return data.cpc ?? null;
    case "ctr":
      return data.ctr ?? null;
    case "spend":
      return data.spend ?? null;
    case "conversions":
      return data.conversions ?? null;
    case "clicks":
      return data.clicks ?? null;
    case "revenue":
      return data.revenue ?? null;
    default:
      return null;
  }
}

/**
 * Fetch historical metrics for a channel
 */
async function fetchChannelMetrics(
  companyId: string,
  channelId: string | null,
  campaignId: string | null,
  days: number
): Promise<MetricData[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const adSpends = await prisma.adSpend.findMany({
    where: {
      companyId,
      ...(channelId && { channelId }),
      ...(campaignId && { campaignId }),
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });

  // Get corresponding bookings for ROAS calculation
  const bookings = await prisma.booking.findMany({
    where: {
      companyId,
      ...(channelId && { channelId }),
      bookingDate: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
  });

  // Group bookings by date
  const bookingsByDate = new Map<string, number>();
  bookings.forEach((booking) => {
    const dateKey = booking.bookingDate.toISOString().split("T")[0];
    const current = bookingsByDate.get(dateKey) || 0;
    bookingsByDate.set(dateKey, current + (booking.revenue || 0));
  });

  return adSpends.map((spend) => {
    const dateKey = spend.date.toISOString().split("T")[0];
    const revenue = bookingsByDate.get(dateKey) || 0;
    const roas = spend.amount > 0 ? revenue / spend.amount : 0;

    return {
      date: spend.date,
      spend: spend.amount,
      clicks: spend.clicks,
      conversions: spend.conversions,
      cpc: spend.costPerClick ?? undefined,
      ctr: spend.clickThroughRate ?? undefined,
      revenue,
      roas,
    };
  });
}

/**
 * Check a threshold condition
 */
function checkThreshold(
  currentValue: number,
  baselineValue: number,
  operator: string,
  threshold: number
): { violated: boolean; explanation: string } {
  switch (operator) {
    case "less_than":
      return {
        violated: currentValue < threshold,
        explanation: `${currentValue.toFixed(2)} < ${threshold.toFixed(2)}`,
      };

    case "greater_than":
      return {
        violated: currentValue > threshold,
        explanation: `${currentValue.toFixed(2)} > ${threshold.toFixed(2)}`,
      };

    case "percent_decrease":
      const decrease = ((baselineValue - currentValue) / baselineValue) * 100;
      return {
        violated: decrease > threshold,
        explanation: `${decrease.toFixed(1)}% decrease (threshold: ${threshold.toFixed(1)}%)`,
      };

    case "percent_increase":
      const increase = ((currentValue - baselineValue) / baselineValue) * 100;
      return {
        violated: increase > threshold,
        explanation: `${increase.toFixed(1)}% increase (threshold: ${threshold.toFixed(1)}%)`,
      };

    default:
      return { violated: false, explanation: "Unknown operator" };
  }
}

/**
 * Check all thresholds for a company
 */
export async function checkThresholds(companyId: string): Promise<number> {
  const thresholds = await prisma.alertThreshold.findMany({
    where: {
      companyId,
      isActive: true,
    },
    include: {
      channel: true,
      campaign: true,
    },
  });

  let alertsTriggered = 0;

  for (const threshold of thresholds) {
    try {
      const metrics = await fetchChannelMetrics(
        companyId,
        threshold.channelId,
        threshold.campaignId,
        threshold.lookbackDays + 1 // +1 for baseline comparison
      );

      if (metrics.length < 2) {
        console.log(`[Threshold ${threshold.id}] Insufficient data`);
        continue;
      }

      const currentMetric = metrics[metrics.length - 1];
      const baselineMetric = metrics[metrics.length - 2];

      const currentValue = getMetricValue(currentMetric, threshold.metric);
      const baselineValue = getMetricValue(baselineMetric, threshold.metric);

      if (currentValue === null || baselineValue === null) {
        console.log(`[Threshold ${threshold.id}] Metric ${threshold.metric} not available`);
        continue;
      }

      const check = checkThreshold(
        currentValue,
        baselineValue,
        threshold.operator,
        threshold.threshold
      );

      if (check.violated) {
        console.log(`[Threshold ${threshold.id}] Violated: ${check.explanation}`);

        // Create alert event
        const alertEvent = await prisma.alertEvent.create({
          data: {
            companyId,
            thresholdId: threshold.id,
            alertType: "threshold_violation",
            metric: threshold.metric,
            metricValue: currentValue,
            baselineValue,
            deviation: ((currentValue - baselineValue) / baselineValue) * 100,
            channelId: threshold.channelId,
            campaignId: threshold.campaignId,
            dateTriggered: currentMetric.date,
            severity: threshold.severity,
          },
        });

        // Send notification if enabled
        if (threshold.notifyInApp) {
          const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: { users: true },
          });

          if (company) {
            for (const companyUser of company.users) {
              const notification = await createNotification({
                userId: companyUser.userId,
                type: "campaign_alert",
                title: `Alert: ${threshold.name}`,
                message: `${threshold.metric.toUpperCase()} threshold violated - ${check.explanation}`,
                data: {
                  alertEventId: alertEvent.id,
                  thresholdId: threshold.id,
                  metric: threshold.metric,
                  currentValue,
                  baselineValue,
                  channelName: threshold.channel?.name || "All Channels",
                  campaignName: threshold.campaign?.name,
                },
              });

              // Link notification to alert event
              await prisma.alertEvent.update({
                where: { id: alertEvent.id },
                data: { notificationId: notification.id },
              });
            }
          }
        }

        alertsTriggered++;
      }
    } catch (error) {
      console.error(`[Threshold ${threshold.id}] Error:`, error);
    }
  }

  return alertsTriggered;
}

/**
 * Check anomaly detection rules for a company
 */
export async function checkAnomalies(companyId: string): Promise<number> {
  const rules = await prisma.anomalyDetectionRule.findMany({
    where: {
      companyId,
      isActive: true,
    },
    include: {
      channel: true,
    },
  });

  let anomaliesDetected = 0;

  for (const rule of rules) {
    try {
      const metrics = await fetchChannelMetrics(
        companyId,
        rule.channelId,
        null,
        rule.windowDays + 1 // +1 for current value
      );

      if (metrics.length < rule.minDataPoints) {
        console.log(`[Anomaly Rule ${rule.id}] Insufficient data (${metrics.length} < ${rule.minDataPoints})`);
        continue;
      }

      const currentMetric = metrics[metrics.length - 1];
      const historicalMetrics = metrics.slice(0, -1);

      const currentValue = getMetricValue(currentMetric, rule.metric);

      if (currentValue === null) {
        console.log(`[Anomaly Rule ${rule.id}] Metric ${rule.metric} not available`);
        continue;
      }

      const dataPoints: DataPoint[] = historicalMetrics.map((m) => ({
        date: m.date,
        value: getMetricValue(m, rule.metric) || 0,
      }));

      // Detect anomalies using specified method
      const results = detectAnomalies(
        dataPoints,
        currentValue,
        [rule.type],
        rule.sensitivity
      );

      const anomaly = getMostSignificantAnomaly(results);

      if (anomaly && anomaly.isAnomaly && anomaly.confidence > 0.5) {
        console.log(`[Anomaly Rule ${rule.id}] Detected: ${anomaly.explanation}`);

        // Create alert event
        const alertEvent = await prisma.alertEvent.create({
          data: {
            companyId,
            anomalyRuleId: rule.id,
            alertType: "anomaly_detected",
            metric: rule.metric,
            metricValue: anomaly.actualValue,
            baselineValue: anomaly.baselineValue,
            deviation: anomaly.deviation,
            channelId: rule.channelId,
            dateTriggered: currentMetric.date,
            severity: rule.severity,
          },
        });

        // Send notification
        const company = await prisma.company.findUnique({
          where: { id: companyId },
          include: { users: true },
        });

        if (company) {
          for (const companyUser of company.users) {
            const notification = await createNotification({
              userId: companyUser.userId,
              type: "campaign_alert",
              title: `Anomaly Detected: ${rule.name}`,
              message: anomaly.explanation,
              data: {
                alertEventId: alertEvent.id,
                anomalyRuleId: rule.id,
                metric: rule.metric,
                method: anomaly.method,
                confidence: anomaly.confidence,
                deviation: anomaly.deviation,
                actualValue: anomaly.actualValue,
                baselineValue: anomaly.baselineValue,
                channelName: rule.channel?.name || "All Channels",
              },
            });

            // Link notification to alert event
            await prisma.alertEvent.update({
              where: { id: alertEvent.id },
              data: { notificationId: notification.id },
            });
          }
        }

        anomaliesDetected++;
      }
    } catch (error) {
      console.error(`[Anomaly Rule ${rule.id}] Error:`, error);
    }
  }

  return anomaliesDetected;
}

/**
 * Check all alerts (thresholds + anomalies) for a company
 */
export async function checkAllAlerts(companyId: string): Promise<{
  thresholdsTriggered: number;
  anomaliesDetected: number;
}> {
  const [thresholdsTriggered, anomaliesDetected] = await Promise.all([
    checkThresholds(companyId),
    checkAnomalies(companyId),
  ]);

  return { thresholdsTriggered, anomaliesDetected };
}

/**
 * Check alerts for all companies
 */
export async function checkAllCompanies(): Promise<{
  companies: number;
  totalThresholdsTriggered: number;
  totalAnomaliesDetected: number;
}> {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  let totalThresholdsTriggered = 0;
  let totalAnomaliesDetected = 0;

  for (const company of companies) {
    try {
      const result = await checkAllAlerts(company.id);
      totalThresholdsTriggered += result.thresholdsTriggered;
      totalAnomaliesDetected += result.anomaliesDetected;

      if (result.thresholdsTriggered > 0 || result.anomaliesDetected > 0) {
        console.log(`[${company.name}] Thresholds: ${result.thresholdsTriggered}, Anomalies: ${result.anomaliesDetected}`);
      }
    } catch (error) {
      console.error(`[${company.name}] Error checking alerts:`, error);
    }
  }

  return {
    companies: companies.length,
    totalThresholdsTriggered,
    totalAnomaliesDetected,
  };
}
