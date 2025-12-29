/**
 * Budget Optimizer
 *
 * Optimizes marketing budget allocation across channels to maximize ROI
 */

export interface ChannelPerformance {
  id: string;
  name: string;
  historicalSpend: number;
  historicalRevenue: number;
  historicalBookings: number;
  avgROI: number;
}

export interface BudgetAllocation {
  channelId: string;
  channelName: string;
  currentSpend: number;
  recommendedSpend: number;
  expectedRevenue: number;
  expectedROI: number;
  change: number;
  changePercentage: number;
  reasoning: string;
}

export interface OptimizationConstraints {
  minPerChannel: number;
  maxPerChannel: number;
  minChangePercentage?: number; // Minimum % change to recommend
}

/**
 * Predict ROI based on historical performance with diminishing returns
 */
export function predictROI(channel: ChannelPerformance, spend: number): number {
  if (channel.historicalSpend === 0) return 0;

  const historicalROI = channel.historicalRevenue / channel.historicalSpend;

  // Apply diminishing returns: 5% decay per $1000 spent
  const decayFactor = Math.pow(0.95, spend / 1000);

  return spend * historicalROI * decayFactor;
}

/**
 * Calculate marginal ROI (incremental ROI from spending $1 more)
 */
export function calculateMarginalROI(
  channel: ChannelPerformance,
  currentSpend: number,
  increment: number = 100
): number {
  const currentRevenue = predictROI(channel, currentSpend);
  const incrementedRevenue = predictROI(channel, currentSpend + increment);
  return (incrementedRevenue - currentRevenue) / increment;
}

/**
 * Optimize budget allocation using greedy algorithm
 * Allocates budget to the channel with highest marginal ROI until constraints are met
 */
export function optimizeBudget(
  channels: ChannelPerformance[],
  totalBudget: number,
  constraints: OptimizationConstraints
): BudgetAllocation[] {
  const { minPerChannel, maxPerChannel } = constraints;

  // Initialize with minimum spend per channel
  const allocation = new Map<string, number>();
  channels.forEach(channel => {
    allocation.set(channel.id, minPerChannel);
  });

  let remainingBudget = totalBudget - (channels.length * minPerChannel);

  // If not enough budget for minimum allocation
  if (remainingBudget < 0) {
    const equalSplit = totalBudget / channels.length;
    channels.forEach(channel => {
      allocation.set(channel.id, equalSplit);
    });
    remainingBudget = 0;
  }

  // Greedy allocation: repeatedly allocate to channel with highest marginal ROI
  const incrementSize = 100; // Allocate in $100 increments

  while (remainingBudget >= incrementSize) {
    // Calculate marginal ROI for each channel
    const marginalROIs = channels.map(channel => {
      const currentSpend = allocation.get(channel.id) || 0;
      const marginalROI = calculateMarginalROI(channel, currentSpend, incrementSize);

      return {
        channelId: channel.id,
        marginalROI,
        currentSpend
      };
    });

    // Find channel with highest marginal ROI that hasn't hit max
    const best = marginalROIs
      .filter(m => m.currentSpend < maxPerChannel)
      .sort((a, b) => b.marginalROI - a.marginalROI)[0];

    if (!best || best.marginalROI <= 0) break;

    // Allocate increment to best channel
    const actualIncrement = Math.min(
      incrementSize,
      remainingBudget,
      maxPerChannel - best.currentSpend
    );

    allocation.set(best.channelId, (allocation.get(best.channelId) || 0) + actualIncrement);
    remainingBudget -= actualIncrement;
  }

  // Build allocation results with recommendations
  const results: BudgetAllocation[] = channels.map(channel => {
    const recommendedSpend = allocation.get(channel.id) || 0;
    const currentSpend = channel.historicalSpend;
    const change = recommendedSpend - currentSpend;
    const changePercentage = currentSpend > 0 ? (change / currentSpend) * 100 : 0;
    const expectedRevenue = predictROI(channel, recommendedSpend);
    const expectedROI = recommendedSpend > 0 ? (expectedRevenue / recommendedSpend - 1) * 100 : 0;

    // Generate reasoning
    let reasoning = "";
    if (change > 0) {
      reasoning = `High marginal ROI (${expectedROI.toFixed(1)}%). Channel is underinvested relative to performance.`;
    } else if (change < 0) {
      reasoning = `Declining returns detected. Better ROI available from other channels.`;
    } else {
      reasoning = `Optimal spend level. Marginal ROI balanced with other channels.`;
    }

    return {
      channelId: channel.id,
      channelName: channel.name,
      currentSpend,
      recommendedSpend,
      expectedRevenue,
      expectedROI,
      change,
      changePercentage,
      reasoning
    };
  });

  return results.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

/**
 * Simulate different budget scenarios
 */
export function simulateBudgetScenarios(
  channels: ChannelPerformance[],
  budgets: number[],
  constraints: OptimizationConstraints
): Record<number, { allocation: BudgetAllocation[]; totalExpectedRevenue: number; totalExpectedROI: number }> {
  const scenarios: Record<number, any> = {};

  budgets.forEach(budget => {
    const allocation = optimizeBudget(channels, budget, constraints);
    const totalExpectedRevenue = allocation.reduce((sum, a) => sum + a.expectedRevenue, 0);
    const totalExpectedROI = budget > 0 ? ((totalExpectedRevenue / budget) - 1) * 100 : 0;

    scenarios[budget] = {
      allocation,
      totalExpectedRevenue,
      totalExpectedROI
    };
  });

  return scenarios;
}

/**
 * Find optimal total budget based on ROI threshold
 */
export function findOptimalBudget(
  channels: ChannelPerformance[],
  minBudget: number,
  maxBudget: number,
  targetROI: number,
  constraints: OptimizationConstraints
): { optimalBudget: number; expectedRevenue: number; expectedROI: number } {
  let optimalBudget = minBudget;
  let bestROI = 0;

  // Test budgets in $1000 increments
  for (let budget = minBudget; budget <= maxBudget; budget += 1000) {
    const allocation = optimizeBudget(channels, budget, constraints);
    const totalRevenue = allocation.reduce((sum, a) => sum + a.expectedRevenue, 0);
    const roi = budget > 0 ? ((totalRevenue / budget) - 1) * 100 : 0;

    if (roi >= targetROI && roi > bestROI) {
      optimalBudget = budget;
      bestROI = roi;
    }

    // Stop if ROI drops below target (diminishing returns kicking in)
    if (roi < targetROI && budget > minBudget) {
      break;
    }
  }

  const finalAllocation = optimizeBudget(channels, optimalBudget, constraints);
  const expectedRevenue = finalAllocation.reduce((sum, a) => sum + a.expectedRevenue, 0);

  return {
    optimalBudget,
    expectedRevenue,
    expectedROI: bestROI
  };
}
