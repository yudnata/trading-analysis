---
name: Slice 5 — API Endpoints Backend (revisi)
overview: >
  Empat endpoint backend utama dengan validasi Zod, rate limit global 100 rpm,
  cache Redis TTL 60 detik, dan format respons konsisten.
  Revisi: /api/market Redis-first (worker cache → endpoint cache → DB);
  /api/screening tambah filter asset_type=CRYPTO|STOCK|ALL.
todos:
  - id: plan-saved
    content: Plan Mode dijalankan & plan tersimpan di .cursor/plans/
    status: completed
  - id: endpoints-ready
    content: Semua 4 endpoint berjalan
    status: completed
  - id: rate-limit
    content: Rate limiting aktif (100 req/menit/IP)
    status: completed
  - id: zod-validation
    content: Validasi input menolak input salah
    status: completed
  - id: response-format
    content: Response format konsisten { success, data, error }
    status: completed
  - id: cache-working
    content: Caching berfungsi (Redis TTL 60 detik untuk response endpoint)
    status: completed
  - id: market-redis-first
    content: "Revisi: /api/market/:symbol Redis-first (market:<symbol> dari worker → endpoint cache → DB)"
    status: completed
  - id: screening-asset-type-filter
    content: "Revisi: /api/screening?asset_type=CRYPTO|STOCK|ALL filter by asset type"
    status: completed
isProject: true
---

# Slice 5 — API Endpoints Backend

## Tujuan

- Menyediakan endpoint market, indicators, screening, dan history berbasis data DB/Redis.
- Menetapkan kontrak API konsisten agar frontend Slice 6 tinggal konsumsi.

## Revisi dari arsitektur awal

### `/api/market/:symbol` — Redis-first

```text
1. GET market:<symbol>         ← diisi worker cron, paling fresh
2. GET endpoint:market:<symbol> ← buffer endpoint
3. Fallback query DB           ← last resort
```

### `/api/screening` — filter asset_type

Query param baru: `?asset_type=CRYPTO|STOCK|ALL` (default: ALL).
Cache key menyertakan `asset_type` agar hasil filter terpisah.

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md)
- [CONTEXT.md](../../CONTEXT.md)
- [.cursor/rules](../rules)

## Catatan eksekusi

- Endpoint ditambahkan pada router feature terkait + feature baru `history`.
- Validasi path/query memakai Zod.
- Semua endpoint memanfaatkan cache Redis TTL 60 detik.
- Revisi market + screening: tidak mengubah kontrak response (backward compatible).
