import axios from 'axios';

/**
 * Binance Provider — mengambil data 24hr ticker untuk pasangan kripto.
 * Endpoint publik, tidak memerlukan API key untuk market data dasar.
 *
 * Ref: https://binance-docs.github.io/apidocs/spot/en/#24hr-ticker-price-change-statistics
 */

const BINANCE_BASE = 'https://api.binance.com/api/v3';
const TIMEOUT_MS = 8_000;

export interface MarketPayload {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: Date;
}

interface BinanceTicker {
  symbol: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  lastPrice: string;
  volume: string;
  closeTime: number;
}

/**
 * Fetch market data satu symbol dari Binance (Current 1m candle).
 */
export async function fetchFromBinance(symbol: string): Promise<MarketPayload> {
  // Ambil 2 candle terakhir:
  // data[0] = candle menit sebelumnya (SUDAH CLOSE, body gemuk sempurna)
  // data[1] = candle menit ini (BARU OPEN, open=high=low=close, garis tipis)
  const url = `${BINANCE_BASE}/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=2`;

  const { data } = await axios.get<any[][]>(url, {
    timeout: TIMEOUT_MS,
  });

  // KITA AMBIL CANDLE YANG SUDAH CLOSE AGAR GRAFIK TIDAK TIPIS/FLAT!
  const closedCandle = data[0];
  if (!closedCandle) {
    throw new Error(`No candle data found for ${symbol}`);
  }

  // Format Binance Klines: [openTime, open, high, low, close, volume, closeTime, ...]
  return {
    symbol: symbol.toUpperCase(),
    open: parseFloat(closedCandle[1]),
    high: parseFloat(closedCandle[2]),
    low: parseFloat(closedCandle[3]),
    close: parseFloat(closedCandle[4]),
    volume: parseFloat(closedCandle[5]),
    time: new Date(closedCandle[0]), // Gunakan Open Time
  };
}

/**
 * Fetch data historis (K-lines) dari Binance.
 * Default limit 500 candle.
 */
export async function fetchHistoryFromBinance(
  symbol: string,
  interval = '1m',
  limit = 500,
): Promise<MarketPayload[]> {
  const url = `${BINANCE_BASE}/klines?symbol=${encodeURIComponent(
    symbol,
  )}&interval=${interval}&limit=${limit}`;

  const { data } = await axios.get<any[][]>(url, {
    timeout: TIMEOUT_MS,
  });

  return data.map((d) => ({
    symbol: symbol.toUpperCase(),
    open: Number(d[1]),
    high: Number(d[2]),
    low: Number(d[3]),
    close: Number(d[4]),
    volume: Number(d[5]),
    time: new Date(d[0]),
  }));
}
