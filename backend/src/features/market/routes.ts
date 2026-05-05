import { Router } from 'express';
import { z } from 'zod';
import { getCache, setCache } from '../../services/cache';
import { query } from '../../utils/db';
import { sendError, sendSuccess } from '../../utils/apiResponse';

export const marketRouter = Router();

marketRouter.get('/health', (_req, res) => {
  try {
    sendSuccess(res, { feature: 'market' });
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

marketRouter.get('/:symbol', async (req, res) => {
  const parsed = symbolSchema.safeParse({
    symbol: String(req.params.symbol ?? '').toUpperCase(),
  });
  if (!parsed.success) {
    return sendError(res, 'invalid_symbol', 400);
  }

  const { symbol } = parsed.data;
  const cacheKey = `endpoint:market:${symbol}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return sendSuccess(res, cached);
  }

  try {
    const result = await query<{
      symbol: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      time: string;
    }>(
      `
        SELECT symbol, open, high, low, close, volume, time
        FROM price_history
        WHERE symbol = $1
        ORDER BY time DESC
        LIMIT 1;
      `,
      [symbol],
    );

    const latest = result.rows[0];
    if (!latest) {
      return sendError(res, 'market_data_not_found', 404);
    }

    await setCache(cacheKey, latest, 60);
    return sendSuccess(res, latest);
  } catch {
    return sendError(res, 'internal_error');
  }
});
