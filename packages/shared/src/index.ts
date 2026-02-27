// Educational demonstration only — do not use on live platforms without explicit permission.

export type ProxyConfig = {
  id: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  provider?: string;
};

export type SessionRecord = {
  id: string;
  createdAt: Date;
  lastUsedAt?: Date;
  proxyId?: string;
};

export type QueueJobPayload = {
  sessionId: string;
  task: 'stealth-check' | 'page-audit';
  targetUrl: string;
};

export type QueueConfig = {
  redisUrl: string;
  concurrency: number;
  limiter: {
    max: number;
    duration: number;
  };
};

export const loadEnv = () => {
  return {
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379'
  };
};
