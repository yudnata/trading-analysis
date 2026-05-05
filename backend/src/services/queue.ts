import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { fetchMarketDataJob, type MarketFetchJobData } from '../jobs/fetchMarketData';

loadEnv({ path: resolve(process.cwd(), '.env') });
loadEnv({ path: resolve(process.cwd(), '..', '.env') });

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL is not set. Check backend environment variables.');
}

const redisUrlFixed = redisUrl!.replace('localhost', '127.0.0.1');

const QUEUE_NAME = 'market-data-v3';
const JOB_NAME = 'fetch-market-data';

export const marketDataQueue = new Queue<MarketFetchJobData>(QUEUE_NAME, {
  connection: new Redis(redisUrlFixed, { maxRetriesPerRequest: null }),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2_000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

let marketDataWorker: Worker<MarketFetchJobData> | null = null;

export function startMarketDataWorker(): Worker<MarketFetchJobData> {
  if (marketDataWorker) {
    return marketDataWorker;
  }

  console.log(`[queue] Initializing worker for queue: ${QUEUE_NAME}...`);

  marketDataWorker = new Worker<MarketFetchJobData>(
    QUEUE_NAME,
    async (job) => {
      console.log(`[queue] Processing job ${job.id} for ${job.data.symbol}...`);
      await fetchMarketDataJob(job.data);
    },
    { 
      connection: new Redis(redisUrlFixed, { maxRetriesPerRequest: null }),
      concurrency: 2 
    },
  );

  marketDataWorker.on('ready', () => {
    console.log(`[queue] Worker is ready and listening for jobs on ${QUEUE_NAME}`);
  });

  marketDataWorker.on('failed', (job, error) => {
    console.error(`[queue] Job failed (${job?.id}):`, error);
  });

  marketDataWorker.on('completed', (job) => {
    console.log(`[queue] Job completed: ${job.id}`);
  });

  return marketDataWorker;
}

/**
 * Enqueue job untuk satu symbol + provider.
 */
export async function enqueueMarketDataJob(data: MarketFetchJobData): Promise<void> {
  console.log(`[queue] Adding job to ${QUEUE_NAME} for ${data.symbol}...`);
  await marketDataQueue.add(JOB_NAME, data);
}

export function getQueueStatus(): { configured: boolean; queueName: string } {
  return { configured: Boolean(redisUrl), queueName: QUEUE_NAME };
}

export async function closeQueueResources(): Promise<void> {
  if (marketDataWorker) {
    await marketDataWorker.close();
    marketDataWorker = null;
  }

  await marketDataQueue.close();
}
