// Educational demonstration only — do not use on live platforms without explicit permission.

import { BrowserContextOptions, Page } from 'playwright';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

const VIEWPORTS = [
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 }
];

export const pickRandomUserAgent = (userAgents: string[] = USER_AGENTS) => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

export const pickRandomViewport = (viewports = VIEWPORTS) => {
  return viewports[Math.floor(Math.random() * viewports.length)];
};

export const createContextDefaults = (
  overrides: Partial<BrowserContextOptions> = {}
): BrowserContextOptions => {
  return {
    userAgent: pickRandomUserAgent(),
    viewport: pickRandomViewport(),
    locale: overrides.locale ?? 'en-US',
    timezoneId: overrides.timezoneId ?? 'America/New_York',
    ...overrides
  };
};

export const applyFingerprintNoise = async (page: Page) => {
  await page.addInitScript(() => {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args) {
      const ctx = this.getContext('2d');
      if (ctx) {
        ctx.globalAlpha = 0.97;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1, 1);
      }
      return originalToDataURL.apply(this, args as never);
    };

    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter: number) {
      if (parameter === 37445) {
        return 'Google Inc.';
      }
      if (parameter === 37446) {
        return 'ANGLE (Apple, Apple M1, OpenGL 4.1)';
      }
      return originalGetParameter.call(this, parameter);
    };
  });
};
