import { query } from '../utils/db';
import { setCache, delCache } from '../services/cache';
import { fetchMarketData, type Provider } from '../services/marketDataService';
import { getIO } from '../services/socketManager';

export interface MarketFetchJobData {
  symbol: string;
  provider: Provider;
}

export async function fetchMarketDataJob(data: MarketFetchJobData): Promise<void> {
  const { symbol, provider } = data;

  const payload = await fetchMarketData(symbol, provider);

  // Simpan ke Redis TTL 60 detik
  await setCache(`market:${symbol}`, payload, 60);

  // Insert ke TimescaleDB
  await query(
    `
      INSERT INTO price_history (symbol, open, high, low, close, volume, time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (symbol, time) DO NOTHING;
    `,
    [
      payload.symbol,
      payload.open,
      payload.high,
      payload.low,
      payload.close,
      payload.volume,
      payload.time,
    ],
  );

  // Invalidate history cache untuk semua period agar frontend mendapat data fresh
  const periods = ['1H', '4H', '1D', '1W'];
  await Promise.allSettled(periods.map((p) => delCache(`endpoint:history:${symbol}:period:${p}`)));

  // Kirim sinyal real-time via Socket.io — include candle data agar frontend
  // bisa langsung update() tanpa harus re-fetch seluruh history
  try {
    const io = getIO();
    io.emit('market-update', {
      symbol: payload.symbol,
      candle: {
        time: payload.time,
        open: payload.open,
        high: payload.high,
        low: payload.low,
        close: payload.close,
        volume: payload.volume,
      },
    });
  } catch (err) {
    // Socket belum ready saat startup — tidak fatal
    console.warn('[worker] Socket.io not ready, skipping WS emit');
  }

  console.log(`[worker] ${provider}:${symbol} → saved to Redis + DB + WS`);
}
