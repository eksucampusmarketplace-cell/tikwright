// Educational demonstration only — do not use on live platforms without explicit permission.

import { QueueJobPayload, ensureSafeAutomationTarget, loadEnv } from '@tikwright/shared';
import { createQueue, QUEUE_NAMES } from './queues';

const run = async () => {
  const env = loadEnv();
  const baseUrl = ensureSafeAutomationTarget(env);
  const queue = createQueue(QUEUE_NAMES.sessionTasks);
  const payload: QueueJobPayload = {
    sessionId: 'demo-session',
    task: 'stealth-check',
    targetUrl: new URL('/health', baseUrl).toString(),
    environment: env.targetEnv
  };

  await queue.add('session-task', payload);
  console.log('[queue] queued demo job');
  await queue.close();
};

run();
