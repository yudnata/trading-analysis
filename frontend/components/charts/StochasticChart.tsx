'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  type IChartApi,
  type ISeriesApi,
  type Time,
  createChart,
  LineSeries,
} from 'lightweight-charts';

export function StochasticChart(props: {
  k: { time: Time; value: number }[];
  d: { time: Time; value: number }[];
  symbol: string;
  period: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const kRef = useRef<ISeriesApi<'Line'> | null>(null);
  const dRef = useRef<ISeriesApi<'Line'> | null>(null);
  const overboughtRef = useRef<ISeriesApi<'Line'> | null>(null);
  const oversoldRef = useRef<ISeriesApi<'Line'> | null>(null);

  const kData = useMemo(() => props.k, [props.k]);
  const dData = useMemo(() => props.d, [props.d]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const chart = createChart(container, {
      height: 220,
      layout: { background: { color: 'transparent' }, textColor: '#a3a3a3' },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });
    chartRef.current = chart;

    kRef.current = chart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 2 });
    dRef.current = chart.addSeries(LineSeries, { color: '#22c55e', lineWidth: 2 });

    overboughtRef.current = chart.addSeries(LineSeries, {
      color: 'rgba(244,63,94,0.7)',
      lineWidth: 1,
      lineStyle: 2,
    });
    oversoldRef.current = chart.addSeries(LineSeries, {
      color: 'rgba(59,130,246,0.7)',
      lineWidth: 1,
      lineStyle: 2,
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
  }, [kData, dData]);



  useEffect(() => {
    kRef.current?.setData(kData);
    dRef.current?.setData(dData);

    const allTimes = [...kData.map((p) => p.time), ...dData.map((p) => p.time)];
    const uniqueTimes = Array.from(new Set(allTimes));
    overboughtRef.current?.setData(uniqueTimes.map((t) => ({ time: t, value: 80 })));
    oversoldRef.current?.setData(uniqueTimes.map((t) => ({ time: t, value: 20 })));
  }, [kData, dData]);

  // Fit content hanya saat ganti symbol atau period
  useEffect(() => {
    if (kData.length > 0) {
      chartRef.current?.timeScale().fitContent();
    }
  }, [props.symbol, props.period]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Stochastic
      </div>
      <div
        ref={containerRef}
        className="w-full"
      />
    </div>
  );
}
