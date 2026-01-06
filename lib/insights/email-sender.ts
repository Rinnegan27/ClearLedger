/**
 * Email Sender for Insight Reports
 *
 * Sends formatted insight reports via email
 * Uses Resend API (can be swapped for SendGrid, AWS SES, etc.)
 */

import { InsightReport } from "./report-generator";
import { formatReportEmail, formatReportText } from "./email-formatter";

export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Send insight report via email
 *
 * Uses Resend API if RESEND_API_KEY is configured, otherwise logs to console
 */
export async function sendReportEmail(
  report: InsightReport,
  companyName: string,
  recipients: EmailRecipient[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured. Email will be logged to console.");
    console.log("=== EMAIL PREVIEW ===");
    console.log(`To: ${recipients.map(r => r.email).join(", ")}`);
    console.log(`Subject: ${getPeriodLabel(report.period)} Marketing Report - ${companyName}`);
    console.log("\n--- Plain Text Version ---\n");
    console.log(formatReportText(report, companyName));
    return { success: true, messageId: "preview-mode" };
  }

  try {
    const htmlBody = formatReportEmail(report, companyName);
    const textBody = formatReportText(report, companyName);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "reports@clearledger.com",
        to: recipients.map(r => r.email),
        subject: `${getPeriodLabel(report.period)} Marketing Report - ${companyName}`,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email via Resend:", error);
      return {
        success: false,
        error: `Email service error: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log(`Report email sent successfully to ${recipients.length} recipients. ID: ${data.id}`);

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: any) {
    console.error("Failed to send report email:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Get period label for subject line
 */
function getPeriodLabel(period: "weekly" | "monthly"): string {
  return period === "weekly" ? "Weekly" : "Monthly";
}

/**
 * Send reports to all configured recipients for a company
 */
export async function sendCompanyReport(
  report: InsightReport,
  companyName: string
): Promise<{ success: boolean; error?: string }> {
  // In a real implementation, you'd fetch configured email recipients from database
  // For now, we'll get all admin users for the company

  const prisma = (await import("@/lib/db")).default;

  const companyUsers = await prisma.companyUser.findMany({
    where: {
      companyId: report.companyId,
      role: { in: ["admin", "owner"] }, // Only send to admins/owners
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (companyUsers.length === 0) {
    console.log(`No recipients found for company ${companyName}`);
    return { success: false, error: "No recipients configured" };
  }

  const recipients = companyUsers.map(cu => ({
    email: cu.user.email,
    name: cu.user.name || undefined,
  }));

  return await sendReportEmail(report, companyName, recipients);
}
