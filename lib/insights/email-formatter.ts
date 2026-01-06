/**
 * Email Formatter for Insight Reports
 *
 * Formats InsightReport data into HTML emails
 */

import { InsightReport } from "./report-generator";
import { format } from "date-fns";

/**
 * Format currency values
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage changes with color
 */
function formatChange(change: number): { text: string; color: string } {
  const isPositive = change >= 0;
  const color = isPositive ? "#10b981" : "#ef4444"; // green : red
  const sign = isPositive ? "+" : "";
  return {
    text: `${sign}${change.toFixed(1)}%`,
    color,
  };
}

/**
 * Get severity badge color
 */
function getSeverityColor(type: string): string {
  switch (type) {
    case "success":
      return "#10b981"; // green
    case "warning":
      return "#f59e0b"; // orange
    case "opportunity":
      return "#3b82f6"; // blue
    default:
      return "#6b7280"; // gray
  }
}

/**
 * Get priority badge color
 */
function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "#ef4444"; // red
    case "medium":
      return "#f59e0b"; // orange
    case "low":
      return "#10b981"; // green
    default:
      return "#6b7280"; // gray
  }
}

/**
 * Generate HTML email for insight report
 */
export function formatReportEmail(report: InsightReport, companyName: string): string {
  const periodLabel = report.period === "weekly" ? "Weekly" : "Monthly";
  const dateRange = `${format(report.startDate, "MMM d")} - ${format(report.endDate, "MMM d, yyyy")}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${periodLabel} Marketing Report - ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ${periodLabel} Marketing Report
              </h1>
              <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 16px;">
                ${dateRange}
              </p>
            </td>
          </tr>

          <!-- Executive Summary -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 20px; font-weight: 600;">
                📊 Executive Summary
              </h2>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; width: 50%;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Revenue</div>
                    <div style="font-size: 24px; font-weight: 700; color: #111827;">${formatCurrency(report.summary.totalRevenue)}</div>
                    <div style="font-size: 14px; color: ${formatChange(report.comparison.revenueChange).color}; font-weight: 600; margin-top: 4px;">
                      ${formatChange(report.comparison.revenueChange).text}
                    </div>
                  </td>
                  <td style="width: 20px;"></td>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; width: 50%;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Spend</div>
                    <div style="font-size: 24px; font-weight: 700; color: #111827;">${formatCurrency(report.summary.totalSpend)}</div>
                    <div style="font-size: 14px; color: ${formatChange(report.comparison.spendChange).color}; font-weight: 600; margin-top: 4px;">
                      ${formatChange(report.comparison.spendChange).text}
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-radius: 6px; width: 50%;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">ROAS</div>
                    <div style="font-size: 24px; font-weight: 700; color: #059669;">${report.summary.roas.toFixed(2)}x</div>
                    <div style="font-size: 14px; color: ${formatChange(report.comparison.roasChange).color}; font-weight: 600; margin-top: 4px;">
                      ${formatChange(report.comparison.roasChange).text}
                    </div>
                  </td>
                  <td style="width: 20px;"></td>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; width: 50%;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Bookings</div>
                    <div style="font-size: 24px; font-weight: 700; color: #111827;">${report.summary.totalBookings}</div>
                    <div style="font-size: 14px; color: ${formatChange(report.comparison.bookingsChange).color}; font-weight: 600; margin-top: 4px;">
                      ${formatChange(report.comparison.bookingsChange).text}
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; width: 50%;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Calls</div>
                    <div style="font-size: 24px; font-weight: 700; color: #111827;">${report.summary.totalCalls}</div>
                    <div style="font-size: 14px; color: ${formatChange(report.comparison.callsChange).color}; font-weight: 600; margin-top: 4px;">
                      ${formatChange(report.comparison.callsChange).text}
                    </div>
                  </td>
                  <td style="width: 20px;"></td>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; width: 50%;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Conversion Rate</div>
                    <div style="font-size: 24px; font-weight: 700; color: #111827;">${report.summary.conversionRate.toFixed(1)}%</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Performers -->
          ${report.topChannels.length > 0 ? `
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">
                🏆 Top Performing Channels
              </h2>

              ${report.topChannels.map((channel, idx) => `
                <div style="padding: 12px; background-color: ${idx === 0 ? "#fef3c7" : "#f9fafb"}; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid ${idx === 0 ? "#f59e0b" : "#e5e7eb"};">
                  <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${idx + 1}. ${channel.channelName}</div>
                  <div style="font-size: 14px; color: #6b7280;">
                    ROAS: <span style="font-weight: 600; color: #059669;">${channel.roas.toFixed(2)}x</span> •
                    Revenue: <span style="font-weight: 600;">${formatCurrency(channel.revenue)}</span> •
                    Spend: ${formatCurrency(channel.spend)}
                  </div>
                </div>
              `).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- Insights -->
          ${report.insights.length > 0 ? `
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">
                💡 Key Insights
              </h2>

              ${report.insights.map(insight => `
                <div style="padding: 15px; background-color: #f9fafb; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid ${getSeverityColor(insight.type)};">
                  <div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <span style="display: inline-block; padding: 3px 8px; background-color: ${getSeverityColor(insight.type)}; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; border-radius: 4px; margin-right: 8px;">
                      ${insight.type}
                    </span>
                    <span style="font-weight: 600; color: #111827;">${insight.title}</span>
                  </div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                    ${insight.description}
                  </div>
                </div>
              `).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- Recommendations -->
          ${report.recommendations.length > 0 ? `
          <tr>
            <td style="padding: 0 30px 40px;">
              <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px; font-weight: 600;">
                🎯 Recommendations
              </h2>

              ${report.recommendations.map((rec, idx) => `
                <div style="padding: 15px; background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 6px; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="display: inline-block; width: 24px; height: 24px; background-color: ${getPriorityColor(rec.priority)}; color: #ffffff; font-size: 12px; font-weight: 700; text-align: center; line-height: 24px; border-radius: 50%; margin-right: 10px;">
                      ${idx + 1}
                    </span>
                    <span style="font-weight: 600; color: #111827; flex: 1;">${rec.title}</span>
                    <span style="display: inline-block; padding: 3px 8px; background-color: ${getPriorityColor(rec.priority)}; color: #ffffff; font-size: 10px; font-weight: 600; text-transform: uppercase; border-radius: 4px;">
                      ${rec.priority}
                    </span>
                  </div>
                  <div style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 8px;">
                    ${rec.description}
                  </div>
                  <div style="font-size: 13px; color: #059669; font-weight: 500; background-color: #f0fdf4; padding: 8px; border-radius: 4px;">
                    💰 ${rec.expectedImpact}
                  </div>
                </div>
              `).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                Generated by ClearLedger on ${format(report.generatedAt, "MMMM d, yyyy 'at' h:mm a")}
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                <a href="https://clearledger.com/dashboard" style="color: #667eea; text-decoration: none;">View Full Dashboard</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of report (for email clients that don't support HTML)
 */
export function formatReportText(report: InsightReport, companyName: string): string {
  const periodLabel = report.period === "weekly" ? "Weekly" : "Monthly";
  const dateRange = `${format(report.startDate, "MMM d")} - ${format(report.endDate, "MMM d, yyyy")}`;

  let text = `
${periodLabel.toUpperCase()} MARKETING REPORT - ${companyName.toUpperCase()}
${dateRange}
${"=".repeat(60)}

EXECUTIVE SUMMARY
-----------------
Total Revenue:     ${formatCurrency(report.summary.totalRevenue)} (${formatChange(report.comparison.revenueChange).text})
Total Spend:       ${formatCurrency(report.summary.totalSpend)} (${formatChange(report.comparison.spendChange).text})
ROAS:              ${report.summary.roas.toFixed(2)}x (${formatChange(report.comparison.roasChange).text})
ROI:               ${report.summary.roi.toFixed(1)}%
Bookings:          ${report.summary.totalBookings} (${formatChange(report.comparison.bookingsChange).text})
Calls:             ${report.summary.totalCalls} (${formatChange(report.comparison.callsChange).text})
Conversion Rate:   ${report.summary.conversionRate.toFixed(1)}%
`;

  if (report.topChannels.length > 0) {
    text += `\n\nTOP PERFORMING CHANNELS\n${"=".repeat(60)}\n`;
    report.topChannels.forEach((channel, idx) => {
      text += `\n${idx + 1}. ${channel.channelName}\n`;
      text += `   ROAS: ${channel.roas.toFixed(2)}x | Revenue: ${formatCurrency(channel.revenue)} | Spend: ${formatCurrency(channel.spend)}\n`;
    });
  }

  if (report.insights.length > 0) {
    text += `\n\nKEY INSIGHTS\n${"=".repeat(60)}\n`;
    report.insights.forEach(insight => {
      text += `\n[${insight.type.toUpperCase()}] ${insight.title}\n`;
      text += `${insight.description}\n`;
    });
  }

  if (report.recommendations.length > 0) {
    text += `\n\nRECOMMENDATIONS\n${"=".repeat(60)}\n`;
    report.recommendations.forEach((rec, idx) => {
      text += `\n${idx + 1}. [${rec.priority.toUpperCase()}] ${rec.title}\n`;
      text += `   ${rec.description}\n`;
      text += `   Expected Impact: ${rec.expectedImpact}\n`;
    });
  }

  text += `\n\n${"=".repeat(60)}\nGenerated by ClearLedger on ${format(report.generatedAt, "MMMM d, yyyy 'at' h:mm a")}\n`;

  return text;
}
