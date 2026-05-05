import axios from 'axios';
import type { MarketPayload } from './binance';

/**
 * Polygon.io Provider — mengambil data previous close harga saham US.
 * Menggunakan endpoint /prev yang tersedia di free tier.
 * Membutuhkan POLYGON_API_KEY di environment variables.
 *
 * Ref: https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__prev
 */

const POLYGON_PREV_BASE = 'https://api.polygon.io/v2/aggs/ticker';
const TIMEOUT_MS = 8_000;

interface PolygonPrevResult {
  results: {
    T: string; // ticker
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    t: number; // unix milliseconds
  }[];
}

/**
 * Fetch market data satu symbol dari Polygon.io (previous close).
 * Free tier compatible. Throws jika API key tidak tersedia atau request gagal.
 */
export async function fetchFromPolygon(symbol: string): Promise<MarketPayload> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    throw new Error('POLYGON_API_KEY is not set. Cannot fetch stock data.');
  }

  const url = `${POLYGON_PREV_BASE}/${encodeURIComponent(symbol)}/prev?apiKey=${apiKey}`;

  const { data } = await axios.get<PolygonPrevResult>(url, {
    timeout: TIMEOUT_MS,
  });

  const r = data.results?.[0];
  if (!r) {
    throw new Error(`No previous close data found for ${symbol}`);
  }

  return {
    symbol: r.T,
    open: r.o,
    high: r.h,
    low: r.l,
    close: r.c,
    volume: r.v,
    time: new Date(r.t),
  };
}

/**
 * Fetch data historis (Aggregates) dari Polygon.io.
 * Mengambil data 24 jam terakhir (karena keterbatasan free tier)
 */
export async function fetchHistoryFromPolygon(
  symbol: string,
  multiplier = 1,
  timespan = 'minute',
  from?: string,
  to?: string,
): Promise<MarketPayload[]> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    throw new Error('POLYGON_API_KEY is not set.');
  }

  // Fallback ke 1 hari jika tidak diset
  const dateTo = to || new Date().toISOString().split('T')[0];
  let dateFrom = from;
  if (!dateFrom) {
    const f = new Date();
    f.setDate(f.getDate() - 1);
    dateFrom = f.toISOString().split('T')[0];
  }

  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/${multiplier}/${timespan}/${dateFrom}/${dateTo}?apiKey=${apiKey}`;

  const { data } = await axios.get<{ results: any[] }>(url, {
    timeout: TIMEOUT_MS,
  });

  if (!data.results) return [];

  return data.results.map((r) => ({
    symbol: symbol.toUpperCase(),
    open: r.o,
    high: r.h,
    low: r.l,
    close: r.c,
    volume: r.v,
    time: new Date(r.t),
  }));
}
