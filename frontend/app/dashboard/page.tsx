'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Time } from 'lightweight-charts';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSkeleton } from '@/components/charts/LoadingSkeleton';
import { StochasticChart } from '@/components/charts/StochasticChart';
import { TimeframeSelector } from '@/components/charts/TimeframeSelector';
import { TradingChart, type CandlePoint } from '@/components/charts/TradingChart';
import {
  getAssets,
  getHistory,
  type AssetItem,
  type HistoryPeriod,
  type HistoryPoint,
} from '@/lib/api';

const DEFAULT_SYMBOL = 'BTCUSDT';
const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Convert UTC epoch ms (dari backend) ke lightweight-charts Time.
 * Backend kirim angka pasti: UTC epoch milliseconds.
 * Kita bagi 1000 → UTC seconds.
 * Waktu lokal akan dirender oleh formatter di dalam TradingChart.tsx
 */
function toTime(epochMs: number): Time {
  return Math.floor(epochMs / 1000) as Time;
}

function simpleMA(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i += 1) {
    if (i + 1 < period) {
      out.push(null);
      continue;
    }
    const window = values.slice(i + 1 - period, i + 1);
    out.push(window.reduce((s, v) => s + v, 0) / period);
  }
  return out;
}

function bollinger(
  values: number[],
  period = 20,
  sd = 2,
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = simpleMA(values, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < values.length; i += 1) {
    const m = middle[i];
    if (m === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    const window = values.slice(i + 1 - period, i + 1);
    const variance = window.reduce((s, v) => s + (v - m) ** 2, 0) / period;
    const stdev = Math.sqrt(variance);
    upper.push(m + sd * stdev);
    lower.push(m - sd * stdev);
  }

  return { upper, middle, lower };
}

type WsStatus = 'connecting' | 'connected' | 'disconnected';

export default function DashboardPage() {
  const [period, setPeriod] = useState<HistoryPeriod>('1D');
  const [symbol, setSymbol] = useState<string>(DEFAULT_SYMBOL);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [wsStatus, setWsStatus] = useState<WsStatus>('connecting');

  const socketRef = useRef<Socket | null>(null);

  // Fetch daftar asset sekali saat mount
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => {
        // Fallback: tetap bisa pakai default symbol meski assets gagal
      });
  }, []);

  const fetchData = useCallback(
    async (isInitial = false) => {
      if (isInitial) setLoading(true);

      try {
        const h = await getHistory(symbol, period);
        setHistory(h.points);
        setError(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'unknown_error');
      } finally {
        setLoading(false);
      }
    },
    [symbol, period],
  );

  // Fetch history setiap kali symbol atau period berubah
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // WebSocket connection — separate effect agar tidak re-create setiap period change
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[ws] Connected: ${socket.id}`);
      setWsStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('[ws] Disconnected');
      setWsStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('[ws] Connection error:', err.message);
      setWsStatus('disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Listen to market-update events — re-fetch history when our symbol updates
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (data: {
      symbol: string;
      candle?: {
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      };
    }) => {
      if (data.symbol !== symbol) return;
      console.log(`[ws] Real-time update for ${symbol}`);

      // Re-fetch full history to get properly aggregated data
      fetchData(false);
    };

    socket.on('market-update', handler);
    return () => {
      socket.off('market-update', handler);
    };
  }, [symbol, fetchData]);

  const candles: CandlePoint[] = useMemo(() => {
    return history.map((p) => ({
      time: toTime(p.time),
      open: Number(p.open),
      high: Number(p.high),
      low: Number(p.low),
      close: Number(p.close),
      volume: Number(p.volume),
    }));
  }, [history]);

  const overlays = useMemo(() => {
    const times = candles.map((c) => c.time);
    const closes = candles.map((c) => c.close);
    const ma5 = simpleMA(closes, 5);
    const ma20 = simpleMA(closes, 20);
    const ma50 = simpleMA(closes, 50);
    const bb = bollinger(closes, 20, 2);

    const toSeries = (vals: (number | null)[]) =>
      vals
        .map((v, i) => (v === null ? null : { time: times[i], value: v }))
        .filter((x): x is { time: Time; value: number } => x !== null);

    return {
      ma5: toSeries(ma5),
      ma20: toSeries(ma20),
      ma50: toSeries(ma50),
      bbUpper: toSeries(bb.upper),
      bbMiddle: toSeries(bb.middle),
      bbLower: toSeries(bb.lower),
    };
  }, [candles]);

  const stochSeries = useMemo(() => {
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const closes = candles.map((c) => c.close);
    const times = candles.map((c) => c.time);

    const kPeriod = 14;
    const dPeriod = 3;
    // Butuh minimal kPeriod candle — kalau kurang, return empty (chart tampil tapi kosong)
    if (candles.length < kPeriod) {
      return { k: [], d: [] } as {
        k: { time: Time; value: number }[];
        d: { time: Time; value: number }[];
      };
    }

    const kSeries: number[] = [];
    const kPoints: { time: Time; value: number }[] = [];

    for (let i = kPeriod - 1; i < closes.length; i += 1) {
      const start = i - kPeriod + 1;
      const highestHigh = Math.max(...highs.slice(start, i + 1));
      const lowestLow = Math.min(...lows.slice(start, i + 1));
      const denom = highestHigh - lowestLow;
      const k = denom === 0 ? 50 : ((closes[i] - lowestLow) / denom) * 100;
      kSeries.push(k);
      kPoints.push({ time: times[i], value: k });
    }

    const dPoints: { time: Time; value: number }[] = [];
    for (let i = 0; i < kSeries.length; i += 1) {
      const start = Math.max(0, i - dPeriod + 1);
      const window = kSeries.slice(start, i + 1);
      const d = window.reduce((s, v) => s + v, 0) / window.length;
      dPoints.push({ time: kPoints[i].time, value: d });
    }

    return { k: kPoints, d: dPoints };
  }, [candles]);

  // Pisah asset by type untuk grouping di dropdown
  const cryptoAssets = assets.filter((a) => a.asset_type === 'CRYPTO');
  const stockAssets = assets.filter((a) => a.asset_type === 'STOCK');

  // WS status badge color
  const wsColor =
    wsStatus === 'connected'
      ? 'bg-emerald-500'
      : wsStatus === 'connecting'
        ? 'bg-amber-500 animate-pulse'
        : 'bg-red-500';

  return (
    <main className="min-h-screen bg-neutral-50 p-4 transition-colors duration-300 dark:bg-[#050505] md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-neutral-200/50 bg-white/50 p-6 backdrop-blur-xl dark:border-neutral-800/50 dark:bg-neutral-900/50 sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3">
              <h1 className="bg-gradient-to-r from-neutral-900 to-neutral-500 bg-clip-text text-3xl font-bold tracking-tight text-white">
                Binance - Polygon Market
              </h1>
              {/* WS Status indicator */}
              <div
                className="flex items-center gap-1.5"
                title={`WebSocket: ${wsStatus}`}
              >
                <div className={`h-2 w-2 rounded-full ${wsColor}`} />
                <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-500">
                  {wsStatus === 'connected'
                    ? 'Live'
                    : wsStatus === 'connecting'
                      ? 'Connecting'
                      : 'Offline'}
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs font-medium text-neutral-500 uppercase tracking-[0.2em]">
              Real-time Moving Average Analysis Dashboard
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Symbol selector */}
            <div className="group relative">
              <select
                id="symbol-select"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="appearance-none rounded-xl border border-neutral-200 bg-white px-10 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700"
              >
                {assets.length === 0 ? (
                  <option value={DEFAULT_SYMBOL}>{DEFAULT_SYMBOL}</option>
                ) : (
                  <>
                    {cryptoAssets.length > 0 && (
                      <optgroup label="Crypto Assets">
                        {cryptoAssets.map((a) => (
                          <option
                            key={a.symbol}
                            value={a.symbol}
                          >
                            {a.symbol}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {stockAssets.length > 0 && (
                      <optgroup label="US Stocks">
                        {stockAssets.map((a) => (
                          <option
                            key={a.symbol}
                            value={a.symbol}
                          >
                            {a.symbol}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <TimeframeSelector
              value={period}
              onChange={setPeriod}
            />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <ErrorBoundary>
              {loading && history.length === 0 ? (
                <LoadingSkeleton className="h-[500px]" />
              ) : error ? (
                <div className="flex h-[500px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/50 p-6 text-center dark:border-red-900/20 dark:bg-red-900/10">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {error}
                  </span>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-neutral-200/50 bg-white shadow-xl transition-all dark:border-neutral-800/50 dark:bg-neutral-900/50">
                  <TradingChart
                    candles={candles}
                    overlays={overlays}
                    symbol={symbol}
                    period={period}
                  />
                </div>
              )}
            </ErrorBoundary>
          </section>

          <section className="lg:col-span-4">
            <ErrorBoundary>
              <div className="overflow-hidden rounded-3xl border border-neutral-200/50 bg-white shadow-xl transition-all dark:border-neutral-800/50 dark:bg-neutral-900/50">
                <StochasticChart
                  k={stochSeries.k}
                  d={stochSeries.d}
                  symbol={symbol}
                  period={period}
                />
              </div>
            </ErrorBoundary>
          </section>
        </div>

        {/* Info data sufficiency — muncul kalau stochastic empty tapi chart ada data */}
        {!loading && candles.length > 0 && stochSeries.k.length === 0 && (
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
            Stochastic membutuhkan minimal 14 candle. Data terkumpul: {candles.length} candle.
            Tunggu beberapa menit hingga cron mengumpulkan cukup data.
          </p>
        )}
      </div>
    </main>
  );
}
