import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { GoogleAdsClient } from "@/lib/integrations/google-ads";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Get user's company ID from session
    // For now, using temp-company-id
    const companyId = "temp-company-id";

    // Find or create Google Ads channel
    let googleAdsChannel = await prisma.marketingChannel.findFirst({
      where: {
        companyId,
        type: "google_ads",
      },
    });

    if (!googleAdsChannel) {
      googleAdsChannel = await prisma.marketingChannel.create({
        data: {
          companyId,
          name: "Google Ads",
          type: "google_ads",
          description: "Google Ads campaigns",
        },
      });
    }

    // Create Google Ads client with mock data (no credentials needed)
    const client = new GoogleAdsClient({
      clientId: "mock",
      clientSecret: "mock",
      developerToken: "mock",
      refreshToken: "mock",
      customerId: "mock",
    });

    // Log sync start
    const syncLog = await prisma.syncLog.create({
      data: {
        integrationId: googleAdsChannel.id,
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    try {
      // Perform sync
      const recordsSynced = await client.syncToDatabase(
        companyId,
        googleAdsChannel.id
      );

      // Update sync log with success
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "success",
          recordsSynced,
          completedAt: new Date(),
        },
      });

      // Update integration last synced time
      await prisma.integration.upsert({
        where: {
          companyId_type: {
            companyId,
            type: "google_ads",
          },
        },
        update: {
          lastSyncedAt: new Date(),
        },
        create: {
          companyId,
          type: "google_ads",
          name: "Google Ads",
          isActive: true,
          credentials: "{}",
          lastSyncedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${recordsSynced} records from Google Ads`,
        recordsSynced,
      });
    } catch (syncError: any) {
      // Update sync log with failure
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "failed",
          errorMessage: syncError.message,
          completedAt: new Date(),
        },
      });

      throw syncError;
    }
  } catch (error: any) {
    console.error("Google Ads sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Google Ads data", details: error.message },
      { status: 500 }
    );
  }
}
