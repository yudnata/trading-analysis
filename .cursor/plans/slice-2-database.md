---
name: Slice 2 — Database Schema & Koneksi
overview: Setup schema PostgreSQL + TimescaleDB, koneksi pg pool, dan utility query raw SQL untuk fondasi backend.
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
- Menutup checklist verifikasi query Slice 2.

## Rujukan wajib agent

- [CHECKPOINT.md](../../CHECKPOINT.md)
- [CONTEXT.md](../../CONTEXT.md)
- [.cursor/rules](../rules)

## Catatan eksekusi

- Slice ini fokus hanya pada setup database dan utilitas query.
- Endpoint bisnis akan dikerjakan di slice berikutnya.
- File utama: `backend/db/init.sql`, `backend/src/config/db.ts`, `backend/src/utils/db.ts`, `backend/src/scripts/verifyDb.ts`.
