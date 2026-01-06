import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { trackCall } from "@/lib/integrations/touchpoint-tracker";
import { analyzeCall } from "@/lib/ai/call-analyzer";
import { createNotification } from "@/lib/notifications/create";

/**
 * POST /api/webhooks/callrail
 *
 * Handle incoming webhooks from CallRail for call tracking.
 * Tracks touchpoints, analyzes call quality, and sends notifications for missed calls.
 *
 * CallRail Webhook Documentation:
 * https://apidocs.callrail.com/#webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // TODO: Verify CallRail webhook signature
    // const signature = req.headers.get('x-callrail-signature');
    // if (!verifySignature(signature, payload)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Extract call data from payload
    const {
      id: externalId,
      customer_phone_number: phoneNumber,
      customer_name: callerName,
      duration,
      answered,
      start_time: startTime,
      tracking_phone_number: trackingNumber,
      company_id: callRailCompanyId,
      recording_url: recordingUrl,
      transcription,
      source,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
    } = payload;

    // Find the company and channel based on tracking number or company ID
    // TODO: Map CallRail company ID to our company ID
    const companyId = "temp-company-id"; // Replace with actual mapping logic

    // Find the marketing channel for this call
    // Could be based on UTM source or tracking number
    let channelId = "temp-channel-id"; // Default channel

    if (utmSource) {
      // Try to find channel by UTM source
      const channel = await prisma.marketingChannel.findFirst({
        where: {
          companyId,
          OR: [
            { name: { contains: utmSource } },
            { type: { contains: utmSource } },
          ]
        }
      });
      if (channel) {
        channelId = channel.id;
      }
    }

    // Determine if this is a missed call
    const isMissed = !answered || duration < 30; // Less than 30 seconds = likely missed
    const callStatus = answered ? "answered" : "missed";

    // Save call to database (find by externalId first since it's not unique)
    const existingCall = await prisma.call.findFirst({
      where: { externalId },
    });

    const call = existingCall
      ? await prisma.call.update({
          where: { id: existingCall.id },
          data: {
            phoneNumber,
            callerName: callerName || null,
            duration: duration || 0,
            status: callStatus,
            recordingUrl: recordingUrl || null,
            transcription: transcription || null,
            callDate: new Date(startTime),
            metadata: JSON.stringify({
              trackingNumber,
              callRailCompanyId,
              source,
              utmSource,
              utmMedium,
              utmCampaign,
            }),
          },
        })
      : await prisma.call.create({
          data: {
            companyId,
            channelId,
            externalId,
            phoneNumber,
            callerName: callerName || null,
            duration: duration || 0,
            status: callStatus,
            recordingUrl: recordingUrl || null,
            transcription: transcription || null,
            callDate: new Date(startTime),
            metadata: JSON.stringify({
              trackingNumber,
              callRailCompanyId,
              source,
              utmSource,
              utmMedium,
              utmCampaign,
            }),
          },
        });

    // Track touchpoint for attribution
    await trackCall(
      companyId,
      channelId,
      phoneNumber,
      callerName || undefined,
      duration,
      new Date(startTime),
      {
        source: utmSource,
        medium: utmMedium,
        campaign: utmCampaign,
        content: utmContent,
        term: utmTerm,
      }
    );

    // Analyze call quality if we have a transcription
    if (transcription) {
      try {
        const analysis = await analyzeCall(transcription);

        // Update call with AI analysis
        await prisma.call.update({
          where: { id: call.id },
          data: {
            sentiment: analysis.sentiment,
            leadQuality: analysis.leadQuality,
            leadScore: analysis.leadScore,
            attributedValue: analysis.estimatedValue,
            tags: analysis.keywords.join(","),
            metadata: JSON.stringify({
              trackingNumber,
              callRailCompanyId,
              source,
              utmSource,
              utmMedium,
              utmCampaign,
              aiAnalysis: {
                urgency: analysis.urgency,
                serviceRequested: analysis.serviceRequested,
                summary: analysis.summary,
              },
            }),
          },
        });
      } catch (error) {
        console.error("Error analyzing call:", error);
        // Continue even if AI analysis fails
      }
    }

    // Send notification for high-value missed calls
    if (isMissed) {
      const estimatedValue = call.attributedValue || 500; // Default estimate
      const leadScore = call.leadScore || 5;

      // Only notify for warm/hot leads (score > 6)
      if (leadScore > 6) {
        // TODO: Get actual company owner/user ID
        const userId = "temp-user-id";

        await createNotification({
          userId,
          type: "missed_call",
          title: "High-Value Missed Call",
          message: `Missed call from ${phoneNumber} ${callerName ? `(${callerName})` : ""} - Est. value: $${estimatedValue}`,
          data: {
            callId: call.id,
            phoneNumber,
            callerName,
            estimatedValue,
            leadScore,
            source: utmSource || source || "unknown",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      callId: call.id,
      tracked: true,
      analyzed: !!transcription,
    });
  } catch (error) {
    console.error("Error processing CallRail webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Verify CallRail webhook signature
 * TODO: Implement signature verification for security
 */
function verifySignature(signature: string | null, payload: any): boolean {
  // CallRail signs webhooks with HMAC-SHA256
  // Implementation needed based on CallRail webhook secret
  return true; // Temporarily allow all requests
}
