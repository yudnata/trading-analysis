# CHECKPOINT — PROGRESS TRACKER

## Update setiap selesai 1 slice

## Ringkasan Status

| # | Slice                           | Plan Tersimpan                     | Status         | Selesai    |
|---|---------------------------------|------------------------------------|----------------|------------|
| 1 | Setup Project & Struktur Folder | .cursor/plans/slice-1-setup.md     | Selesai        | 2026-05-03 |
| 2 | Database Schema & Koneksi       | .cursor/plans/slice-2-database.md  | ⏳ Belum Mulai | -          |
| 3 | Redis Cache & Cron Job          | .cursor/plans/slice-3-redis.md     | ⏳ Belum Mulai | -          |
| 4 | Kalkulasi Indikator Teknikal    | .cursor/plans/slice-4-indicators.md| ⏳ Belum Mulai | -          |
| 5 | API Endpoints Backend           | .cursor/plans/slice-5-endpoints.md | ⏳ Belum Mulai | -          |
| 6 | Frontend — Chart & Tampilan     | .cursor/plans/slice-6-frontend.md  | ⏳ Belum Mulai | -          |
| 7 | Screening Feature               | .cursor/plans/slice-7-screening.md | ⏳ Belum Mulai | -          |
| 8 | Auth & Role Management          | .cursor/plans/slice-8-auth.md      | ⏳ Belum Mulai | -          |

---

## Alur Kerja Tiap Slice (Wajib Diikuti)

```text
1. Buka Agents Window (Cmd+Shift+P → "Agents Window")
         ↓
2. Aktifkan Plan Mode (Shift+Tab di agent input)
         ↓
3. Masukkan prompt slice ini → Cursor riset codebase
         ↓
4. Cursor tanya clarifying questions → jawab
         ↓
5. Review plan yang Cursor buat → edit jika perlu
         ↓
6. Klik "Save to workspace" → simpan ke .cursor/plans/
         ↓
7. Catat plan di PROMPT_LOG.md
         ↓
8. Eksekusi plan → Cursor mulai coding
         ↓
9. Test semua checklist
         ↓
10. Update status di tabel atas → Update CONTEXT.md
```

---

## Integrasi CONTEXT ↔ plan ↔ agent (satu sumber kebenaran)

File berikut harus **selaras** untuk slice yang sedang dikerjakan:

| Sumber | Isi yang harus sama |
| -------- | --------------------- |
| [CONTEXT.md](CONTEXT.md) | Baris **Plan file (slice aktif)** = file `.cursor/plans/slice-X-....md` untuk **slice yang sama** dengan baris **Slice Aktif** (bukan plan slice lama). |
| [.cursor/plans/slice-X-....md](.cursor/plans/TEMPLATE_SLICE.md) | Frontmatter `todos:` disalin dari **Checklist** slice itu di file ini (CHECKPOINT). Update `status` saat jalan. |
| [PROMPT_LOG.md](PROMPT_LOG.md) | Setelah plan disimpan, isi blok **PLAN MODE** untuk slice tersebut. |

**Prompt pembuka:** pakai teks di [CONTEXT.md](CONTEXT.md) (bagian *Prompt pembuka setiap sesi baru*) + @ `CHECKPOINT.md`, @ `CONTEXT.md`, @ plan slice aktif.

**Plan baru:** salin [.cursor/plans/TEMPLATE_SLICE.md](.cursor/plans/TEMPLATE_SLICE.md) atau hasil Plan Mode; jangan biarkan CONTEXT masih menunjuk plan slice yang statusnya sudah **Selesai** di tabel di atas.

---

## Slice 1 — Setup Project & Struktur Folder

**Status:** Selesai
**Plan disimpan di:** `.cursor/plans/slice-1-setup.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Saya sedang membangun aplikasi Trading Analytics.
Stack: Next.js 14 TypeScript, Express.js TypeScript, PostgreSQL, Redis, BullMQ.
Buatkan plan untuk setup project dan struktur folder sesuai .cursor/rules.
Install semua dependency yang dibutuhkan.
Buat .env.example dengan semua variable yang dibutuhkan.
```

**Checklist:**

- [x] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [x] Init Next.js 14 dengan TypeScript
- [x] Init Express.js dengan TypeScript
- [x] Install dependencies (pg, ioredis, bullmq, axios, express-rate-limit, zod, node-cron)
- [x] .env dan .env.example terbuat
- [x] Struktur folder feature-based (src/features/...)
- [x] Kode berjalan tanpa error

---

## Slice 2 — Database Schema & Koneksi

**Status:** ⏳ Belum Mulai
**Plan disimpan di:** `.cursor/plans/slice-2-database.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk setup database PostgreSQL aplikasi ini menggunakan driver 'pg'.
Buat script SQL untuk tabel: users, watchlists, price_history, audit_logs.
Simpan file .sql di backend/db/ (satu folder dengan layanan Express; migrasi/schema di sini).
Gunakan hypertable untuk price_history (TimescaleDB).
Setup connection pool di backend/src/config/db.ts.
Buat utility function untuk query raw SQL.
```

**Checklist:**

- [ ] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [ ] Script SQL lengkap 4 tabel terbuat (di `backend/db/`)
- [ ] Tabel terbuat di database (test query)
- [ ] Connection pool 'pg' aktif
- [ ] TimescaleDB hypertable aktif
- [ ] Test query raw SQL berhasil

---

## Slice 3 — Redis Cache & Cron Job

**Status:** ⏳ Belum Mulai
**Plan disimpan di:** `.cursor/plans/slice-3-redis.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk setup Redis cache dan cron job data market.
Yang dibutuhkan:
- Redis service (ioredis): fungsi get, set dengan TTL, delete
- Cron job dengan node-cron: fetch Binance API tiap 1 menit, simpan ke Redis TTL 60 detik
- BullMQ queue untuk proses data agar tidak crash saat load tinggi
- Jangan pernah fetch API langsung dari request user
```

**Checklist:**

- [ ] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [ ] Redis service berjalan dengan get/set/del
- [ ] Cron job berjalan tiap 1 menit
- [ ] Data tersimpan di Redis TTL 60 detik
- [ ] BullMQ queue aktif dan memproses job
- [ ] Test cache hit dan cache miss berhasil
- [ ] Tidak ada memory leak

---

## Slice 4 — Kalkulasi Indikator Teknikal

**Status:** ⏳ Belum Mulai
**Plan disimpan di:** `.cursor/plans/slice-4-indicators.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk implementasi indikator teknikal trading.
Fungsi yang dibutuhkan (semua pure function, mudah di-unit test):
- calculateMA(data: number[], period: number): number
- calculateBollingerBands(data: number[]): { upper, middle, lower }
- calculateStochastic(high[], low[], close[]): { k, d }
- generateSignal(ma20, ma30, bb, stochastic): 'BUY' | 'SELL' | 'HOLD'
Logika sinyal:
BUY  → harga > MA20 AND MA20 > MA30 AND stochastic %K < 20
SELL → harga < MA20 AND MA20 < MA30 AND stochastic %K > 80
HOLD → kondisi lainnya
Sertakan unit test untuk semua fungsi.
```

**Checklist:**

- [ ] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [ ] calculateMA() akurat
- [ ] calculateBollingerBands() akurat
- [ ] calculateStochastic() akurat
- [ ] generateSignal() logika benar
- [ ] Semua unit test lulus

---

## Slice 5 — API Endpoints Backend

**Status:** ⏳ Belum Mulai
**Plan disimpan di:** `.cursor/plans/slice-5-endpoints.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk semua REST endpoint Express.js berikut:
- GET /api/market/:symbol → harga terkini dari Redis cache
- GET /api/indicators/:symbol → MA20, MA30, Bollinger, Stochastic, signal
- GET /api/screening → semua aset dengan sinyal BUY/SELL/HOLD
- GET /api/history/:symbol?period=1D → data historis dari DB

Setiap endpoint wajib:
- Rate limiting: 100 req/menit per IP (express-rate-limit)
- Input validation dengan Zod
- Response di-cache ke Redis TTL 60 detik
- Error handling konsisten dengan format { success, data, error }
```

**Checklist:**

- [ ] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [ ] Semua 4 endpoint berjalan
- [ ] Rate limiting aktif (test dengan banyak request)
- [ ] Validasi input menolak input salah
- [ ] Response format konsisten
- [ ] Caching berfungsi (cek Redis setelah hit endpoint)

---

## Slice 6 — Frontend Chart & Tampilan

**Status:** ⏳ Belum Mulai
**Plan disimpan di:** `.cursor/plans/slice-6-frontend.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk komponen chart trading di Next.js menggunakan recharts.
Komponen yang dibutuhkan:
1. TradingChart — candlestick OHLCV + overlay MA20 (biru) + MA30 (oranye) + Bollinger Bands
2. StochasticChart — chart stochastic terpisah, garis overbought 80 dan oversold 20
3. TimeframeSelector — tombol 1H | 4H | 1D | 1W
4. Halaman /dashboard yang menggabungkan semua komponen

Setiap komponen wajib ada:
- Loading skeleton saat fetch data
- Error boundary
- Responsive untuk mobile
```

**Checklist:**

- [ ] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [ ] TradingChart tampil dengan data real
- [ ] Overlay MA20 dan MA30 akurat posisinya
- [ ] Bollinger Bands tampil
- [ ] StochasticChart tampil dengan garis referensi
- [ ] TimeframeSelector berfungsi ubah data
- [ ] Loading skeleton muncul saat fetch
- [ ] Responsive di mobile

---

## Slice 7 — Screening Feature

**Status:** ⏳ Belum Mulai
**Plan disimpan di:** `.cursor/plans/slice-7-screening.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk halaman screening di app/screening/page.tsx.
Fitur yang dibutuhkan:
- Tabel dengan kolom: Symbol | Price | MA20 | MA30 | Bollinger | Stochastic | Signal
- Badge signal berwarna: BUY=hijau, SELL=merah, HOLD=abu-abu
- Filter berdasarkan signal (BUY/SELL/HOLD/ALL)
- Sort per kolom (klik header tabel)
- Export ke CSV (download langsung)
- Auto-refresh setiap 60 detik dengan countdown timer
- Pagination 20 baris per halaman
```

**Checklist:**

- [ ] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [ ] Tabel tampil dengan data real dari API
- [ ] Badge signal warna sesuai
- [ ] Filter signal berfungsi
- [ ] Sort per kolom berfungsi
- [ ] Export CSV berhasil didownload
- [ ] Auto-refresh berjalan tiap 60 detik
- [ ] Pagination berfungsi

---

## Slice 8 — Auth & Role Management

**Status:** ⏳ Belum Mulai
**Plan disimpan di:** `.cursor/plans/slice-8-auth.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk sistem autentikasi dan role management.
Yang dibutuhkan:
- NextAuth dengan credential provider (email + password)
- Role: ADMIN (akses semua) dan TRADER (dashboard + screening saja)
- Middleware Next.js untuk protect routes berdasarkan role
- Halaman login dan register
- Halaman /admin/users (admin only) — list semua user
- Halaman /admin/audit-log (admin only) — riwayat aktivitas
- Setiap aksi user dicatat ke tabel AuditLog (login, lihat screening, export CSV)
```

**Checklist:**

- [ ] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [ ] Login dan register berfungsi
- [ ] Route /dashboard hanya bisa diakses jika login
- [ ] Route /admin/* hanya bisa diakses ADMIN
- [ ] TRADER tidak bisa akses /admin/* (redirect)
- [ ] Audit log tercatat setiap aksi
- [ ] Halaman user management berfungsi
- [ ] Halaman audit log tampil data
