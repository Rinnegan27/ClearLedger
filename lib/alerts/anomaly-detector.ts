/**
 * Anomaly Detection Engine
 *
 * Implements multiple statistical methods for detecting anomalies in marketing metrics:
 * - Z-Score: Standard deviation-based outlier detection
 * - IQR (Interquartile Range): Robust outlier detection
 * - Trend Reversal: Moving average crossing detection
 * - Sudden Spike: Rapid percentage change detection
 * - Gradual Decline: Sustained downward trend detection
 */

export interface DataPoint {
  date: Date;
  value: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  confidence: number; // 0-1, how confident we are this is an anomaly
  deviation: number; // How far from baseline
  baselineValue: number; // Expected value
  actualValue: number;
  method: string;
  explanation: string;
}

/**
 * Calculate mean (average) of values
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Calculate percentile
 */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Z-Score Anomaly Detection
 *
 * Detects outliers based on standard deviations from mean.
 * A value is anomalous if it's more than N standard deviations away from the mean.
 *
 * @param dataPoints - Historical data points
 * @param currentValue - Value to check
 * @param sensitivity - 0-1, where higher is more sensitive (default 0.7 = ~2 std devs)
 */
export function detectZScoreAnomaly(
  dataPoints: DataPoint[],
  currentValue: number,
  sensitivity: number = 0.7
): AnomalyResult {
  if (dataPoints.length < 3) {
    return {
      isAnomaly: false,
      confidence: 0,
      deviation: 0,
      baselineValue: currentValue,
      actualValue: currentValue,
      method: "zscore",
      explanation: "Insufficient data for Z-score analysis (need at least 3 points)"
    };
  }

  const values = dataPoints.map(dp => dp.value);
  const avg = mean(values);
  const stdDev = standardDeviation(values);

  if (stdDev === 0) {
    return {
      isAnomaly: false,
      confidence: 0,
      deviation: 0,
      baselineValue: avg,
      actualValue: currentValue,
      method: "zscore",
      explanation: "No variance in historical data"
    };
  }

  const zScore = Math.abs((currentValue - avg) / stdDev);

  // Sensitivity mapping: 0.5 = 3σ, 0.7 = 2σ, 0.9 = 1.5σ
  const threshold = 3.5 - (sensitivity * 2);
  const isAnomaly = zScore > threshold;

  // Confidence based on how far beyond threshold
  const confidence = Math.min(1, (zScore - threshold) / threshold);

  const deviation = ((currentValue - avg) / avg) * 100;

  return {
    isAnomaly,
    confidence: isAnomaly ? confidence : 0,
    deviation,
    baselineValue: avg,
    actualValue: currentValue,
    method: "zscore",
    explanation: isAnomaly
      ? `Value deviates ${zScore.toFixed(2)} standard deviations from mean (${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%)`
      : `Value within normal range (${zScore.toFixed(2)}σ from mean)`
  };
}

/**
 * IQR (Interquartile Range) Anomaly Detection
 *
 * More robust to outliers than Z-score. Uses quartiles instead of mean/std.
 * A value is anomalous if it's outside [Q1 - k*IQR, Q3 + k*IQR]
 *
 * @param dataPoints - Historical data points
 * @param currentValue - Value to check
 * @param sensitivity - 0-1, where higher is more sensitive
 */
export function detectIQRAnomaly(
  dataPoints: DataPoint[],
  currentValue: number,
  sensitivity: number = 0.7
): AnomalyResult {
  if (dataPoints.length < 4) {
    return {
      isAnomaly: false,
      confidence: 0,
      deviation: 0,
      baselineValue: currentValue,
      actualValue: currentValue,
      method: "iqr",
      explanation: "Insufficient data for IQR analysis (need at least 4 points)"
    };
  }

  const values = dataPoints.map(dp => dp.value);
  const q1 = percentile(values, 25);
  const q3 = percentile(values, 75);
  const iqr = q3 - q1;
  const median = percentile(values, 50);

  if (iqr === 0) {
    return {
      isAnomaly: false,
      confidence: 0,
      deviation: 0,
      baselineValue: median,
      actualValue: currentValue,
      method: "iqr",
      explanation: "No variance in data quartiles"
    };
  }

  // Sensitivity mapping: 0.5 = 2.5*IQR, 0.7 = 1.5*IQR, 0.9 = 1*IQR
  const k = 3 - (sensitivity * 1.5);
  const lowerBound = q1 - k * iqr;
  const upperBound = q3 + k * iqr;

  const isAnomaly = currentValue < lowerBound || currentValue > upperBound;

  // Calculate how far outside bounds
  let distanceFromBounds = 0;
  if (currentValue < lowerBound) {
    distanceFromBounds = (lowerBound - currentValue) / iqr;
  } else if (currentValue > upperBound) {
    distanceFromBounds = (currentValue - upperBound) / iqr;
  }

  const confidence = Math.min(1, distanceFromBounds);
  const deviation = ((currentValue - median) / median) * 100;

  return {
    isAnomaly,
    confidence: isAnomaly ? confidence : 0,
    deviation,
    baselineValue: median,
    actualValue: currentValue,
    method: "iqr",
    explanation: isAnomaly
      ? `Value outside IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}] by ${distanceFromBounds.toFixed(2)}×IQR`
      : `Value within IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`
  };
}

/**
 * Trend Reversal Detection
 *
 * Detects when short-term trend crosses long-term trend (moving average crossover)
 *
 * @param dataPoints - Historical data points (must be in chronological order)
 * @param sensitivity - 0-1, affects short-term window size
 */
export function detectTrendReversal(
  dataPoints: DataPoint[],
  sensitivity: number = 0.7
): AnomalyResult {
  if (dataPoints.length < 14) {
    return {
      isAnomaly: false,
      confidence: 0,
      deviation: 0,
      baselineValue: dataPoints[dataPoints.length - 1]?.value || 0,
      actualValue: dataPoints[dataPoints.length - 1]?.value || 0,
      method: "trend_reversal",
      explanation: "Insufficient data for trend analysis (need at least 14 points)"
    };
  }

  // Sensitivity mapping: higher sensitivity = shorter windows (more reactive)
  const shortWindow = Math.max(3, Math.floor(7 - sensitivity * 4));  // 3-7 days
  const longWindow = Math.max(10, Math.floor(21 - sensitivity * 7)); // 10-21 days

  const values = dataPoints.map(dp => dp.value);

  // Calculate moving averages
  const shortMA = mean(values.slice(-shortWindow));
  const longMA = mean(values.slice(-longWindow));
  const prevShortMA = mean(values.slice(-(shortWindow + 1), -1));
  const prevLongMA = mean(values.slice(-(longWindow + 1), -1));

  // Detect crossover
  const currentCrossAbove = shortMA > longMA && prevShortMA <= prevLongMA;
  const currentCrossBelow = shortMA < longMA && prevShortMA >= prevLongMA;

  const isAnomaly = currentCrossAbove || currentCrossBelow;

  // Confidence based on strength of crossover
  const crossoverStrength = Math.abs(shortMA - longMA) / longMA;
  const confidence = Math.min(1, crossoverStrength * 5);

  const deviation = ((shortMA - longMA) / longMA) * 100;
  const currentValue = values[values.length - 1];

  return {
    isAnomaly,
    confidence: isAnomaly ? confidence : 0,
    deviation,
    baselineValue: longMA,
    actualValue: currentValue,
    method: "trend_reversal",
    explanation: isAnomaly
      ? `Trend reversal detected: ${currentCrossAbove ? 'Upward' : 'Downward'} crossover (${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%)`
      : `No trend reversal (short MA ${shortMA.toFixed(2)} vs long MA ${longMA.toFixed(2)})`
  };
}

/**
 * Sudden Spike Detection
 *
 * Detects rapid percentage changes that exceed normal variation
 *
 * @param dataPoints - Historical data points
 * @param currentValue - Value to check
 * @param sensitivity - 0-1, threshold for what constitutes a "spike"
 */
export function detectSuddenSpike(
  dataPoints: DataPoint[],
  currentValue: number,
  sensitivity: number = 0.7
): AnomalyResult {
  if (dataPoints.length < 2) {
    return {
      isAnomaly: false,
      confidence: 0,
      deviation: 0,
      baselineValue: currentValue,
      actualValue: currentValue,
      method: "sudden_spike",
      explanation: "Insufficient data for spike detection"
    };
  }

  const recentValues = dataPoints.slice(-7).map(dp => dp.value); // Last 7 days
  const previousValue = recentValues[recentValues.length - 1];

  if (previousValue === 0) {
    return {
      isAnomaly: false,
      confidence: 0,
      deviation: 0,
      baselineValue: previousValue,
      actualValue: currentValue,
      method: "sudden_spike",
      explanation: "Cannot calculate spike from zero baseline"
    };
  }

  // Calculate historical daily changes
  const dailyChanges: number[] = [];
  for (let i = 1; i < recentValues.length; i++) {
    if (recentValues[i - 1] !== 0) {
      dailyChanges.push(Math.abs((recentValues[i] - recentValues[i - 1]) / recentValues[i - 1]));
    }
  }

  const avgChange = mean(dailyChanges);
  const stdChange = standardDeviation(dailyChanges);

  const currentChange = Math.abs((currentValue - previousValue) / previousValue);
  const deviation = ((currentValue - previousValue) / previousValue) * 100;

  // Sensitivity mapping: higher sensitivity = lower threshold
  const threshold = Math.max(0.1, (0.5 - sensitivity * 0.3) + avgChange + (stdChange * 2));

  const isAnomaly = currentChange > threshold;
  const confidence = Math.min(1, currentChange / threshold - 1);

  return {
    isAnomaly,
    confidence: isAnomaly ? confidence : 0,
    deviation,
    baselineValue: previousValue,
    actualValue: currentValue,
    method: "sudden_spike",
    explanation: isAnomaly
      ? `Sudden ${deviation > 0 ? 'increase' : 'decrease'} of ${Math.abs(deviation).toFixed(1)}% (threshold: ${(threshold * 100).toFixed(1)}%)`
      : `Change of ${Math.abs(deviation).toFixed(1)}% within normal range`
  };
}

/**
 * Gradual Decline Detection
 *
 * Detects sustained downward trends over multiple periods
 *
 * @param dataPoints - Historical data points
 * @param sensitivity - 0-1, affects detection threshold
 */
export function detectGradualDecline(
  dataPoints: DataPoint[],
  sensitivity: number = 0.7
): AnomalyResult {
  if (dataPoints.length < 7) {
    return {
      isAnomaly: false,
      confidence: 0,
      deviation: 0,
      baselineValue: dataPoints[dataPoints.length - 1]?.value || 0,
      actualValue: dataPoints[dataPoints.length - 1]?.value || 0,
      method: "gradual_decline",
      explanation: "Insufficient data for decline detection (need at least 7 points)"
    };
  }

  const values = dataPoints.map(dp => dp.value);
  const currentValue = values[values.length - 1];

  // Check for sustained decline
  const window = Math.min(7, values.length);
  const recentValues = values.slice(-window);

  // Count consecutive declines
  let consecutiveDeclines = 0;
  for (let i = recentValues.length - 1; i > 0; i--) {
    if (recentValues[i] < recentValues[i - 1]) {
      consecutiveDeclines++;
    } else {
      break;
    }
  }

  // Calculate overall decline
  const oldValue = recentValues[0];
  const totalDecline = oldValue > 0 ? ((currentValue - oldValue) / oldValue) * 100 : 0;

  // Sensitivity mapping: higher sensitivity = fewer required consecutive declines
  const requiredDeclines = Math.max(3, Math.floor(5 - sensitivity * 2));
  const declineThreshold = -(10 + (1 - sensitivity) * 20); // -10% to -30%

  const isAnomaly = consecutiveDeclines >= requiredDeclines && totalDecline < declineThreshold;
  const confidence = Math.min(1, (consecutiveDeclines / requiredDeclines) * (Math.abs(totalDecline) / Math.abs(declineThreshold)));

  return {
    isAnomaly,
    confidence: isAnomaly ? confidence : 0,
    deviation: totalDecline,
    baselineValue: oldValue,
    actualValue: currentValue,
    method: "gradual_decline",
    explanation: isAnomaly
      ? `Sustained decline detected: ${consecutiveDeclines} consecutive decreases, ${totalDecline.toFixed(1)}% total decline`
      : `No sustained decline (${consecutiveDeclines} consecutive decreases, ${totalDecline.toFixed(1)}% change)`
  };
}

/**
 * Run all anomaly detection methods and return combined result
 *
 * @param dataPoints - Historical data points
 * @param currentValue - Value to check
 * @param methods - Which detection methods to use
 * @param sensitivity - 0-1, overall sensitivity
 */
export function detectAnomalies(
  dataPoints: DataPoint[],
  currentValue: number,
  methods: string[] = ["zscore", "iqr", "trend_reversal", "sudden_spike", "gradual_decline"],
  sensitivity: number = 0.7
): AnomalyResult[] {
  const results: AnomalyResult[] = [];

  if (methods.includes("zscore")) {
    results.push(detectZScoreAnomaly(dataPoints, currentValue, sensitivity));
  }

  if (methods.includes("iqr")) {
    results.push(detectIQRAnomaly(dataPoints, currentValue, sensitivity));
  }

  if (methods.includes("trend_reversal")) {
    results.push(detectTrendReversal(dataPoints, sensitivity));
  }

  if (methods.includes("sudden_spike")) {
    results.push(detectSuddenSpike(dataPoints, currentValue, sensitivity));
  }

  if (methods.includes("gradual_decline")) {
    results.push(detectGradualDecline(dataPoints, sensitivity));
  }

  return results;
}

/**
 * Get the highest confidence anomaly result
 */
export function getMostSignificantAnomaly(results: AnomalyResult[]): AnomalyResult | null {
  const anomalies = results.filter(r => r.isAnomaly);
  if (anomalies.length === 0) return null;

  return anomalies.reduce((max, result) =>
    result.confidence > max.confidence ? result : max
  );
}
