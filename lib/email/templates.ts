/**
 * Email verification template
 */
export function getVerificationEmailTemplate(
  name: string,
  verificationUrl: string
): { subject: string; html: string } {
  return {
    subject: "Verify your ClearLedger account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6B2737; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #6B2737; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ClearLedger!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for signing up for ClearLedger. To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6B2737;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with ClearLedger, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ClearLedger. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Password reset email template
 */
export function getPasswordResetEmailTemplate(
  name: string,
  resetUrl: string
): { subject: string; html: string } {
  return {
    subject: "Reset your ClearLedger password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6B2737; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #6B2737; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password for your ClearLedger account. Click the button below to reset it:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6B2737;">${resetUrl}</p>
              <div class="warning">
                <strong>Security Note:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </div>
              <p>For security reasons, we recommend choosing a strong password that you don't use for other accounts.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ClearLedger. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Password changed notification template
 */
export function getPasswordChangedEmailTemplate(
  name: string
): { subject: string; html: string } {
  return {
    subject: "Your ClearLedger password was changed",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed Successfully</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>This is a confirmation that your ClearLedger account password was successfully changed.</p>
              <div class="warning">
                <strong>Didn't make this change?</strong> If you didn't change your password, please contact our support team immediately at support@clearledger.com.
              </div>
              <p>For your security, all active sessions on other devices have been logged out. You'll need to sign in again with your new password.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ClearLedger. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
