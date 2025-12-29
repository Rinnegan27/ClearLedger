import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendEmail } from "@/lib/email/send";
import { getPasswordResetEmailTemplate } from "@/lib/email/templates";
import prisma from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, we sent password reset instructions.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token: resetToken,
        expires,
      },
    });

    // Send reset email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;
    const emailTemplate = getPasswordResetEmailTemplate(
      user.name || "there",
      resetUrl
    );

    try {
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, we sent password reset instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
