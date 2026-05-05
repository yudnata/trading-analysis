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

  // 1. Redis-first: cek cache market:<symbol> yang diisi worker (TTL 60 detik).
  //    Ini data terbaru yang dimasukkan worker cron — lebih fresh dari endpoint cache.
  const workerCache = await getCache(`market:${symbol}`);
  if (workerCache) {
    return sendSuccess(res, workerCache);
  }

  // 2. Fallback ke endpoint cache (agar tidak spam DB saat Redis miss tapi data ada di DB)
  const endpointCacheKey = `endpoint:market:${symbol}`;
  const endpointCached = await getCache(endpointCacheKey);
  if (endpointCached) {
    return sendSuccess(res, endpointCached);
  }

  // 3. Last resort: query DB
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

    // Simpan ke endpoint cache agar request berikutnya tidak hit DB
    await setCache(endpointCacheKey, latest, 60);
    return sendSuccess(res, latest);
  } catch {
    return sendError(res, 'internal_error');
  }
});
