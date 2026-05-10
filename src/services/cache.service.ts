import IORedis from "ioredis";
import { config } from "../config/env.js";
import { CACHE_TTL } from "../config/constants.js";

const redis = new IORedis.default(config.REDIS_URL);

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  },

  async set(key: string, value: unknown, ttl: number = CACHE_TTL): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  async invalidate(key: string): Promise<void> {
    await redis.del(key);
  },

  async disconnect(): Promise<void> {
    await redis.quit();
  },
};
