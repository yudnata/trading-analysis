import { Router } from 'express';
import { z } from 'zod';
import {
  calculateBollingerBands,
  calculateMA,
  calculateStochastic,
  generateSignal,
} from '../../services/indicators';
import { getCache, setCache } from '../../services/cache';
import { query } from '../../utils/db';
import { sendError, sendSuccess } from '../../utils/apiResponse';

export const indicatorsRouter = Router();

indicatorsRouter.get('/health', (_req, res) => {
  try {
    sendSuccess(res, { feature: 'indicators' });
  } catch {
    sendError(res, 'internal_error');
  }
});

const symbolSchema = z.object({
  symbol: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9]+$/),
});

indicatorsRouter.get('/:symbol', async (req, res) => {
  const parsed = symbolSchema.safeParse({
    symbol: String(req.params.symbol ?? '').toUpperCase(),
  });
  if (!parsed.success) {
    return sendError(res, 'invalid_symbol', 400);
  }

  const { symbol } = parsed.data;
  const cacheKey = `endpoint:indicators:${symbol}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return sendSuccess(res, cached);
  }

  try {
    const result = await query<{
      high: number;
      low: number;
      close: number;
      time: string;
    }>(
      `
        SELECT high, low, close, time
        FROM price_history
        WHERE symbol = $1
        ORDER BY time DESC
        LIMIT 60;
      `,
      [symbol],
    );

    const rows = result.rows.reverse();
    if (rows.length < 30) {
      return sendError(res, 'insufficient_data_for_indicators', 422);
    }

    const closes = rows.map((row) => Number(row.close));
    const highs = rows.map((row) => Number(row.high));
    const lows = rows.map((row) => Number(row.low));
    const currentPrice = closes[closes.length - 1];

    const ma20 = calculateMA(closes, 20);
    const ma30 = calculateMA(closes, 30);
    const bollinger = calculateBollingerBands(closes);
    const stochastic = calculateStochastic(highs, lows, closes);
    const signal = generateSignal(currentPrice, ma20, ma30, bollinger, stochastic);

    const payload = {
      symbol,
      currentPrice,
      ma20,
      ma30,
      bollinger,
      stochastic,
      signal,
    };

    await setCache(cacheKey, payload, 60);
    return sendSuccess(res, payload);
  } catch {
    return sendError(res, 'internal_error');
  }
});
