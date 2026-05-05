import axios from "axios";
import { query } from "../utils/db";
import { setCache } from "../services/cache";

type MarketTicker = {
  symbol: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  lastPrice: string;
  volume: string;
  closeTime: number;
};

export type MarketFetchJobData = {
  symbol?: string;
};

export async function fetchMarketDataJob(data?: MarketFetchJobData): Promise<void> {
  const symbol = data?.symbol ?? "BTCUSDT";
  const { data: ticker } = await axios.get<MarketTicker>(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
  );

  const payload = {
    symbol: ticker.symbol,
    open: Number(ticker.openPrice),
    high: Number(ticker.highPrice),
    low: Number(ticker.lowPrice),
    close: Number(ticker.lastPrice),
    volume: Number(ticker.volume),
    time: new Date(ticker.closeTime),
  };

  await setCache(`market:${symbol}`, payload, 60);

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
}
