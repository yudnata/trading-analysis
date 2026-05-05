import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import Redis from "ioredis";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "..", ".env") });

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not set. Check backend environment variables.");
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export async function getCache<T = unknown>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 60,
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function delCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function pingCache(): Promise<boolean> {
  try {
    return (await redis.ping()) === "PONG";
  } catch {
    return false;
  }
}

export async function closeCache(): Promise<void> {
  await redis.quit();
}
