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

/**
 * Config per period.
 * Semua data di DB sudah 1m granularity (dari startup backfill + cron).
 * time_bucket aggregation mengubah 1m → interval yang sesuai untuk chart.
 */
const periodConfig: Record<
  string,
  {
    bucket: string;
    bucketLimit: number;
    hoursBack: number;
  }
> = {
  '1H': { bucket: '1 minute', bucketLimit: 240, hoursBack: 4 }, // 4 jam ke belakang (240 candle)
  '4H': { bucket: '5 minutes', bucketLimit: 288, hoursBack: 24 }, // 24 jam ke belakang (288 candle)
  '1D': { bucket: '15 minutes', bucketLimit: 672, hoursBack: 24 * 7 }, // 7 hari ke belakang (672 candle)
  '1W': { bucket: '1 hour', bucketLimit: 168, hoursBack: 24 * 7 }, // 7 hari ke belakang (168 candle)
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
  const cacheKey = `endpoint:history:${symbol}:period:${period}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return sendSuccess(res, cached);
  }

  const cfg = periodConfig[period] ?? periodConfig['1D'];

  try {
    const result = await query(
      `
        SELECT
          time_bucket($1::interval, time) AS bucket_time,
          first(open, time) as open,
          max(high) as high,
          min(low) as low,
          last(close, time) as close,
          sum(volume) as volume
        FROM price_history
        WHERE symbol = $2
          AND time >= NOW() - make_interval(hours => $4)
        GROUP BY bucket_time
        ORDER BY bucket_time DESC
        LIMIT $3;
      `,
      [cfg.bucket, symbol, cfg.bucketLimit, cfg.hoursBack],
    );

    const points = result.rows
      .map((r: any) => ({
        time: new Date(r.bucket_time).getTime(), // UTC epoch ms — angka pasti, tidak ambigu
        open: Number(r.open),
        high: Number(r.high),
        low: Number(r.low),
        close: Number(r.close),
        volume: Number(r.volume),
      }))
      .reverse();

    const payload = { symbol, period, points };
    await setCache(cacheKey, payload, 15);
    return sendSuccess(res, payload);
  } catch {
    return sendError(res, 'internal_error');
  }
});
