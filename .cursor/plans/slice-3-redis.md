---
name: Slice 3 — Redis Cache & Cron Job (+ Provider Layer)
overview: >
  Implement Redis cache singleton, cron scheduler per menit untuk enqueue BullMQ job
  ke seluruh symbol aktif dari tabel assets, serta worker yang memilih provider
  (BINANCE untuk crypto, POLYGON untuk saham) dan menyimpan hasil ke Redis + DB.
  Termasuk Slice 3.1: provider layer (binance.ts, polygon.ts, marketDataService.ts).
todos:
  - id: plan-saved
    content: Plan Mode dijalankan & plan tersimpan di .cursor/plans/
    status: completed
  - id: redis-service
    content: Redis service berjalan dengan get/set/del
    status: completed
  - id: cron-scheduler
    content: Cron job berjalan tiap 1 menit sebagai trigger enqueue job
    status: completed
  - id: redis-ttl
    content: Data market tersimpan di Redis dengan TTL 60 detik
    status: completed
  - id: bullmq-worker
    content: BullMQ queue aktif dan worker memproses job fetch market
    status: completed
  - id: cache-hit-miss
    content: Test cache hit dan cache miss berhasil
    status: completed
  - id: no-leak
    content: Tidak ada memory leak pada script verifikasi (resource cleanup)
    status: completed
  - id: provider-binance
    content: "Slice 3.1: providers/binance.ts — fetch 24hr ticker Binance dengan timeout"
    status: completed
  - id: provider-polygon
    content: "Slice 3.1: providers/polygon.ts — fetch snapshot saham Polygon.io dengan timeout"
    status: completed
  - id: market-data-service
    content: "Slice 3.1: services/marketDataService.ts — router memilih provider berdasarkan asset_type"
    status: completed
  - id: multi-symbol-cron
    content: Cron enqueue multi-symbol dari tabel assets (bukan hardcode BTCUSDT)
    status: completed
  - id: dedupe-jobid
    content: JobId per symbol:timeframe untuk dedupe BullMQ (tidak spam queue)
    status: completed
  - id: retry-backoff
    content: Worker retry 3x dengan exponential backoff
    status: completed
isProject: true
---

# Slice 3 — Redis Cache & Cron Job (+ Provider Layer)

## Tujuan

- Menyediakan service Redis reusable (`get/set/del/ping`).
- Menjadikan cron hanya scheduler yang enqueue job untuk **semua** symbol aktif dari DB.
- Menjalankan worker BullMQ yang **memilih provider** berdasarkan kolom `provider` di tabel assets.
- **[3.1]** Provider layer: `binance.ts` + `polygon.ts` + `marketDataService.ts` sebagai router.

## Arsitektur provider

```text
Cron tiap 1 menit
  → query assets WHERE is_active = TRUE
  → enqueue job { symbol, provider } untuk tiap row
      ↓
Worker BullMQ (per job)
  → marketDataService.fetchMarketData(symbol, provider)
      ↓ BINANCE  → providers/binance.ts  (crypto)
      ↓ POLYGON  → providers/polygon.ts  (saham US)
  → setCache market:<symbol> TTL 60 detik
  → INSERT price_history ON CONFLICT DO NOTHING
```

## Reliability

- Timeout: 8 detik per request provider (axios timeout).
- Retry: 3x dengan exponential backoff (2s, 4s, 8s).
- Dedupe: jobId `symbol:1m` → BullMQ tidak duplikasi job pending.
- Isolation: satu symbol gagal tidak menghentikan symbol lain (`Promise.allSettled`).

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md)
- [CONTEXT.md](../../CONTEXT.md)
- [.cursor/rules](../rules)

## Catatan eksekusi

- `cache.ts` memakai singleton Redis client.
- `queue.ts` memegang queue + worker + cleanup resources.
- `providers/binance.ts` — endpoint publik, tidak butuh API key untuk market data.
- `providers/polygon.ts` — butuh `POLYGON_API_KEY` di `.env`.
- Script `redis:verify` tetap valid untuk validasi cache hit/miss.
