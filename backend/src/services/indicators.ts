export type Signal = 'BUY' | 'SELL' | 'HOLD';

export function calculateMA(data: number[], period: number): number {
  if (period <= 0) {
    throw new Error('period must be greater than 0');
  }
  if (data.length < period) {
    throw new Error('insufficient data length for moving average');
  }

  const window = data.slice(-period);
  const total = window.reduce((sum, value) => sum + value, 0);
  return total / period;
}

export function calculateBollingerBands(data: number[]): {
  upper: number;
  middle: number;
  lower: number;
} {
  const period = 20;
  if (data.length < period) {
    throw new Error('insufficient data length for bollinger bands');
  }

  const window = data.slice(-period);
  const middle = calculateMA(window, period);

  const variance = window.reduce((sum, value) => sum + (value - middle) ** 2, 0) / period;
  const standardDeviation = Math.sqrt(variance);

  return {
    upper: middle + 2 * standardDeviation,
    middle,
    lower: middle - 2 * standardDeviation,
  };
}

export function calculateStochastic(
  high: number[],
  low: number[],
  close: number[],
): { k: number; d: number } {
  const period = 14;
  const dPeriod = 3;
  if (high.length !== low.length || low.length !== close.length) {
    throw new Error('high, low, close arrays must have same length');
  }
  if (close.length < period + dPeriod - 1) {
    throw new Error('insufficient data length for stochastic');
  }

  const kSeries: number[] = [];
  for (let i = period - 1; i < close.length; i += 1) {
    const start = i - period + 1;
    const highWindow = high.slice(start, i + 1);
    const lowWindow = low.slice(start, i + 1);
    const highestHigh = Math.max(...highWindow);
    const lowestLow = Math.min(...lowWindow);
    const denominator = highestHigh - lowestLow;
    const kValue = denominator === 0 ? 50 : ((close[i] - lowestLow) / denominator) * 100;
    kSeries.push(kValue);
  }

  const k = kSeries[kSeries.length - 1];
  const dWindow = kSeries.slice(-dPeriod);
  const d = dWindow.reduce((sum, value) => sum + value, 0) / dWindow.length;

  return { k, d };
}

export function generateSignal(
  currentPrice: number,
  ma20: number,
  ma30: number,
  _bb: { upper: number; middle: number; lower: number },
  stochastic: { k: number; d: number },
): Signal {
  if (currentPrice > ma20 && ma20 > ma30 && stochastic.k < 20) {
    return 'BUY';
  }
  if (currentPrice < ma20 && ma20 < ma30 && stochastic.k > 80) {
    return 'SELL';
  }
  return 'HOLD';
}
