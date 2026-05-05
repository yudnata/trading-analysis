'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  type IChartApi,
  type ISeriesApi,
  type Time,
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts';

export type CandlePoint = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function TradingChart(props: {
  candles: CandlePoint[];
  symbol: string;
  period: string;
  overlays: {
    ma5: { time: Time; value: number }[];
    ma20: { time: Time; value: number }[];
    ma50: { time: Time; value: number }[];
    bbUpper: { time: Time; value: number }[];
    bbMiddle: { time: Time; value: number }[];
    bbLower: { time: Time; value: number }[];
  };
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ma5Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma50Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const bbURef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLRef = useRef<ISeriesApi<'Line'> | null>(null);

  const candleData = useMemo(
    () =>
      props.candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    [props.candles],
  );

  const volumeData = useMemo(
    () =>
      props.candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)',
      })),
    [props.candles],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const chart = createChart(container, {
      height: 500,
      layout: { background: { color: 'transparent' }, textColor: '#737373' },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        mode: 0, // Normal crosshair
        vertLine: {
          width: 1,
          color: 'rgba(255,255,255,0.15)',
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          width: 1,
          color: 'rgba(255,255,255,0.15)',
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
      },
      localization: {
        timeFormatter: (time: number) => {
          // Format crosshair time
          const date = new Date(time * 1000);
          return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(date);
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          // Format axis time
          const date = new Date(time * 1000);
          return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(date);
        },
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      borderUpColor: '#10b981',
      borderDownColor: '#f43f5e',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    volumeSeriesRef.current = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    ma5Ref.current = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 1,
      crosshairMarkerVisible: false,
    });
    ma20Ref.current = chart.addSeries(LineSeries, {
      color: '#f97316',
      lineWidth: 1,
      crosshairMarkerVisible: false,
    });
    ma50Ref.current = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 1,
      crosshairMarkerVisible: false,
    });
    bbURef.current = chart.addSeries(LineSeries, {
      color: 'rgba(148,163,184,0.5)',
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
    });
    bbMRef.current = chart.addSeries(LineSeries, {
      color: 'rgba(148,163,184,0.3)',
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
    });
    bbLRef.current = chart.addSeries(LineSeries, {
      color: 'rgba(148,163,184,0.5)',
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
    });

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
      chart.timeScale().fitContent();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);



  useEffect(() => {
    candleSeriesRef.current?.setData(candleData);
    volumeSeriesRef.current?.setData(volumeData);

    ma5Ref.current?.setData(props.overlays.ma5);
    ma20Ref.current?.setData(props.overlays.ma20);
    ma50Ref.current?.setData(props.overlays.ma50);
    bbURef.current?.setData(props.overlays.bbUpper);
    bbMRef.current?.setData(props.overlays.bbMiddle);
    bbLRef.current?.setData(props.overlays.bbLower);
  }, [candleData, volumeData, props.overlays]);

  // Fit content hanya saat ganti symbol atau period
  useEffect(() => {
    if (candleData.length > 0) {
      chartRef.current?.timeScale().fitContent();
    }
  }, [props.symbol, props.period]);

  return (
    <div className="flex flex-col bg-white p-6 dark:bg-transparent">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-1 rounded-full bg-neutral-900 dark:bg-white" />
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest dark:text-white">
            Price Action
          </h3>
        </div>

        {/* Indicator Legend */}
        <div className="flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-[0.15em]">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-neutral-500">MA 5</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
            <span className="text-neutral-500">MA 20</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-neutral-500">MA 50</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-4 rounded-full border border-neutral-500/30 bg-neutral-500/10" />
            <span className="text-neutral-500">BB</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full"
      />
    </div>
  );
}
