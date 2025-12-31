import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { MetaAdsClient } from "@/lib/integrations/meta-ads";
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

    // Find or create Meta Ads channel
    let metaAdsChannel = await prisma.marketingChannel.findFirst({
      where: {
        companyId,
        type: "meta_ads",
      },
    });

    if (!metaAdsChannel) {
      metaAdsChannel = await prisma.marketingChannel.create({
        data: {
          companyId,
          name: "Meta Ads",
          type: "meta_ads",
          description: "Facebook and Instagram ads",
        },
      });
    }

    // Create Meta Ads client with mock data (no credentials needed)
    const client = new MetaAdsClient({
      appId: "mock",
      appSecret: "mock",
      accessToken: "mock",
      adAccountId: "mock",
    });

    // Log sync start
    const syncLog = await prisma.syncLog.create({
      data: {
        integrationId: metaAdsChannel.id,
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    try {
      // Perform sync
      const recordsSynced = await client.syncToDatabase(
        companyId,
        metaAdsChannel.id
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
          companyId_provider: {
            companyId,
            provider: "meta_ads",
          },
        },
        update: {
          lastSyncedAt: new Date(),
        },
        create: {
          companyId,
          provider: "meta_ads",
          status: "connected",
          lastSyncedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${recordsSynced} records from Meta Ads`,
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
    console.error("Meta Ads sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Meta Ads data", details: error.message },
      { status: 500 }
    );
  }
}
