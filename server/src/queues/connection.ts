import IORedis from "ioredis";
import { config } from "../config/env.js";

export const connection = new IORedis.default(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

function buildConnectionOptions() {
  const parsed = new URL(config.REDIS_URL);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379", 10),
    ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
    ...(parsed.username ? { username: decodeURIComponent(parsed.username) } : {}),
    ...(parsed.pathname.length > 1 ? { db: parseInt(parsed.pathname.slice(1), 10) } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export const connectionOptions = buildConnectionOptions();
