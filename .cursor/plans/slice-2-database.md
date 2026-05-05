---
name: Slice 2 — Database Schema & Koneksi (+ Slice 2.1 assets table)
overview: >
  Setup schema PostgreSQL + TimescaleDB, koneksi pg pool, dan utility query raw SQL.
  Slice 2.1 menambahkan tabel master `assets` untuk routing provider (BINANCE/POLYGON).
todos:
  - id: plan-slice2
    content: Simpan plan Slice 2 di .cursor/plans/slice-2-database.md dengan todos mirror checklist CHECKPOINT
    status: completed
  - id: create-sql-schema
    content: Buat script SQL users, watchlists, price_history, audit_logs di backend/db termasuk create extension TimescaleDB dan hypertable
    status: completed
  - id: setup-pg-pool
    content: Implement koneksi PostgreSQL pool di backend/src/config/db.ts
    status: completed
  - id: create-raw-query-helper
    content: Buat utility query raw SQL reusable berbasis pool.query
    status: completed
  - id: verify-db-query
    content: Tambahkan verifikasi koneksi dan test query sederhana untuk membuktikan setup berjalan
    status: completed
  - id: assets-table
    content: "Slice 2.1: Tambahkan tabel assets (symbol PK, asset_type CRYPTO|STOCK, provider BINANCE|POLYGON, is_active) + seed data awal"
    status: completed
  - id: sync-progress-docs
    content: Update CHECKPOINT.md, CONTEXT.md, dan PROMPT_LOG.md setelah Slice 2 selesai
    status: completed
isProject: true
---

# Slice 2 — Database Schema & Koneksi

## Tujuan

- Menyediakan schema SQL untuk 4 tabel inti.
- Mengaktifkan TimescaleDB hypertable untuk `price_history`.
- Menyediakan koneksi PostgreSQL (`pg` pool) dan helper raw query.
- **[2.1]** Menambahkan tabel `assets` sebagai master symbol routing untuk Slice 3.

## Tabel tambahan (Slice 2.1)

```sql
CREATE TABLE IF NOT EXISTS assets (
  symbol      TEXT PRIMARY KEY,
  asset_type  TEXT NOT NULL CHECK (asset_type IN ('CRYPTO', 'STOCK')),
  provider    TEXT NOT NULL CHECK (provider IN ('BINANCE', 'POLYGON')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Seed awal: BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT (CRYPTO/BINANCE) + AAPL, MSFT, GOOGL, TSLA (STOCK/POLYGON).

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md)
- [CONTEXT.md](../../CONTEXT.md)
- [.cursor/rules](../rules)

## Catatan eksekusi

- Slice ini fokus hanya pada setup database dan utilitas query.
- Endpoint bisnis dikerjakan di Slice 5.
- File utama: `backend/db/init.sql`, `backend/src/config/db.ts`, `backend/src/utils/db.ts`, `backend/src/scripts/verifyDb.ts`.
- Slice 2.1 hanya menambahkan DDL + seed ke `init.sql` yang sudah ada.
