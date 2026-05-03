# ARSITEKTUR & BEST PRACTICES

## Trading Analytics App — Topik Khusus Sistem Informasi

---

## 1. Stack Teknologi

| Layer          | Teknologi                     | Alasan                             |
| -------------- | ----------------------------- | ---------------------------------- |
| Frontend       | Next.js 14 + TypeScript       | SSR, performa, App Router          |
| Backend        | Express.js + TypeScript       | Fleksibel, mudah di-extend         |
| Database Utama | PostgreSQL                    | Reliable, ACID compliant           |
| Time-Series DB | TimescaleDB (extension PG)    | Optimasi query data harga historis |
| Cache          | Redis                         | Sub-millisecond, TTL otomatis      |
| Queue          | BullMQ                        | Antrian proses agar tidak crash    |
| ORM / Driver   | pg (node-postgres)            | Raw SQL, kontrol penuh query       |
| API Eksternal  | Binance API / Polygon.io      | Data market real-time              |
| AI Dev Tool    | Cursor 3 (Plan Mode + Agents) | AI-assisted development            |

---

## 2. Arsitektur Sistem

```text
┌─────────────────────────────────────┐
│           Next.js Frontend           │
│  Dashboard | Screening | Auth        │
└──────────────┬──────────────────────┘
               │ HTTP Request
┌──────────────▼──────────────────────┐
│          Express.js Backend          │
│  (Feature-Based Architecture)        │
│  auth/ | market/ | screening/        │
└───────┬──────────────┬──────────────┘
        │              │
┌───────▼──────┐ ┌─────▼──────────────┐
│    Redis      │ │  PostgreSQL         │
│  Market Cache │ │  + TimescaleDB      │
│  TTL: 60 det  │ │  User, Watchlist    │
│  Session      │ │  PriceHistory       │
│  Rate Limit   │ │  AuditLog           │
└───────────────┘ └────────────────────┘
        ▲
┌───────┴──────────────────────────────┐
│    Cron Job (tiap 1 menit)            │
│    → Fetch Binance/Polygon API        │
│    → BullMQ Queue                     │
│    → Simpan ke Redis & DB             │
└──────────────────────────────────────┘
```

---

## 3. Cara Kerja Cursor 3 di Proyek Ini

### Plan Mode (Shift+Tab)

```text
Developer tekan Shift+Tab
       ↓
Cursor riset codebase otomatis
       ↓
Cursor tanya clarifying questions
       ↓
Cursor buat plan dalam format Markdown
       ↓
Developer review & edit plan
       ↓
Simpan ke .cursor/plans/slice-X.md
       ↓
Eksekusi plan → Cursor coding
```

### Agents Window (Cmd+Shift+P → Agents Window)

- Jalankan beberapa agent paralel untuk subtask berbeda
- Bisa handoff task ke cloud jika laptop ditutup
- Semua agent terpantau dalam satu tampilan

### /multitask

- Pecah task besar jadi subagent paralel
- Berguna saat ada beberapa file yang harus dibuat sekaligus

---

## 4. Database Schema

---

## 4. Database Schema (Raw SQL)

### Table: users

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'TRADER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: watchlists

```sql
CREATE TABLE watchlists (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  symbol TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: price_history (TimescaleDB hypertable)

```sql
CREATE TABLE price_history (
  id TEXT,
  symbol TEXT NOT NULL,
  open DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  close DOUBLE PRECISION,
  volume DOUBLE PRECISION,
  time TIMESTAMP NOT NULL
);
SELECT create_hypertable('price_history', 'time');
```

### Table: audit_logs

```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  detail TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Strategi Caching

### Pola Cache-Aside

```text
Request masuk → Cek Redis
                    ↓
        Ada?  → Return < 1ms ✅
        Tidak? → Ambil dari DB/API
               → Simpan Redis TTL 60 detik
               → Return ke user
```

### Kenapa Cron Job, Bukan Fetch Per Request?

```text
❌ SALAH:
User A → fetch Binance API (500ms, kena rate limit)
User B → fetch Binance API (500ms, kena rate limit)

✅ BENAR:
Cron tiap 1 menit → fetch 1x → simpan Redis
User A, B, C semua → baca Redis < 1ms
```

---

## 6. Scalability

| Masalah                | Solusi          | Implementasi                         |
| ---------------------- | --------------- | ------------------------------------ |
| Terlalu banyak request | Rate Limiting   | express-rate-limit: 100 req/menit/IP |
| Queue proses panjang   | BullMQ          | Antrian FIFO, tidak crash            |
| DB kelebihan koneksi   | Connection Pool | pg-pool max 10 koneksi               |
| API trading overload   | Cron + Cache    | 1 fetch/menit, semua baca Redis      |
| Frontend lambat        | SSR + ISR       | Next.js Incremental Static Regen     |

---

## 7. Indikator Teknikal

| Indikator       | Parameter         | Sinyal BUY                 | Sinyal SELL               |
| --------------- | ----------------- | -------------------------- | ------------------------- |
| MA 20           | Period: 20        | Harga > MA20               | Harga < MA20              |
| MA 30           | Period: 30        | MA20 > MA30 (golden cross) | MA20 < MA30 (death cross) |
| Bollinger Bands | Period: 20, SD: 2 | Harga sentuh lower band    | Harga sentuh upper band   |
| Stochastic      | %K: 14            | %K < 20 (oversold)         | %K > 80 (overbought)      |

**Logika Sinyal Gabungan:**

```text
BUY  → harga > MA20 AND MA20 > MA30 AND stochastic %K < 20
SELL → harga < MA20 AND MA20 < MA30 AND stochastic %K > 80
HOLD → kondisi lainnya
```

---

## 8. Fitur Per Role

| Fitur           | TRADER | ADMIN |
| --------------- | ------ | ----- |
| Dashboard Chart | ✅     | ✅    |
| Screening Table | ✅     | ✅    |
| Watchlist       | ✅     | ✅    |
| Export CSV      | ✅     | ✅    |
| Auto-refresh    | ✅     | ✅    |
| User Management | ❌     | ✅    |
| Audit Log       | ❌     | ✅    |
| Setting Sistem  | ❌     | ✅    |

---

## 9. Environment Variables (.env)

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/trading_db"

# Redis
REDIS_URL="redis://localhost:6379"

# API Trading
BINANCE_API_KEY="your_key_here"
BINANCE_SECRET_KEY="your_secret_here"
POLYGON_API_KEY="your_key_here"

# Auth
NEXTAUTH_SECRET="random_secret_string"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_API_URL="http://localhost:4000"
```
