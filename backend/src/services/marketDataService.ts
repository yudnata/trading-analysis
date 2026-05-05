import { fetchFromBinance, type MarketPayload } from '../providers/binance';
import { fetchFromPolygon } from '../providers/polygon';

export type Provider = 'BINANCE' | 'POLYGON';

/**
 * Router utama provider.
 * Pilih implementasi berdasarkan provider yang didaftarkan di tabel assets.
 *
 * - BINANCE  → fetchFromBinance (crypto)
 * - POLYGON  → fetchFromPolygon (saham/ETF US)
 */
export async function fetchMarketData(symbol: string, provider: Provider): Promise<MarketPayload> {
  switch (provider) {
    case 'BINANCE':
      return fetchFromBinance(symbol);
    case 'POLYGON':
      return fetchFromPolygon(symbol);
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${String(_exhaustive)}`);
    }
  }
}
