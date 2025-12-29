import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Create email transporter
 * Uses environment variables for configuration
 */
function createTransporter() {
  // For development, use a test account or console logging
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    // Return a fake transporter for development
    return {
      sendMail: async (options: any) => {
        console.log("📧 Email would be sent:");
        console.log("To:", options.to);
        console.log("Subject:", options.subject);
        console.log("Body:", options.html);
        return { messageId: "dev-message-id" };
      },
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Send an email
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailOptions): Promise<void> {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@clearledger.com",
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
  };

  await transporter.sendMail(mailOptions);
}
