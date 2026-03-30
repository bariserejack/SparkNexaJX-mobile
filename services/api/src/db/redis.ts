import { Redis } from 'ioredis';
import { config } from '../config.js';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
});

export async function checkRedis() {
  const pong = await redis.ping();
  return pong === 'PONG';
}
