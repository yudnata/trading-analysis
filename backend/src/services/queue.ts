import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { fetchMarketDataJob, type MarketFetchJobData } from "../jobs/fetchMarketData";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "..", ".env") });

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is not set. Check backend environment variables.");
}

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

const QUEUE_NAME = "market-data";
const JOB_NAME = "fetch-market-data";

export const marketDataQueue = new Queue<MarketFetchJobData>(QUEUE_NAME, {
  connection,
});

let marketDataWorker: Worker<MarketFetchJobData> | null = null;

export function startMarketDataWorker(): Worker<MarketFetchJobData> {
  if (marketDataWorker) {
    return marketDataWorker;
  }

  marketDataWorker = new Worker<MarketFetchJobData>(
    QUEUE_NAME,
    async (job) => {
      await fetchMarketDataJob(job.data);
    },
    { connection },
  );

  marketDataWorker.on("failed", (job, error) => {
    console.error(`Job failed (${job?.name ?? "unknown"}):`, error);
  });

  return marketDataWorker;
}

export async function enqueueMarketDataJob(data: MarketFetchJobData = {}): Promise<void> {
  await marketDataQueue.add(JOB_NAME, data, {
    removeOnComplete: 100,
    removeOnFail: 100,
  });
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
  await connection.quit();
}
