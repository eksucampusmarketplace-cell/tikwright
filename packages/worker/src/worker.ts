// Educational demonstration only — do not use on live platforms without explicit permission.

import { Worker } from 'bullmq';
import {
  QueueJobPayload,
  ensureJobMatchesTarget,
  ensureSafeAutomationTarget,
  loadEnv
} from '@tikwright/shared';
import { createQueueConfig, createRedisConnection, QUEUE_NAMES } from './queues';

const run = () => {
  const env = loadEnv();
  ensureSafeAutomationTarget(env);
  const config = createQueueConfig();
  const connection = createRedisConnection(config.redisUrl);

  const worker = new Worker<QueueJobPayload>(
    QUEUE_NAMES.sessionTasks,
    async (job) => {
      ensureJobMatchesTarget(job.data, env);
      const { task, targetUrl, environment } = job.data;
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { task, targetUrl, environment, processedAt: new Date().toISOString() };
    },
    {
      connection,
      concurrency: config.concurrency,
      limiter: config.limiter
    }
  );

  worker.on('completed', (job) => {
    console.log(`[worker] completed job ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[worker] job ${job?.id} failed`, error);
  });
};

run();
