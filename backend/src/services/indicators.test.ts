import { describe, expect, it } from "vitest";
import {
  calculateBollingerBands,
  calculateMA,
  calculateStochastic,
  generateSignal,
} from "./indicators";

describe("calculateMA", () => {
  it("calculates moving average from latest window", () => {
    const result = calculateMA([1, 2, 3, 4, 5], 3);
    expect(result).toBe(4);
  });
});

describe("calculateBollingerBands", () => {
  it("returns upper/middle/lower values", () => {
    const input = Array.from({ length: 20 }, (_v, i) => i + 1);
    const result = calculateBollingerBands(input);

    expect(result.middle).toBe(10.5);
    expect(result.upper).toBeGreaterThan(result.middle);
    expect(result.lower).toBeLessThan(result.middle);
  });
});

describe("calculateStochastic", () => {
  it("returns stochastic %K and %D in expected range", () => {
    const high = [50, 52, 53, 55, 56, 58, 59, 60, 61, 63, 64, 65, 66, 68, 69, 70];
    const low = [45, 46, 47, 48, 49, 50, 50, 51, 52, 53, 54, 55, 55, 56, 57, 58];
    const close = [48, 49, 51, 52, 54, 55, 56, 58, 59, 60, 62, 63, 64, 66, 67, 69];

    const result = calculateStochastic(high, low, close);
    expect(result.k).toBeGreaterThanOrEqual(0);
    expect(result.k).toBeLessThanOrEqual(100);
    expect(result.d).toBeGreaterThanOrEqual(0);
    expect(result.d).toBeLessThanOrEqual(100);
  });
});

describe("generateSignal", () => {
  it("returns BUY when buy rules are met", () => {
    const signal = generateSignal(
      120,
      110,
      100,
      { upper: 130, middle: 110, lower: 90 },
      { k: 10, d: 15 },
    );
    expect(signal).toBe("BUY");
  });

  it("returns SELL when sell rules are met", () => {
    const signal = generateSignal(
      90,
      100,
      110,
      { upper: 120, middle: 100, lower: 80 },
      { k: 90, d: 85 },
    );
    expect(signal).toBe("SELL");
  });

  it("returns HOLD for mixed conditions", () => {
    const signal = generateSignal(
      105,
      100,
      95,
      { upper: 115, middle: 100, lower: 85 },
      { k: 45, d: 50 },
    );
    expect(signal).toBe("HOLD");
  });
});
