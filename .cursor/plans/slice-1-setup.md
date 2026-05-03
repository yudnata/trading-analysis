---
name: Slice 1 — Setup Project & Struktur Folder
overview: Monorepo Next.js 14 + Express TS + pg (raw SQL nanti slice 2) + struktur feature; env & build hijau.
todos:
  - id: plan-saved
    content: Plan tersimpan & PROMPT_LOG (PLAN MODE) terisi
    status: completed
  - id: next-init
    content: Init Next.js 14 dengan TypeScript
    status: completed
  - id: express-init
    content: Init Express.js dengan TypeScript
    status: completed
  - id: deps
    content: Install dependencies (pg, ioredis, bullmq, axios, express-rate-limit, zod, node-cron, dll.)
    status: completed
  - id: env
    content: .env dan .env.example (termasuk FRONTEND_URL)
    status: completed
  - id: folders
    content: Struktur folder feature-based (backend/src/features/...) + frontend routes/components
    status: completed
  - id: build-ok
    content: Kode berjalan tanpa error (build frontend + backend)
    status: completed
isProject: true
---

# Slice 1 — Setup Project & Struktur Folder

Ringkasan eksekusi (post-implementasi):

- **Frontend:** Next.js 14 App Router + TypeScript di `frontend/`; rute `/(auth)/login`, `/dashboard`, `/screening`; placeholder `components/charts`, `components/screening`.
- **Backend:** Express + TypeScript di `backend/src/`; arsitektur feature `features/auth|market|screening|indicators`; re-export `routes/market|screening|indicators`; `services/` dan `jobs/fetchMarketData.ts` stub; rate limit global; CORS memakai `FRONTEND_URL`.
- **Database:** akses via **`pg`** + script SQL di `backend/db/` (slice 2); tidak memakai ORM.
- **Dependencies:** pg, ioredis, bullmq, axios, express-rate-limit, zod, node-cron, cors, dotenv, express (selaras ARSITEKTUR.md).
- **Env:** `.env.example` memuat `FRONTEND_URL` dan variabel lain yang sudah ada.

**Langkah berikutnya:** Slice 2 — Database Schema & Koneksi → file plan target: `.cursor/plans/slice-2-database.md`.
