/**
 * AI Call Analyzer
 *
 * Uses OpenAI GPT-4 to analyze call transcriptions and score lead quality
 */

import OpenAI from "openai";

export interface CallAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  leadQuality: "hot" | "warm" | "cold" | "spam";
  leadScore: number; // 0-10
  keywords: string[];
  estimatedValue: number;
  urgency: "immediate" | "soon" | "planning" | "browsing";
  serviceRequested: string;
  summary: string;
}

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Analyze a call transcription using OpenAI
 */
export async function analyzeCall(transcription: string): Promise<CallAnalysis> {
  if (!transcription || transcription.trim().length < 10) {
    // Return default analysis for very short transcriptions
    return {
      sentiment: "neutral",
      leadQuality: "cold",
      leadScore: 0,
      keywords: [],
      estimatedValue: 0,
      urgency: "browsing",
      serviceRequested: "Unknown",
      summary: "Transcription too short to analyze"
    };
  }

  const client = getOpenAIClient();

  const prompt = `Analyze this home services phone call transcription and provide a JSON response with the following structure:

{
  "sentiment": "positive" | "neutral" | "negative",
  "leadQuality": "hot" | "warm" | "cold" | "spam",
  "leadScore": 0-10 (number),
  "keywords": ["array", "of", "important", "keywords"],
  "estimatedValue": estimated revenue in dollars (number),
  "urgency": "immediate" | "soon" | "planning" | "browsing",
  "serviceRequested": "specific service type (e.g., HVAC repair, plumbing, roofing)",
  "summary": "brief summary of the call"
}

Guidelines for scoring:
- Hot lead (8-10): Customer has immediate need, ready to book, mentions specific problem
- Warm lead (5-7): Customer interested but comparing options or planning for future
- Cold lead (2-4): Customer just browsing, asking general questions
- Spam (0-1): Solicitation, wrong number, or irrelevant call

Estimated value should be based on typical job values:
- Emergency repairs: $500-$2,000
- Installations: $2,000-$10,000
- Routine maintenance: $100-$500
- Inspections/consultations: $100-$300

Transcription:
"""
${transcription}
"""

Respond with ONLY the JSON object, no additional text.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing home services customer calls to identify lead quality and estimate job value. You respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    const analysis: CallAnalysis = JSON.parse(content);

    // Validate and sanitize the response
    return {
      sentiment: analysis.sentiment || "neutral",
      leadQuality: analysis.leadQuality || "cold",
      leadScore: Math.max(0, Math.min(10, analysis.leadScore || 0)),
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      estimatedValue: Math.max(0, analysis.estimatedValue || 0),
      urgency: analysis.urgency || "browsing",
      serviceRequested: analysis.serviceRequested || "Unknown",
      summary: analysis.summary || "No summary available"
    };
  } catch (error) {
    console.error("Error analyzing call with OpenAI:", error);

    // Return a fallback analysis
    return {
      sentiment: "neutral",
      leadQuality: "warm",
      leadScore: 5,
      keywords: [],
      estimatedValue: 500,
      urgency: "soon",
      serviceRequested: "General inquiry",
      summary: "Error analyzing call: " + (error instanceof Error ? error.message : "Unknown error")
    };
  }
}

/**
 * Batch analyze multiple calls
 */
export async function analyzeBatchCalls(
  transcriptions: Array<{ id: string; transcription: string }>
): Promise<Array<{ id: string; analysis: CallAnalysis }>> {
  const results = await Promise.allSettled(
    transcriptions.map(async ({ id, transcription }) => ({
      id,
      analysis: await analyzeCall(transcription)
    }))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<{ id: string; analysis: CallAnalysis }> =>
      result.status === "fulfilled"
    )
    .map(result => result.value);
}

/**
 * Estimate the cost of analyzing a transcription
 * GPT-4 pricing: ~$0.03 per 1K tokens
 * Average call transcription: ~500-1000 words = ~700-1400 tokens
 * Estimated cost per call: $0.03-$0.05
 */
export function estimateAnalysisCost(transcription: string): number {
  // Rough estimate: 1 word ≈ 1.3 tokens
  const words = transcription.split(/\s+/).length;
  const estimatedTokens = words * 1.3;
  const costPer1kTokens = 0.03; // GPT-4 pricing
  return (estimatedTokens / 1000) * costPer1kTokens;
}
