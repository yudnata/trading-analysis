export type ApiSuccess<T> = { success: true; data: T; error: null };
export type ApiFailure = { success: false; data: null; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not set (check repo-root .env or frontend env loading)',
    );
  }
  return base.replace(/\/+$/, '');
}

async function getJson<T>(path: string): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !body.success) {
    const message =
      'error' in body && typeof body.error === 'string' ? body.error : `http_${res.status}`;
    throw new Error(message);
  }

  return body.data;
}

export type HistoryPeriod = '1H' | '4H' | '1D' | '1W';

export type HistoryPoint = {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number; // UTC epoch ms
};

export async function getHistory(symbol: string, period: HistoryPeriod) {
  return await getJson<{
    symbol: string;
    period: HistoryPeriod;
    points: HistoryPoint[];
  }>(`/api/history/${encodeURIComponent(symbol)}?period=${encodeURIComponent(period)}`);
}

export async function getIndicators(symbol: string) {
  return await getJson<{
    symbol: string;
    currentPrice: number;
    ma20: number;
    ma30: number;
    bollinger: { upper: number; middle: number; lower: number };
    stochastic: { k: number; d: number };
    signal: 'BUY' | 'SELL' | 'HOLD';
  }>(`/api/indicators/${encodeURIComponent(symbol)}`);
}

export type AssetItem = {
  symbol: string;
  asset_type: 'CRYPTO' | 'STOCK';
  provider: 'BINANCE' | 'POLYGON';
};

export async function getAssets(): Promise<AssetItem[]> {
  return await getJson<AssetItem[]>('/api/assets');
}
