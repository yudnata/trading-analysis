import "dotenv/config";
import { setTimeout as delay } from "node:timers/promises";
import { query } from "../utils/db";
import { closeCache, delCache, getCache, pingCache, setCache } from "../services/cache";
import { closeDbPool } from "../config/db";
import { closeQueueResources, enqueueMarketDataJob, startMarketDataWorker } from "../services/queue";

async function run(): Promise<void> {
  const cacheKey = "verify:cache:key";

  const cacheIsAlive = await pingCache();
  if (!cacheIsAlive) {
    throw new Error("Redis ping failed.");
  }

  await delCache(cacheKey);
  const miss = await getCache(cacheKey);
  console.log("Cache miss:", miss === null ? "ok" : "failed");

  await setCache(cacheKey, { value: "ok" }, 60);
  const hit = await getCache<{ value: string }>(cacheKey);
  console.log("Cache hit:", hit?.value === "ok" ? "ok" : "failed");

  startMarketDataWorker();
  await enqueueMarketDataJob({ symbol: "BTCUSDT", provider: "BINANCE" });
  await delay(6000);

  const marketCache = await getCache<{ symbol: string }>("market:BTCUSDT");
  console.log("Queue processed to Redis:", marketCache?.symbol === "BTCUSDT" ? "ok" : "failed");

  const dbRows = await query<{ total: string }>(
    `
      SELECT COUNT(*)::text AS total
      FROM price_history
      WHERE symbol = 'BTCUSDT';
    `,
  );
  console.log("Queue processed to DB:", Number(dbRows.rows[0]?.total ?? 0) > 0 ? "ok" : "failed");

}

run()
  .catch((error: unknown) => {
    console.error("Redis/Queue verification failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeQueueResources();
    await closeCache();
    await closeDbPool();
  });
