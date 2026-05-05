import { Router } from 'express';
import { z } from 'zod';
import {
  calculateBollingerBands,
  calculateMA,
  calculateStochastic,
  generateSignal,
  type Signal,
} from '../../services/indicators';
import { getCache, setCache } from '../../services/cache';
import { query } from '../../utils/db';
import { sendError, sendSuccess } from '../../utils/apiResponse';

export const screeningRouter = Router();

screeningRouter.get('/health', (_req, res) => {
  try {
    sendSuccess(res, { feature: 'screening' });
  } catch {
    sendError(res, 'internal_error');
  }
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  asset_type: z.enum(['CRYPTO', 'STOCK', 'ALL']).default('ALL'),
});

screeningRouter.get('/', async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 'invalid_pagination', 400);
  }

  const { page, limit, asset_type } = parsed.data;
  const cacheKey = `endpoint:screening:page:${page}:limit:${limit}:type:${asset_type}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return sendSuccess(res, cached);
  }

  try {
    // Ambil symbol berdasarkan asset_type dari tabel assets (join).
    // Fallback ke DISTINCT price_history jika asset belum ada di tabel assets.
    const assetTypeFilter = asset_type === 'ALL' ? '' : `AND a.asset_type = '${asset_type}'`;

    const symbolsResult = await query<{ symbol: string }>(
      `
        SELECT DISTINCT ph.symbol
        FROM price_history ph
        LEFT JOIN assets a ON a.symbol = ph.symbol
        WHERE (a.is_active IS NULL OR a.is_active = TRUE)
        ${assetTypeFilter}
        ORDER BY ph.symbol ASC
        OFFSET $1
        LIMIT $2;
      `,
      [(page - 1) * limit, limit],
    );

    const rows = await Promise.all(
      symbolsResult.rows.map(async ({ symbol }) => {
        const priceRows = await query<{ high: number; low: number; close: number; time: string }>(
          `
            SELECT high, low, close, time
            FROM price_history
            WHERE symbol = $1
            ORDER BY time DESC
            LIMIT 60;
          `,
          [symbol],
        );

        const series = priceRows.rows.reverse();
        if (series.length < 30) {
          return null;
        }

        const closes = series.map((row) => Number(row.close));
        const highs = series.map((row) => Number(row.high));
        const lows = series.map((row) => Number(row.low));
        const currentPrice = closes[closes.length - 1];

        const ma20 = calculateMA(closes, 20);
        const ma30 = calculateMA(closes, 30);
        const bollinger = calculateBollingerBands(closes);
        const stochastic = calculateStochastic(highs, lows, closes);
        const signal: Signal = generateSignal(currentPrice, ma20, ma30, bollinger, stochastic);

        return {
          symbol,
          price: currentPrice,
          ma20,
          ma30,
          bollinger,
          stochastic,
          signal,
        };
      }),
    );

    const items = rows.filter((item): item is NonNullable<typeof item> => item !== null);
    const payload = {
      page,
      limit,
      asset_type,
      count: items.length,
      items,
    };

    await setCache(cacheKey, payload, 60);
    return sendSuccess(res, payload);
  } catch {
    return sendError(res, 'internal_error');
  }
});
