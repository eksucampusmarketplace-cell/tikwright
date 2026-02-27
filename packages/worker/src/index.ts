// Educational demonstration only — do not use on live platforms without explicit permission.

import { QueueJobPayload } from '@tikwright/shared';
import { createQueue, QUEUE_NAMES } from './queues';

const run = async () => {
  const queue = createQueue(QUEUE_NAMES.sessionTasks);
  const payload: QueueJobPayload = {
    sessionId: 'demo-session',
    task: 'stealth-check',
    targetUrl: 'https://example.com'
  };

  await queue.add('session-task', payload);
  console.log('[queue] queued demo job');
  await queue.close();
};

run();
