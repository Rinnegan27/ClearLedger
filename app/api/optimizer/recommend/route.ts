import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  optimizeBudget,
  simulateBudgetScenarios,
  findOptimalBudget,
  type ChannelPerformance,
} from "@/lib/optimizer/budget-optimizer";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      totalBudget,
      minPerChannel = 500,
      maxPerChannel = 50000,
      targetROI,
      simulateScenarios,
      scenarioBudgets,
    } = body;

    if (!totalBudget) {
      return NextResponse.json(
        { error: "totalBudget is required" },
        { status: 400 }
      );
    }

    // TODO: Get actual company ID from session
    const companyId = "temp-company-id"; // Replace with actual logic

    // Get historical performance for all channels
    const channels = await prisma.marketingChannel.findMany({
      where: { companyId, isActive: true },
      include: {
        adSpends: {
          select: {
            amount: true,
          },
        },
        bookings: {
          where: {
            status: "COMPLETED",
            revenue: { not: null },
          },
          select: {
            revenue: true,
          },
        },
      },
    });

    const channelPerformance: ChannelPerformance[] = channels.map((channel) => {
      const historicalSpend = channel.adSpends.reduce(
        (sum, spend) => sum + spend.amount,
        0
      );
      const historicalRevenue = channel.bookings.reduce(
        (sum, booking) => sum + (booking.revenue || 0),
        0
      );
      const historicalBookings = channel.bookings.length;
      const avgROI =
        historicalSpend > 0
          ? ((historicalRevenue - historicalSpend) / historicalSpend) * 100
          : 0;

      return {
        id: channel.id,
        name: channel.name,
        historicalSpend,
        historicalRevenue,
        historicalBookings,
        avgROI,
      };
    });

    // Optimize budget allocation
    const allocation = optimizeBudget(channelPerformance, totalBudget, {
      minPerChannel,
      maxPerChannel,
    });

    // Calculate total expected metrics
    const totalExpectedRevenue = allocation.reduce(
      (sum, a) => sum + a.expectedRevenue,
      0
    );
    const totalExpectedROI =
      totalBudget > 0 ? ((totalExpectedRevenue / totalBudget - 1) * 100) : 0;

    let scenarios = null;
    if (simulateScenarios && scenarioBudgets) {
      scenarios = simulateBudgetScenarios(
        channelPerformance,
        scenarioBudgets,
        { minPerChannel, maxPerChannel }
      );
    }

    let optimalBudget = null;
    if (targetROI) {
      optimalBudget = findOptimalBudget(
        channelPerformance,
        totalBudget * 0.5, // Min budget: 50% of requested
        totalBudget * 2, // Max budget: 200% of requested
        targetROI,
        { minPerChannel, maxPerChannel }
      );
    }

    return NextResponse.json({
      recommendations: allocation,
      summary: {
        totalBudget,
        totalExpectedRevenue,
        totalExpectedROI,
        totalExpectedProfit: totalExpectedRevenue - totalBudget,
      },
      scenarios,
      optimalBudget,
    });
  } catch (error) {
    console.error("Error optimizing budget:", error);
    return NextResponse.json(
      { error: "Failed to optimize budget" },
      { status: 500 }
    );
  }
}
