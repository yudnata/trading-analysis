---
name: Slice 6 — Frontend Chart & Tampilan
overview: UI dashboard chart premium di Next.js memakai lightweight-charts, integrasi Socket.io real-time, agregasi data time_bucket, dan lokalisasi timezone.
todos:
  - id: plan-saved
    content: Plan Mode dijalankan & plan tersimpan di .cursor/plans/
    status: completed
  - id: tradingchart-real-data
    content: TradingChart tampil dengan data real & candlestick solid
    status: completed
  - id: overlays-ma
    content: Overlay MA5, MA20, dan MA50 akurat posisinya
    status: completed
  - id: bollinger-visible
    content: Bollinger Bands tampil (dihitung client-side)
    status: completed
  - id: stochastic-chart
    content: StochasticChart tampil dengan garis referensi (hitung client-side)
    status: completed
  - id: timeframe-selector
    content: TimeframeSelector berfungsi ubah data (1H/4H/1D/1W)
    status: completed
  - id: loading-skeleton
    content: Loading skeleton muncul saat fetch (mendukung className)
    status: completed
  - id: realtime-ws
    content: Real-time update via Socket.io (instan tanpa polling)
    status: completed
  - id: timezone-fix
    content: Lokalisasi jam grafik sesuai timezone komputer pengguna
    status: completed
  - id: aggregation-fix
    content: Agregasi data (time_bucket) otomatis di timeframe besar
    status: completed
  - id: responsive
    content: Responsive di mobile
    status: completed
isProject: true
---

# Slice 6 — Frontend Chart & Tampilan (COMPLETED)

## Tujuan

- Menampilkan chart trading premium pada `/dashboard` dengan real-time push.
- Visualisasi indikator teknikal (MA, Bollinger, Stochastic) secara akurat.
- Optimasi tampilan data historis melalui agregasi backend.

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md)
- [CONTEXT.md](../../CONTEXT.md)
- [ARSITEKTUR.md](../../ARSITEKTUR.md)

## Catatan eksekusi

- **Real-time**: Menggunakan Socket.io untuk mendengarkan event `market-update`.
- **Agregasi**: Backend menggunakan `time_bucket` (1m, 5m, 15m, 1h) berdasarkan period, diurutkan secara `DESC` dan di-`reverse()` untuk menjamin data yang ditarik selalu mutakhir (bypass PostgreSQL `NOW()` timezone issues).
- **Warna UI**: Menggunakan skema Dark Mode modern (Neutral-950, Emerald-500, Rose-500).
- **Timezone**: Menggunakan `Intl.DateTimeFormat` di `timeFormatter` lightweight-charts dengan backend mengirimkan raw UTC epoch milliseconds.
- **Smart Backfill**: `startupBackfill.ts` terintegrasi langsung di `index.ts` untuk mengisi database dengan 7 hari data saat pertama kali dijalankan.
