// Educational demonstration only — do not use on live platforms without explicit permission.

import { QueueScheduler } from 'bullmq';
import { createQueueConfig, createRedisConnection, QUEUE_NAMES } from './queues';

export const startScheduler = () => {
  const config = createQueueConfig();
  const connection = createRedisConnection(config.redisUrl);
  return new QueueScheduler(QUEUE_NAMES.sessionTasks, { connection });
};

startScheduler();
