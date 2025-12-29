/**
 * Attribution Models
 *
 * Implements 5 different attribution models for marketing touchpoints:
 * 1. Last-Touch: 100% credit to final touchpoint
 * 2. First-Touch: 100% credit to initial touchpoint
 * 3. Linear: Equal credit across all touchpoints
 * 4. Time-Decay: More recent touchpoints get more credit
 * 5. Position-Based: 40% first, 40% last, 20% distributed to middle
 */

export type AttributionModel = "first-touch" | "last-touch" | "linear" | "time-decay" | "position-based";

export interface TouchPoint {
  id: string;
  channelId: string;
  campaignId?: string | null;
  timestamp: Date;
  touchpointType: string;
}

export interface ChannelAttribution {
  channelId: string;
  revenue: number;
  weight: number;
}

/**
 * Last-Touch Attribution
 * Gives 100% credit to the final touchpoint before conversion
 */
export function lastTouch(touchpoints: TouchPoint[], revenue: number): ChannelAttribution[] {
  if (touchpoints.length === 0) return [];

  const last = touchpoints[touchpoints.length - 1];
  return [{ channelId: last.channelId, revenue, weight: 1.0 }];
}

/**
 * First-Touch Attribution
 * Gives 100% credit to the initial touchpoint
 */
export function firstTouch(touchpoints: TouchPoint[], revenue: number): ChannelAttribution[] {
  if (touchpoints.length === 0) return [];

  const first = touchpoints[0];
  return [{ channelId: first.channelId, revenue, weight: 1.0 }];
}

/**
 * Linear Attribution
 * Distributes credit equally across all touchpoints
 */
export function linear(touchpoints: TouchPoint[], revenue: number): ChannelAttribution[] {
  if (touchpoints.length === 0) return [];

  const weight = 1 / touchpoints.length;
  const revenuePerTouch = revenue * weight;

  // Aggregate by channel
  const channelMap = new Map<string, number>();
  touchpoints.forEach(tp => {
    const current = channelMap.get(tp.channelId) || 0;
    channelMap.set(tp.channelId, current + revenuePerTouch);
  });

  return Array.from(channelMap.entries()).map(([channelId, rev]) => ({
    channelId,
    revenue: rev,
    weight: rev / revenue
  }));
}

/**
 * Time-Decay Attribution
 * More recent touchpoints receive exponentially more credit
 * Uses a 7-day half-life for exponential decay
 */
export function timeDecay(touchpoints: TouchPoint[], revenue: number): ChannelAttribution[] {
  if (touchpoints.length === 0) return [];

  const halfLife = 7; // days
  const now = new Date();

  // Calculate weights based on exponential decay
  const weights = touchpoints.map(tp => {
    const daysAgo = (now.getTime() - new Date(tp.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-daysAgo / halfLife);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Normalize weights and calculate revenue per touchpoint
  const channelMap = new Map<string, { revenue: number; weight: number }>();
  touchpoints.forEach((tp, i) => {
    const normalizedWeight = weights[i] / totalWeight;
    const touchRevenue = revenue * normalizedWeight;

    const current = channelMap.get(tp.channelId) || { revenue: 0, weight: 0 };
    channelMap.set(tp.channelId, {
      revenue: current.revenue + touchRevenue,
      weight: current.weight + normalizedWeight
    });
  });

  return Array.from(channelMap.entries()).map(([channelId, data]) => ({
    channelId,
    revenue: data.revenue,
    weight: data.weight
  }));
}

/**
 * Position-Based Attribution (U-Shaped)
 * 40% to first touchpoint, 40% to last touchpoint, 20% distributed to middle
 */
export function positionBased(touchpoints: TouchPoint[], revenue: number): ChannelAttribution[] {
  if (touchpoints.length === 0) return [];

  // Single touchpoint gets 100%
  if (touchpoints.length === 1) {
    return [{ channelId: touchpoints[0].channelId, revenue, weight: 1.0 }];
  }

  const first = touchpoints[0];
  const last = touchpoints[touchpoints.length - 1];
  const middle = touchpoints.slice(1, -1);

  const channelMap = new Map<string, { revenue: number; weight: number }>();

  // First touch: 40%
  const firstRevenue = revenue * 0.4;
  channelMap.set(first.channelId, { revenue: firstRevenue, weight: 0.4 });

  // Last touch: 40%
  const lastRevenue = revenue * 0.4;
  const lastCurrent = channelMap.get(last.channelId) || { revenue: 0, weight: 0 };
  channelMap.set(last.channelId, {
    revenue: lastCurrent.revenue + lastRevenue,
    weight: lastCurrent.weight + 0.4
  });

  // Middle touches: 20% distributed equally
  if (middle.length > 0) {
    const middleWeight = 0.2 / middle.length;
    const middleRevenue = revenue * middleWeight;

    middle.forEach(tp => {
      const current = channelMap.get(tp.channelId) || { revenue: 0, weight: 0 };
      channelMap.set(tp.channelId, {
        revenue: current.revenue + middleRevenue,
        weight: current.weight + middleWeight
      });
    });
  }

  return Array.from(channelMap.entries()).map(([channelId, data]) => ({
    channelId,
    revenue: data.revenue,
    weight: data.weight
  }));
}

/**
 * Apply the selected attribution model
 */
export function applyAttributionModel(
  touchpoints: TouchPoint[],
  revenue: number,
  model: AttributionModel
): ChannelAttribution[] {
  switch (model) {
    case "first-touch":
      return firstTouch(touchpoints, revenue);
    case "last-touch":
      return lastTouch(touchpoints, revenue);
    case "linear":
      return linear(touchpoints, revenue);
    case "time-decay":
      return timeDecay(touchpoints, revenue);
    case "position-based":
      return positionBased(touchpoints, revenue);
    default:
      return lastTouch(touchpoints, revenue); // Default to last-touch
  }
}
