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

export type AutomationEnvironment = 'local' | 'staging' | 'sandbox' | 'production';

export type QueueJobPayload = {
  sessionId: string;
  task: 'stealth-check' | 'page-audit';
  targetUrl: string;
  environment: AutomationEnvironment;
};

export type QueueConfig = {
  redisUrl: string;
  concurrency: number;
  limiter: {
    max: number;
    duration: number;
  };
};

export type AutomationSafetyConfig = {
  redisUrl: string;
  targetEnv: AutomationEnvironment;
  allowProduction: boolean;
  allowLivePlatforms: boolean;
  baseUrl: string;
  allowedHostSuffixes: string[];
};

const defaultAllowedHostSuffixes = [
  'localhost',
  '127.0.0.1',
  '.local',
  '.internal',
  '.staging',
  '.sandbox'
];

const parseBoolean = (value: string | undefined) => value === 'true';

const parseEnvironment = (value: string | undefined): AutomationEnvironment => {
  if (value === 'production' || value === 'staging' || value === 'sandbox' || value === 'local') {
    return value;
  }

  return 'local';
};

const parseAllowedHostSuffixes = (value: string | undefined) => {
  if (!value) {
    return defaultAllowedHostSuffixes;
  }

  const entries = value.split(',').map((entry) => entry.trim()).filter(Boolean);
  return entries.length > 0 ? entries : defaultAllowedHostSuffixes;
};

const normalizeUrl = (value: string) => {
  try {
    return new URL(value);
  } catch {
    return new URL(`http://${value}`);
  }
};

const isHostAllowed = (hostname: string, suffix: string) => {
  if (suffix.startsWith('.')) {
    return hostname.endsWith(suffix);
  }

  return hostname === suffix || hostname.endsWith(`.${suffix}`);
};

export const ensureSafeAutomationTarget = (config: AutomationSafetyConfig) => {
  if (config.targetEnv === 'production' && !config.allowProduction) {
    throw new Error('Automation blocked in production. Set ALLOW_PROD=true to override.');
  }

  const baseUrl = normalizeUrl(config.baseUrl);

  if (!config.allowLivePlatforms) {
    const isAllowed = config.allowedHostSuffixes.some((suffix) => isHostAllowed(baseUrl.hostname, suffix));
    if (!isAllowed) {
      throw new Error(
        `Automation target host "${baseUrl.hostname}" is not allowed. Set ALLOW_LIVE_PLATFORMS=true to override.`
      );
    }
  }

  return baseUrl;
};

export const ensureJobMatchesTarget = (job: QueueJobPayload, config: AutomationSafetyConfig) => {
  if (job.environment !== config.targetEnv) {
    throw new Error(`Job environment mismatch: ${job.environment} does not match ${config.targetEnv}.`);
  }

  const jobUrl = normalizeUrl(job.targetUrl);
  const baseUrl = normalizeUrl(config.baseUrl);

  if (jobUrl.hostname !== baseUrl.hostname) {
    throw new Error(`Job target host ${jobUrl.hostname} does not match configured host ${baseUrl.hostname}.`);
  }
};

export const loadEnv = (): AutomationSafetyConfig => {
  return {
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    targetEnv: parseEnvironment(process.env.TARGET_ENV),
    allowProduction: parseBoolean(process.env.ALLOW_PROD),
    allowLivePlatforms: parseBoolean(process.env.ALLOW_LIVE_PLATFORMS),
    baseUrl: process.env.TARGET_BASE_URL ?? 'http://localhost:3000',
    allowedHostSuffixes: parseAllowedHostSuffixes(process.env.ALLOWED_HOST_SUFFIXES)
  };
};
