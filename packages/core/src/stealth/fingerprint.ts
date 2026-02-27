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

/**
 * Applies basic fingerprint noise to a page using init scripts.
 * This includes canvas and WebGL fingerprinting obfuscation.
 * @param page - The Playwright Page object to apply noise to
 */
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

/**
 * Applies advanced fingerprint noise to a page including:
 * - navigator.hardwareConcurrency spoofing (random 4-16)
 * - navigator.deviceMemory spoofing (random 4/8/16)
 * - AudioContext offset noise
 * - Fonts list randomization
 * - Reduced motion / color scheme preferences
 * @param page - The Playwright Page object to apply advanced noise to
 */
export const applyAdvancedNoise = async (page: Page) => {
  await applyFingerprintNoise(page);

  await page.addInitScript(() => {
    // Spoof navigator.hardwareConcurrency (random 4-16)
    const hardwareConcurrency = 4 + Math.floor(Math.random() * 13);
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => hardwareConcurrency,
      configurable: true
    });

    // Spoof navigator.deviceMemory (random 4/8/16)
    const deviceMemoryOptions = [4, 8, 16];
    const deviceMemory =
      deviceMemoryOptions[Math.floor(Math.random() * deviceMemoryOptions.length)];
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => deviceMemory,
      configurable: true
    });

    // Add slight offset noise to AudioContext
    const originalGetChannelData = AudioBuffer.prototype.getChannelData;
    AudioBuffer.prototype.getChannelData = function (channel: number) {
      const data = originalGetChannelData.call(this, channel);
      // Add small random noise to audio data
      const noiseFactor = 0.0001;
      for (let i = 0; i < data.length; i += 100) {
        data[i] += (Math.random() - 0.5) * noiseFactor;
      }
      return data;
    };

    // Override document.fonts to return randomized subset
    const originalFonts = document.fonts as FontFaceSet & { size?: number };
    if (originalFonts && typeof originalFonts.size === 'number') {
      const fontList: string[] = [];
      const fontsArray = Array.from(originalFonts);
      for (let i = 0; i < fontsArray.length; i++) {
        fontList.push(fontsArray[i].family);
      }
      // Add some common fonts to the list
      const commonFonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
      commonFonts.forEach((font) => {
        if (!fontList.includes(font)) {
          fontList.push(font);
        }
      });
      // Randomize by removing some fonts
      const subsetSize = Math.floor(fontList.length * (0.7 + Math.random() * 0.3));
      const randomizedFonts = fontList.slice(0, subsetSize);

      Object.defineProperty(document, 'fonts', {
        get: () => ({
          ...originalFonts,
          size: randomizedFonts.length,
          check: (font: string) => randomizedFonts.includes(font)
        }),
        configurable: true
      });
    }

    // Set reduced motion preference randomly
    const reducedMotionOptions = ['no-preference', 'reduce'];
    const reducedMotion =
      reducedMotionOptions[Math.floor(Math.random() * reducedMotionOptions.length)];
    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return {
            matches: reducedMotion === 'reduce',
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
          };
        }
        if (query === '(prefers-color-scheme: dark)') {
          const colorSchemeOptions = ['dark', 'light', 'no-preference'];
          const colorScheme =
            colorSchemeOptions[Math.floor(Math.random() * colorSchemeOptions.length)];
          return {
            matches: colorScheme === 'dark',
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
          };
        }
        return originalMatchMedia.call(window, query);
      },
      configurable: true
    });

    // Backup original matchMedia if available
    const originalMatchMedia = window.matchMedia;
  });
};
