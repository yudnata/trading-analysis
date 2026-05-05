# CHECKPOINT — PROGRESS TRACKER

## Update setiap selesai 1 slice

## Ringkasan Status

| #   | Slice                                  | Plan Tersimpan                       | Status              | Selesai    |
| --- | -------------------------------------- | ------------------------------------ | ------------------- | ---------- |
| 1   | Setup Project & Struktur Folder        | .cursor/plans/slice-1-setup.md       | Selesai             | 2026-05-03 |
| 2   | Database Schema & Koneksi              | .cursor/plans/slice-2-database.md    | Selesai (+ 2.1)     | 2026-05-05 |
| 3   | Redis Cache & Cron Job + Provider Layer| .cursor/plans/slice-3-redis.md       | Selesai (+ 3.1)     | 2026-05-05 |
| 4   | Kalkulasi Indikator Teknikal           | .cursor/plans/slice-4-indicators.md  | Selesai             | 2026-05-05 |
| 5   | API Endpoints Backend                  | .cursor/plans/slice-5-endpoints.md   | Selesai             | 2026-05-05 |
| 6   | Frontend — Chart & Tampilan            | .cursor/plans/slice-6-frontend.md    | Selesai             | 2026-05-05 |
| 7   | Screening Feature                      | .cursor/plans/slice-7-screening.md   | Belum Mulai         | -          |
| 8   | Auth & Role Management                 | .cursor/plans/slice-8-auth.md        | Belum Mulai         | -          |

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
| [CONTEXT.md](CONTEXT.md) | Baris **Plan file (slice aktif)** = file `.cursor/plans/slice-X-....md` untuk **slice yang sama** dengan baris **Slice Aktif** (bukan plan slice lama yang sudah selesai). |
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

**Status:** Selesai (termasuk Slice 2.1 — tabel assets)
**Plan disimpan di:** `.cursor/plans/slice-2-database.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk setup database PostgreSQL aplikasi ini menggunakan driver 'pg'.
Buat script SQL untuk tabel: users, watchlists, price_history, audit_logs.
Simpan file .sql di backend/db/ (satu folder dengan layanan Express; migrasi/schema di sini).
Gunakan hypertable untuk price_history (TimescaleDB). Pastikan tabel price_history menggunakan composite PRIMARY KEY (symbol, time) karena wajib untuk partition key di hypertable.
Setup connection pool di backend/src/config/db.ts.
Buat utility function untuk query raw SQL.
```

**Checklist:**

- [x] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [x] Script SQL lengkap 4 tabel terbuat (di `backend/db/`)
- [x] Tabel terbuat di database (test query)
- [x] Connection pool 'pg' aktif
- [x] TimescaleDB hypertable aktif (DDL + create_hypertable tersedia di SQL)
- [x] Test query raw SQL berhasil
- [x] **[2.1]** Tabel `assets` dibuat (symbol, asset_type CRYPTO|STOCK, provider BINANCE|POLYGON, is_active)
- [x] **[2.1]** Seed data awal: 4 crypto (Binance) + 4 saham (Polygon)

---

## Slice 3 — Redis Cache & Cron Job + Provider Layer

**Status:** Selesai (termasuk Slice 3.1 — provider layer)
**Plan disimpan di:** `.cursor/plans/slice-3-redis.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk setup Redis cache dan cron job data market.
Yang dibutuhkan:
- Redis service (ioredis): fungsi get, set dengan TTL, delete
- Cron job dengan node-cron: hanya bertugas sebagai trigger/scheduler untuk push job ke BullMQ queue tiap 1 menit
- BullMQ queue & worker: worker bertugas memproses antrian (fetch Binance API, simpan hasil ke Redis TTL 60 detik, dan simpan ke DB)
- Jangan pernah fetch API langsung dari request user
```

**Checklist:**

- [x] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [x] Redis service berjalan dengan get/set/del
- [x] Cron job berjalan tiap 1 menit
- [x] Data tersimpan di Redis TTL 60 detik
- [x] BullMQ queue aktif dan memproses job
- [x] Test cache hit dan cache miss berhasil
- [x] Tidak ada memory leak
- [x] **[3.1]** `providers/binance.ts` — fetch ticker Binance (crypto, tanpa auth)
- [x] **[3.1]** `providers/polygon.ts` — fetch snapshot Polygon.io (saham, butuh API key)
- [x] **[3.1]** `services/marketDataService.ts` — router memilih provider berdasarkan kolom `provider`
- [x] Cron enqueue multi-symbol dari tabel `assets` (bukan hardcode BTCUSDT)
- [x] JobId dedupe per `symbol:1m` (BullMQ tidak duplikasi job pending)
- [x] Worker retry 3x dengan exponential backoff (2s, 4s, 8s)
- [x] **[Backfill]** Script `db:backfill` untuk mengisi data historis awal (Binance 500m, Polygon 1d)

---

## Slice 4 — Kalkulasi Indikator Teknikal

**Status:** Selesai
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

- [x] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [x] calculateMA() akurat
- [x] calculateBollingerBands() akurat
- [x] calculateStochastic() akurat
- [x] generateSignal() logika benar
- [x] Semua unit test lulus

---

## Slice 5 — API Endpoints Backend

**Status:** Selesai (direvisi — market Redis-first + screening filter asset_type)
**Plan disimpan di:** `.cursor/plans/slice-5-endpoints.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk semua REST endpoint Express.js berikut:
- GET /api/market/:symbol → harga terkini dari Redis cache
- GET /api/indicators/:symbol → MA20, MA30, Bollinger, Stochastic, signal
- GET /api/screening → semua aset dengan sinyal BUY/SELL/HOLD (wajib ada pagination ?page= & ?limit= di backend)
- GET /api/history/:symbol?period=1D → data historis dari DB

Setiap endpoint wajib:
- Rate limiting: 100 req/menit per IP (express-rate-limit)
- Input validation dengan Zod
- Response di-cache ke Redis TTL 60 detik
- Error handling konsisten dengan format { success, data, error }
```

**Checklist:**

- [x] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [x] Semua 4 endpoint berjalan
- [x] Rate limiting aktif (100 req/menit per IP)
- [x] Validasi input menolak input salah
- [x] Response format konsisten
- [x] Caching berfungsi (Redis TTL 60 detik per endpoint)
- [x] **Revisi:** `/api/market/:symbol` Redis-first (worker cache → endpoint cache → DB)
- [x] **Revisi:** `/api/screening?asset_type=CRYPTO|STOCK|ALL` — filter by asset type
- [x] **Revisi:** `/api/history/:symbol` tambah `periodToLimit` — LIMIT berbeda per timeframe (1H=60, 4H=240, 1D/1W=1440)
- [x] **Tambahan:** `GET /api/assets` — endpoint baru daftar symbol aktif (cache 5 menit)

---

## Slice 6 — Frontend Chart & Tampilan

**Status:** ✅ Selesai
**Plan disimpan di:** `.cursor/plans/slice-6-frontend.md`

**Prompt untuk Plan Mode (Shift+Tab):**

```text
Buatkan plan untuk komponen chart trading di Next.js menggunakan lightweight-charts (TradingView).
Komponen yang dibutuhkan:
1. TradingChart — candlestick OHLCV + overlay MA20 (biru) + MA30 (oranye) + Bollinger Bands menggunakan lightweight-charts
2. StochasticChart — chart stochastic terpisah, garis overbought 80 dan oversold 20
3. TimeframeSelector — tombol 1H | 4H | 1D | 1W
4. Halaman /dashboard yang menggabungkan semua komponen

Setiap komponen wajib ada:
- Loading skeleton saat fetch data
- Error boundary
- Responsive untuk mobile
```

**Checklist:**

- [x] Plan Mode dijalankan & plan tersimpan di .cursor/plans/
- [x] TradingChart tampil dengan data real (BTCUSDT candlestick)
- [x] Overlay MA5, MA20, dan MA50 (sesuai standar perkuliahan)
- [x] Bollinger Bands tampil (dihitung lokal dari history)
- [x] StochasticChart tampil dengan garis referensi (hitung client-side)
- [x] TimeframeSelector berfungsi ubah data (1H/4H/1D/1W)
- [x] **[Update]** Auto-Aggregation (`time_bucket`) agar candle proporsional di timeframe besar
- [x] **[Update]** Real-time Update via Socket.io (instan tanpa delay)
- [x] **[Update]** Timezone Localization (`Intl.DateTimeFormat` di browser rendering, Backend kirim epoch ms murni UTC)
- [x] **[Update]** Premium UI (Centered layout, Glassmorphism, Large Candles)
- [x] Symbol selector dropdown (Crypto/Saham US grouping)
- [x] **[Fix]** Smart Startup Backfill (Auto-fetch 7 hari history dari API jika `< 10000` rows di DB)
- [x] **[Fix]** History Sort (Backend menggunakan `ORDER BY DESC LIMIT` lalu di `reverse()` untuk bypass timezone mismatch PostgreSQL `NOW()`)
- [x] Responsive di mobile

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
- Filter berdasarkan asset_type (CRYPTO/STOCK/ALL) — sesuai endpoint /api/screening?asset_type=
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
- [ ] Filter asset_type berfungsi (CRYPTO/STOCK/ALL)
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
- NextAuth di Next.js dengan credential provider (email + password)
- Express.js memverifikasi token menggunakan jsonwebtoken (JWT) di middleware
- Role: ADMIN (akses semua) dan TRADER (dashboard + screening saja)
- Middleware Next.js untuk protect routes frontend berdasarkan role
- Middleware Express.js untuk protect API endpoint
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
- [ ] Frontend mengirim Authorization: Bearer token ke setiap request Express
