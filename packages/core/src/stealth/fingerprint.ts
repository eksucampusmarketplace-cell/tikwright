// Educational demonstration only — do not use on live platforms without explicit permission.

import { BrowserContextOptions, Page } from 'playwright';

/** Picks a random element from an array. */
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Returns a random integer in the range [min, max] (inclusive). */
const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

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

/**
 * Advanced fingerprint noise parameters resolved at call-time in Node so that
 * random values are stable for the lifetime of one page session, then injected
 * via `addInitScript`.
 */
type AdvancedNoiseParams = {
  /** `navigator.hardwareConcurrency` spoof value (4–16). */
  hardwareConcurrency: number;
  /** `navigator.deviceMemory` spoof value (4, 8, or 16). */
  deviceMemory: number;
  /** Small float offset added to each AudioContext sample (e.g. 0.000001). */
  audioNoise: number;
  /** Whether `prefers-reduced-motion` media query should report "reduce". */
  prefersReducedMotion: boolean;
  /** Whether `prefers-color-scheme` media query should report "dark". */
  prefersDarkMode: boolean;
  /** Subset of font family names injected to perturb FontFaceSet enumeration. */
  fontSubset: string[];
};

const FONT_POOL = [
  'Arial', 'Verdana', 'Helvetica', 'Tahoma', 'Trebuchet MS',
  'Times New Roman', 'Georgia', 'Garamond', 'Courier New', 'Brush Script MT',
  'Palatino', 'Bookman', 'Comic Sans MS', 'Impact', 'Lucida Sans Unicode',
];

/**
 * Builds a random set of {@link AdvancedNoiseParams} at call-time.
 * Keeping the resolution in Node ensures each context receives a consistent
 * seed without relying on `Math.random` inside the browser sandbox.
 */
const buildAdvancedNoiseParams = (): AdvancedNoiseParams => ({
  hardwareConcurrency: pick([4, 6, 8, 10, 12, 16]),
  deviceMemory: pick([4, 8, 16]),
  audioNoise: (randInt(1, 9) * 0.000001),
  prefersReducedMotion: Math.random() < 0.3,
  prefersDarkMode: Math.random() < 0.5,
  fontSubset: FONT_POOL.slice(0, randInt(6, 12)),
});

/**
 * Applies advanced, realistic fingerprint perturbations on top of the baseline
 * `applyFingerprintNoise` spoofs.  All overrides are injected via
 * `page.addInitScript()` so they run before any page script.
 *
 * Spoofs applied:
 * - `navigator.hardwareConcurrency` (random from 4–16)
 * - `navigator.deviceMemory` (random 4 / 8 / 16)
 * - `AudioContext` channel-data noise (tiny float offset via `getChannelData`)
 * - `document.fonts` enumeration subset via a synthetic `FontFaceSet`-like shim
 * - `prefers-reduced-motion` and `prefers-color-scheme` via `matchMedia` override
 *
 * @param page - The Playwright Page to instrument.
 */
export const applyAdvancedNoise = async (page: Page): Promise<void> => {
  await applyFingerprintNoise(page);

  const params = buildAdvancedNoiseParams();

  await page.addInitScript((p: AdvancedNoiseParams) => {
    // --- navigator.hardwareConcurrency ---
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => p.hardwareConcurrency,
      configurable: true,
    });

    // --- navigator.deviceMemory ---
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => p.deviceMemory,
      configurable: true,
    });

    // --- AudioContext channel-data noise ---
    const OriginalAudioContext =
      (window as unknown as Record<string, unknown>)['AudioContext'] as typeof AudioContext | undefined;
    if (OriginalAudioContext) {
      const OriginalGetChannelData = AudioBuffer.prototype.getChannelData;
      AudioBuffer.prototype.getChannelData = function (channel: number) {
        const data = OriginalGetChannelData.call(this, channel);
        for (let i = 0; i < data.length; i += 100) {
          data[i] += p.audioNoise;
        }
        return data;
      };
    }

    // --- prefers-reduced-motion / prefers-color-scheme via matchMedia ---
    const originalMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query: string): MediaQueryList => {
      if (query.includes('prefers-reduced-motion')) {
        const value = p.prefersReducedMotion ? 'reduce' : 'no-preference';
        const matches = p.prefersReducedMotion;
        return Object.assign(originalMatchMedia(query), {
          matches,
          media: `(prefers-reduced-motion: ${value})`,
        });
      }
      if (query.includes('prefers-color-scheme')) {
        const value = p.prefersDarkMode ? 'dark' : 'light';
        const matches = p.prefersDarkMode;
        return Object.assign(originalMatchMedia(query), {
          matches,
          media: `(prefers-color-scheme: ${value})`,
        });
      }
      return originalMatchMedia(query);
    };

    // --- document.fonts subset shim ---
    try {
      const fakeFaces = p.fontSubset.map((family) => {
        const ff = new FontFace(family, 'local(' + family + ')');
        return ff;
      });
      const fontsAny = document.fonts as unknown as { has: (f: FontFace) => boolean };
      const originalHas = fontsAny.has.bind(fontsAny);
      Object.defineProperty(document, 'fonts', {
        get: () => ({
          ...document.fonts,
          has: (face: FontFace) =>
            fakeFaces.some((f) => f.family === face.family) || originalHas(face),
          forEach: (cb: (face: FontFace) => void) => fakeFaces.forEach(cb),
          [Symbol.iterator]: () => fakeFaces[Symbol.iterator](),
        }),
        configurable: true,
      });
    } catch {
      // FontFace API unavailable in this context; skip silently.
    }
  }, params);
};
