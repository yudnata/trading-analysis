import axios from 'axios';
import { query } from '../utils/db';
import { fetchHistoryFromPolygon } from '../providers/polygon';
import type { MarketPayload } from '../providers/binance';

const BINANCE_BASE = 'https://api.binance.com/api/v3';

/**
 * Smart Startup Backfill
 *
 * Dipanggil SEKALI saat server start. Untuk setiap asset aktif:
 *
 * 1. Cek candle terakhir di DB (MAX(time))
 * 2. Kalau data sudah fresh (< 2 menit lalu) → SKIP
 * 3. Kalau ada gap → fetch HANYA gap dari API
 * 4. Kalau kosong → fetch 7 hari penuh
 *
 * ON CONFLICT DO NOTHING menjamin tidak ada duplikat.
 */
export async function ensureHistoricalData(): Promise<void> {
  console.log('\n📊 [startup] Checking historical data...');

  const { rows: assets } = await query<{
    symbol: string;
    asset_type: string;
    provider: string;
  }>('SELECT symbol, asset_type, provider FROM assets WHERE is_active = TRUE');

  if (assets.length === 0) {
    console.log('[startup] No active assets — skipping backfill.');
    return;
  }

  console.log(`[startup] Found ${assets.length} active assets. Checking each...\n`);

  for (const asset of assets) {
    try {
      await ensureSymbolData(asset.symbol, asset.provider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${asset.symbol}: ${msg}`);
    }
  }

  console.log('\n✅ [startup] Historical data check complete.\n');
}

async function ensureSymbolData(symbol: string, provider: string): Promise<void> {
  // Cek candle terbaru dan terlama di DB
  const { rows } = await query<{ latest: Date | null; earliest: Date | null; total: string }>(
    `SELECT MAX(time) AS latest, MIN(time) AS earliest, COUNT(*)::text AS total
     FROM price_history
     WHERE symbol = $1
       AND time >= NOW() - INTERVAL '7 days'`,
    [symbol],
  );

  const latest = rows[0]?.latest ? new Date(rows[0].latest) : null;
  const earliest = rows[0]?.earliest ? new Date(rows[0].earliest) : null;
  const total = Number(rows[0]?.total ?? 0);
  const now = Date.now();

  const SEVEN_DAYS_MINUTES = 7 * 24 * 60; // 10,080
  const GAP_THRESHOLD_MS = 2 * 60 * 1000; // 2 menit

  // Kasus 1: DB kosong
  if (!latest || total === 0) {
    console.log(`  ⟳ ${symbol}: No data — fetching 7 days...`);
    await fetchAndStore(symbol, provider, SEVEN_DAYS_MINUTES, null, Date.now());
    return;
  }

  // Kasus 2: DB punya data tapi kurang dari 7 hari (misal cron cuma jalan bentar)
  if (total < 10000 && earliest) {
    // Fetch mundur dari earliest
    const missingMinutes = SEVEN_DAYS_MINUTES - total;
    console.log(
      `  ⟳ ${symbol}: Only ${total} candles. Fetching ${missingMinutes} missing older candles...`,
    );
    await fetchAndStore(symbol, provider, missingMinutes, null, earliest.getTime() - 1);
  }

  // Kasus 3: Cek gap di depan (apakah cron sempat mati?)
  if (now - latest.getTime() >= GAP_THRESHOLD_MS) {
    const gapMinutes = Math.ceil((now - latest.getTime()) / 60_000);
    const fetchMinutes = Math.min(gapMinutes, SEVEN_DAYS_MINUTES);
    console.log(`  ⟳ ${symbol}: Gap ${gapMinutes} min at the front — fetching...`);
    await fetchAndStore(symbol, provider, fetchMinutes, latest, Date.now());
  } else if (total >= 10000) {
    console.log(`  ✓ ${symbol}: ${total} candles, fully up to date — SKIP`);
  }
}

/**
 * Fetch 1m candles dari provider dan simpan ke DB.
 *
 * @param startAfter - Fetch candle SETELAH timestamp ini
 * @param endBefore - Fetch candle SEBELUM timestamp ini (untuk fetch mundur)
 */
async function fetchAndStore(
  symbol: string,
  provider: string,
  totalMinutes: number,
  startAfter: Date | null,
  endBefore: number,
): Promise<void> {
  let candles: MarketPayload[] = [];

  if (provider === 'BINANCE') {
    candles = await fetchBinanceChunked(symbol, totalMinutes, startAfter, endBefore);
  } else if (provider === 'POLYGON') {
    const to = new Date(endBefore).toISOString().split('T')[0];
    const fromDate = new Date(endBefore);
    fromDate.setDate(fromDate.getDate() - 7);
    const from = startAfter
      ? new Date(startAfter.getTime()).toISOString().split('T')[0]
      : fromDate.toISOString().split('T')[0];

    candles = await fetchHistoryFromPolygon(symbol, 1, 'minute', from, to);
  }

  if (candles.length === 0) {
    console.log(`    ⚠ ${symbol}: No candles returned from ${provider}`);
    return;
  }

  // Bulk insert ke DB
  await bulkInsert(candles);
  console.log(`    ✓ ${symbol}: Saved ${candles.length} candles to DB`);
}

/**
 * Fetch 1m candles dari Binance in chunks (max 1000 per request).
 * Supports pagination via endTime.
 */
async function fetchBinanceChunked(
  symbol: string,
  totalMinutes: number,
  startAfter: Date | null,
  endBefore: number,
): Promise<MarketPayload[]> {
  const allCandles: MarketPayload[] = [];
  let endTime = endBefore;
  const startTime = startAfter ? startAfter.getTime() : endTime - totalMinutes * 60_000;

  while (allCandles.length < totalMinutes) {
    const limit = Math.min(1000, totalMinutes - allCandles.length);
    const url = `${BINANCE_BASE}/klines?symbol=${symbol}&interval=1m&limit=${limit}&endTime=${endTime}`;

    const { data } = await axios.get<any[][]>(url, { timeout: 10_000 });
    if (data.length === 0) break;

    // Filter candles yang sudah melewati startTime
    const batch: MarketPayload[] = [];
    for (const d of data) {
      const openTime = d[0] as number;
      if (openTime < startTime) continue; // Skip data sebelum startTime
      batch.push({
        symbol,
        open: Number(d[1]),
        high: Number(d[2]),
        low: Number(d[3]),
        close: Number(d[4]),
        volume: Number(d[5]),
        time: new Date(openTime),
      });
    }

    allCandles.push(...batch);

    // Jika candle pertama sudah melewati startTime, stop
    const earliestInBatch = data[0][0] as number;
    if (earliestInBatch <= startTime) break;

    // Mundur ke sebelum candle pertama batch ini
    endTime = earliestInBatch - 1;

    // Rate limit pause
    await new Promise((r) => setTimeout(r, 200));
  }

  // Sort ascending by time
  allCandles.sort((a, b) => a.time.getTime() - b.time.getTime());
  return allCandles;
}

/**
 * Bulk insert candles ke DB. ON CONFLICT DO NOTHING = no duplicates.
 */
async function bulkInsert(candles: MarketPayload[]): Promise<void> {
  const batchSize = 200;
  for (let i = 0; i < candles.length; i += batchSize) {
    const batch = candles.slice(i, i + batchSize);
    const values: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    for (const c of batch) {
      values.push(
        `($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6})`,
      );
      params.push(c.symbol, c.open, c.high, c.low, c.close, c.volume, c.time);
      idx += 7;
    }

    await query(
      `INSERT INTO price_history (symbol, open, high, low, close, volume, time)
       VALUES ${values.join(', ')}
       ON CONFLICT (symbol, time) DO NOTHING`,
      params,
    );
  }
}

/**
 * Helper: format "X minutes ago" / "X hours ago"
 */
function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
