CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'TRADER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS watchlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS price_history (
  symbol TEXT NOT NULL,
  open DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  close DOUBLE PRECISION,
  volume DOUBLE PRECISION,
  time TIMESTAMP NOT NULL,
  PRIMARY KEY (symbol, time)
);
SELECT create_hypertable('price_history', 'time', if_not_exists => TRUE);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE
  SET NULL,
    action TEXT NOT NULL,
    detail TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- =========================================================
-- Slice 2.1 — Master Assets Table (provider routing)
-- =========================================================
-- Menyimpan daftar simbol yang dimonitor, beserta asset_type
-- (CRYPTO atau STOCK) dan provider default (BINANCE atau POLYGON).
-- Worker Slice 3 membaca tabel ini, bukan hardcode symbol.
-- =========================================================
CREATE TABLE IF NOT EXISTS assets (
  symbol TEXT PRIMARY KEY,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('CRYPTO', 'STOCK')),
  provider TEXT NOT NULL CHECK (provider IN ('BINANCE', 'POLYGON')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Seed data awal: beberapa crypto via Binance + saham via Polygon
INSERT INTO assets (symbol, asset_type, provider)
VALUES ('BTCUSDT', 'CRYPTO', 'BINANCE'),
  ('ETHUSDT', 'CRYPTO', 'BINANCE'),
  ('BNBUSDT', 'CRYPTO', 'BINANCE'),
  ('SOLUSDT', 'CRYPTO', 'BINANCE'),
  ('AAPL', 'STOCK', 'POLYGON'),
  ('MSFT', 'STOCK', 'POLYGON'),
  ('GOOGL', 'STOCK', 'POLYGON'),
  ('TSLA', 'STOCK', 'POLYGON') ON CONFLICT (symbol) DO NOTHING;