import { Router } from 'express';
import { getCache, setCache } from '../../services/cache';
import { query } from '../../utils/db';
import { sendError, sendSuccess } from '../../utils/apiResponse';

export const assetsRouter = Router();

export interface AssetItem {
  symbol: string;
  asset_type: 'CRYPTO' | 'STOCK';
  provider: 'BINANCE' | 'POLYGON';
}

/**
 * GET /api/assets
 * Kembalikan daftar semua asset aktif dari tabel assets.
 * Dipakai frontend untuk symbol selector di dashboard.
 */
assetsRouter.get('/', async (_req, res) => {
  const cacheKey = 'endpoint:assets:active';
  const cached = await getCache<AssetItem[]>(cacheKey);
  if (cached) {
    return sendSuccess(res, cached);
  }

  try {
    const result = await query<AssetItem>(
      `
        SELECT symbol, asset_type, provider
        FROM assets
        WHERE is_active = TRUE
        ORDER BY asset_type ASC, symbol ASC;
      `,
    );

    const items = result.rows;
    // Cache agak lama (5 menit) — daftar asset jarang berubah
    await setCache(cacheKey, items, 300);
    return sendSuccess(res, items);
  } catch {
    return sendError(res, 'internal_error');
  }
});
