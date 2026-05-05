import { Router } from 'express';
import { z } from 'zod';
import { getCache, setCache } from '../../services/cache';
import { query } from '../../utils/db';
import { sendError, sendSuccess } from '../../utils/apiResponse';

export const historyRouter = Router();

const paramsSchema = z.object({
  symbol: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9]+$/),
});

const querySchema = z.object({
  period: z.enum(['1H', '4H', '1D', '1W']).default('1D'),
});

const periodToHours: Record<z.infer<typeof querySchema>['period'], number> = {
  '1H': 1,
  '4H': 4,
  '1D': 24,
  '1W': 24 * 7,
};

historyRouter.get('/:symbol', async (req, res) => {
  const paramsParsed = paramsSchema.safeParse({
    symbol: String(req.params.symbol ?? '').toUpperCase(),
  });
  const queryParsed = querySchema.safeParse(req.query);

  if (!paramsParsed.success || !queryParsed.success) {
    return sendError(res, 'invalid_request', 400);
  }

  const { symbol } = paramsParsed.data;
  const { period } = queryParsed.data;
  const hours = periodToHours[period];
  const cacheKey = `endpoint:history:${symbol}:period:${period}`;
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
          AND time >= NOW() - ($2::text || ' hours')::interval
        ORDER BY time ASC;
      `,
      [symbol, hours],
    );

    const payload = {
      symbol,
      period,
      points: result.rows,
    };

    await setCache(cacheKey, payload, 60);
    return sendSuccess(res, payload);
  } catch {
    return sendError(res, 'internal_error');
  }
});
