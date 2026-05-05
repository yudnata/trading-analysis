# Project Context - Trading Analysis App

## Informasi Utama

- **Project Name      :** Trading Analysis (Multi-Provider)
- **Tech Stack        :** Next.js (Frontend), Node.js/Express (Backend)
- **Database          :** TimescaleDB (Postgres), Redis (Caching & Queue)
- **Providers         :** Binance (Crypto), Polygon.io (Stocks)

## State Terkini

- **Slice Aktif        :** 6 — Frontend Chart & Tampilan
- **Status             :** ✅ Stabil (Hybrid Data Architecture Selesai)
- **Plan file          :** [.cursor/plans/slice-6-frontend.md](.cursor/plans/slice-6-frontend.md)
- **File Terakhir Diubah:**
  - `backend/src/jobs/startupBackfill.ts` — [NEW] Smart startup backfill (auto-fetch 7 days gap)
  - `backend/src/features/history/routes.ts` — [Fix] Pure DB read-only + ORDER BY DESC (Timezone safe)
  - `frontend/app/dashboard/page.tsx` — [Fix] Send UTC epoch ms to lightweight-charts
  - `frontend/components/charts/TradingChart.tsx` — [Fix] `Intl.DateTimeFormat` untuk render timezone lokal
- **Masalah Saat Ini   :** -
- **Langkah Selanjutnya:** Lanjut Slice 7 (Screening Feature & Indicator Algorithms).
- **Terakhir Diupdate  :** 2026-05-05

---

## Catatan Arsitektur Provider

```text
Asset type → Provider    → File
CRYPTO     → BINANCE     → backend/src/providers/binance.ts
STOCK      → POLYGON     → backend/src/providers/polygon.ts
```

Router: `services/marketDataService.ts` — dipanggil dari worker job.
Master symbol: tabel `assets` — tambah symbol baru via INSERT, tidak perlu ubah kode.
History: menggunakan `DESC` limit per timeframe untuk menjamin data terbaru selalu tampil.
