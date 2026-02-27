// Educational demonstration only — do not use on live platforms without explicit permission.

import { Queue, QueueOptions } from 'bullmq';
import IORedis from 'ioredis';
import { loadEnv, QueueConfig } from '@tikwright/shared';

export const createQueueConfig = (): QueueConfig => {
  const env = loadEnv();
  return {
    redisUrl: env.redisUrl,
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2),
    limiter: {
      max: Number(process.env.WORKER_LIMIT_MAX ?? 5),
      duration: Number(process.env.WORKER_LIMIT_DURATION ?? 60000)
    }
  };
};

export const createRedisConnection = (redisUrl: string) => {
  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null
  });
};

export const createQueue = (name: string) => {
  const config = createQueueConfig();
  const connection = createRedisConnection(config.redisUrl);
  const options: QueueOptions = {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    }
  };

  return new Queue(name, options);
};

export const QUEUE_NAMES = {
  sessionTasks: 'session-tasks'
};
