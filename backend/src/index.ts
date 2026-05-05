import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { assetsRouter } from './features/assets/routes';
import { authRouter } from './features/auth/routes';
import { historyRouter } from './routes/history';
import { indicatorsRouter } from './routes/indicators';
import { marketRouter } from './routes/market';
import { screeningRouter } from './routes/screening';
import { enqueueMarketDataJob, getQueueStatus, startMarketDataWorker } from './services/queue';
import { query } from './utils/db';
import type { Provider } from './services/marketDataService';
import { ensureHistoricalData } from './jobs/startupBackfill';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { setIO } from './services/socketManager';

const app = express();
const port = Number(process.env.PORT) || 4000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Register io globally so jobs/workers can access it without circular imports
setIO(io);

io.on('connection', (socket) => {
  console.log(`[ws] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[ws] Client disconnected: ${socket.id}`);
  });
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  }),
);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'trading-backend' });
});

app.use('/api/assets', assetsRouter);
app.use('/api/auth', authRouter);
app.use('/api/market', marketRouter);
app.use('/api/indicators', indicatorsRouter);
app.use('/api/screening', screeningRouter);
app.use('/api/history', historyRouter);

startMarketDataWorker();

/**
 * Cron: tiap 1 menit, ambil semua asset aktif dari DB lalu enqueue
 * satu job per symbol (provider dipilih dari kolom `provider` di tabel assets).
 *
 * Cron TIDAK pernah fetch API langsung — hanya scheduler.
 * Worker yang menjalankan fetch + simpan ke Redis & DB.
 */
cron.schedule('* * * * *', async () => {
  try {
    const result = await query<{ symbol: string; provider: string }>(
      `SELECT symbol, provider FROM assets WHERE is_active = TRUE ORDER BY symbol;`,
    );

    const assets = result.rows;

    if (assets.length === 0) {
      console.warn('[cron] No active assets found in assets table — skipping.');
      return;
    }

    await Promise.allSettled(
      assets.map(({ symbol, provider }) =>
        enqueueMarketDataJob({ symbol, provider: provider as Provider }),
      ),
    );

    console.log(`[cron] Enqueued ${assets.length} market-data jobs`);
  } catch (error) {
    console.error('[cron] Failed to enqueue jobs:', error);
  }
});

httpServer.listen(port, async () => {
  console.log(`API + WS listening on http://localhost:${port}`);
  const queueStatus = getQueueStatus();
  console.log(
    `Queue ready: ${queueStatus.queueName} (configured=${String(queueStatus.configured)})`,
  );

  // Smart backfill: cek DB, fetch gap jika perlu, lalu cron yang lanjutkan
  try {
    await ensureHistoricalData();
  } catch (err) {
    console.error('[startup] Backfill failed:', err);
  }
});
