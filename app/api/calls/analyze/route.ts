import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { analyzeCall, analyzeBatchCalls } from "@/lib/ai/call-analyzer";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { callId, callIds, transcription } = body;

    // Single call analysis
    if (callId) {
      const call = await prisma.call.findUnique({
        where: { id: callId },
      });

      if (!call) {
        return NextResponse.json({ error: "Call not found" }, { status: 404 });
      }

      if (!call.transcription) {
        return NextResponse.json(
          { error: "Call has no transcription" },
          { status: 400 }
        );
      }

      const analysis = await analyzeCall(call.transcription);

      // Update call with analysis results
      await prisma.call.update({
        where: { id: callId },
        data: {
          sentiment: analysis.sentiment,
          leadQuality: analysis.leadQuality,
          leadScore: analysis.leadScore,
          attributedValue: analysis.estimatedValue,
          tags: analysis.keywords.join(","),
          metadata: JSON.stringify({
            urgency: analysis.urgency,
            serviceRequested: analysis.serviceRequested,
            summary: analysis.summary,
          }),
        },
      });

      return NextResponse.json({
        callId,
        analysis,
      });
    }

    // Batch call analysis
    if (callIds && Array.isArray(callIds)) {
      const calls = await prisma.call.findMany({
        where: {
          id: { in: callIds },
          transcription: { not: null },
        },
        select: {
          id: true,
          transcription: true,
        },
      });

      const transcriptions = calls
        .filter((c) => c.transcription)
        .map((c) => ({
          id: c.id,
          transcription: c.transcription!,
        }));

      const results = await analyzeBatchCalls(transcriptions);

      // Update all calls with analysis results
      for (const result of results) {
        await prisma.call.update({
          where: { id: result.id },
          data: {
            sentiment: result.analysis.sentiment,
            leadQuality: result.analysis.leadQuality,
            leadScore: result.analysis.leadScore,
            attributedValue: result.analysis.estimatedValue,
            tags: result.analysis.keywords.join(","),
            metadata: JSON.stringify({
              urgency: result.analysis.urgency,
              serviceRequested: result.analysis.serviceRequested,
              summary: result.analysis.summary,
            }),
          },
        });
      }

      return NextResponse.json({
        callsAnalyzed: results.length,
        results,
      });
    }

    // Direct transcription analysis (no call ID)
    if (transcription) {
      const analysis = await analyzeCall(transcription);
      return NextResponse.json({ analysis });
    }

    return NextResponse.json(
      { error: "Either callId, callIds, or transcription is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error analyzing call:", error);
    return NextResponse.json(
      { error: "Failed to analyze call" },
      { status: 500 }
    );
  }
}
