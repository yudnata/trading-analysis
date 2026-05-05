# ARSITEKTUR & BEST PRACTICES

## Trading Analytics App — Topik Khusus Sistem Informasi

---

## 1. Stack Teknologi

| Layer          | Teknologi                     | Alasan                             |
| -------------- | ----------------------------- | ---------------------------------- |
| Frontend       | Next.js 14 + TypeScript       | SSR, performa, App Router          |
| Backend        | Express.js + TypeScript       | Fleksibel, mudah di-extend         |
| Real-time      | Socket.io (WebSocket)         | Update grafik instan tanpa polling |
| Database Utama | PostgreSQL                    | Reliable, ACID compliant           |
| Time-Series DB | TimescaleDB (extension PG)    | Agregasi `time_bucket` otomatis    |
| Cache          | Redis                         | Sub-millisecond, TTL otomatis      |
| Queue          | BullMQ                        | Dedicated Redis connection         |

---

## 2. Arsitektur Sistem

```text
┌─────────────────────────────────────┐
│           Next.js Frontend           │
│  Dashboard | Screening | Auth        │
└──────────────┬──────────────▲───────┘
               │ HTTP         │ WebSocket (market-update)
┌──────────────▼──────────────┴───────┐
│          Express.js Backend          │
│  1. Startup Backfill (Gap Checker)   │
│  2. Socket.io Server                 │
└───────┬──────────────┬──────────────┘
        │              │
┌───────▼──────┐ ┌─────▼──────────────┐
│    Redis      │ │  PostgreSQL         │
│  Market Cache │ │  + TimescaleDB      │
│  Queue Store  │ │  time_bucket()      │
└───────────────┘ └────────────────────┘
        ▲
┌───────┴──────────────────────────────┐
│    Worker BullMQ (per job)            │
│    → Fetch Data (1m Klines)          │
│    → Simpan ke Redis & DB             │
│    → Emit WS: "market-update"        │
└──────────────────────────────────────┘
```

---

## 3. Provider Layer

### Routing Provider

| Asset type | Provider | API Endpoint (Fix)                 |
| ---------- | -------- | ---------------------------------- |
| CRYPTO     | BINANCE  | `klines?interval=1m` (OHLC Akurat) |
| STOCK      | POLYGON  | `/prev` (Free Tier Compatible)     |

### Alur Penarikan Data (Hybrid Fetching)

Aplikasi menggunakan dua mekanisme untuk memastikan kelengkapan data:

1. **Startup Backfill (Smart Gap Checker)**: Saat server Express dijalankan (`npm run dev`), sistem secara otomatis mengecek `price_history`. Jika data kurang dari 7 hari (< 10.000 candle) atau terdapat gap waktu karena server mati, sistem akan *menarik data historis secara massal* dari provider dan menyimpannya ke DB.
2. **Real-time Cron Job**: Setelah server berjalan, sebuah cron job akan berjalan setiap 1 menit untuk melakukan *fetching* candle terbaru saja via BullMQ worker, lalu memancarkannya via WebSocket.

---

## 4. Database Schema

### Table: price_history (TimescaleDB hypertable)

```sql
CREATE TABLE price_history (
  symbol TEXT NOT NULL,
  open DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  close DOUBLE PRECISION,
  volume DOUBLE PRECISION,
  time TIMESTAMP NOT NULL,
  PRIMARY KEY (symbol, time)
);
SELECT create_hypertable('price_history', 'time');
```

### Penanganan Zona Waktu (Timezone)

Meskipun kolom `time` menggunakan `TIMESTAMP WITHOUT TIME ZONE`, sistem menjamin konsistensi waktu lintas-zona dengan cara:

1. **Backend Query**: Menggunakan klausa `ORDER BY bucket_time DESC` diikuti dengan operasi `.reverse()` di JavaScript. Ini mencegah fungsi `NOW()` di PostgreSQL (yang selalu mengembalikan waktu UTC) memotong data terbaru jika server berlokasi di zona waktu yang berbeda.
2. **Data Transfer**: Backend hanya mengirimkan format Unix Epoch Milliseconds murni ke Frontend.
3. **Frontend Rendering**: Menggunakan `Intl.DateTimeFormat` bawaan browser untuk merender format tampilan waktu lokal pengguna di dalam *axis* grafik tanpa perhitungan manual.

---

## 5. Indikator Teknikal (UI Dashboard)

| Indikator       | Parameter         | Visual                      |
| --------------- | ----------------- | --------------------------- |
| MA 5            | Period: 5         | Garis Biru                  |
| MA 20           | Period: 20        | Garis Oranye                |
| MA 50           | Period: 50        | Garis Ungu                  |
| Bollinger Bands | Period: 20, SD: 2 | Area Abu-abu                |
| Stochastic      | %K: 14, %D: 3     | Panel Bawah                 |

---

## 6. Fitur Unggulan

* **Real-time Push**: Menggunakan WebSocket agar grafik terupdate otomatis saat data masuk.
* **Auto Aggregation**: Menggunakan `time_bucket` agar candle otomatis menggendut di timeframe besar (1D/1W).
* **Timezone Localization**: Grafik otomatis mendeteksi dan menampilkan waktu lokal pengguna.
* **Premium UI**: Desain modern dengan glassmorphism dan skema warna dark mode yang dalam.
