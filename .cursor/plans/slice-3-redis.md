---
name: Slice 3 — Redis Cache & Cron Job
overview: Implement Redis cache singleton, cron scheduler per menit untuk enqueue BullMQ job, serta worker yang memproses fetch market ke Redis dan DB.
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
isProject: true
---

# Slice 3 — Redis Cache & Cron Job

## Tujuan

- Menyediakan service Redis reusable (`get/set/del/ping`).
- Menjadikan cron hanya scheduler yang enqueue job.
- Menjalankan worker BullMQ untuk proses fetch market lalu simpan ke Redis + DB.

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md)
- [CONTEXT.md](../../CONTEXT.md)
- [.cursor/rules](../rules)

## Catatan eksekusi

- `cache.ts` memakai singleton Redis client.
- `queue.ts` memegang queue + worker + cleanup resources.
- `fetchMarketDataJob` mengambil data Binance `BTCUSDT`, simpan Redis TTL 60 detik, lalu insert ke `price_history`.
- Script `redis:verify` memvalidasi cache hit/miss dan hasil job ke Redis + DB.
