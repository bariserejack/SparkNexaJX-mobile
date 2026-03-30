import dotenv from 'dotenv';

dotenv.config();

function readEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiPort: Number(process.env.API_PORT ?? 4000),
  databaseUrl: readEnv('DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/sparknexa'),
  mongodbUri: readEnv('MONGODB_URI', 'mongodb://root:root@localhost:27017'),
  redisUrl: readEnv('REDIS_URL', 'redis://localhost:6379'),
};
