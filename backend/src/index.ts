import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { authRouter } from './features/auth/routes';
import { historyRouter } from './routes/history';
import { indicatorsRouter } from './routes/indicators';
import { marketRouter } from './routes/market';
import { screeningRouter } from './routes/screening';
import { enqueueMarketDataJob, getQueueStatus, startMarketDataWorker } from './services/queue';

const app = express();
const port = Number(process.env.PORT) || 4000;

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

app.use('/api/auth', authRouter);
app.use('/api/market', marketRouter);
app.use('/api/indicators', indicatorsRouter);
app.use('/api/screening', screeningRouter);
app.use('/api/history', historyRouter);

startMarketDataWorker();

cron.schedule('* * * * *', async () => {
  try {
    await enqueueMarketDataJob({ symbol: 'BTCUSDT' });
    console.log('Cron triggered market-data job');
  } catch (error) {
    console.error('Cron enqueue error:', error);
  }
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  const queueStatus = getQueueStatus();
  console.log(
    `Queue ready: ${queueStatus.queueName} (configured=${String(queueStatus.configured)})`,
  );
});
