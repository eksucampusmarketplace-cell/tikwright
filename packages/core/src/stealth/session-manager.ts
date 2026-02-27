// Educational demonstration only — do not use on live platforms without explicit permission.

import * as fs from 'fs/promises';
import * as path from 'path';
import { BrowserContext } from 'playwright';
import { ProxyConfig } from '@tikwright/shared';
import { createContextDefaults, applyFingerprintNoise } from './fingerprint';

/**
 * Converts ProxyConfig to Playwright's proxy format
 */
const toPlaywrightProxy = (proxy?: ProxyConfig) => {
  if (!proxy) return undefined;
  return {
    server: `http://${proxy.host}:${proxy.port}`,
    username: proxy.username,
    password: proxy.password
  };
};

export type SessionManagerOptions = {
  /**
   * Base directory for storing session data
   * @default 'sessions'
   */
  sessionsDir?: string;
  /**
   * Logger function for debugging
   */
  logger?: (message: string) => void;
};

/**
 * SessionManager handles persistence of browser session state including
 * cookies, localStorage, and other browser state.
 * This is for researching how modern sites maintain authenticated states
 * across browser restarts in controlled test environments.
 */
export class SessionManager {
  private readonly sessionsDir: string;
  private readonly logger: (message: string) => void;

  constructor(options: SessionManagerOptions = {}) {
    this.sessionsDir = options.sessionsDir ?? 'sessions';
    this.logger = options.logger ?? (() => {});
  }

  /**
   * Ensures the session directory exists for a given profile
   */
  private async ensureSessionDir(profileId: string): Promise<string> {
    const sessionPath = path.join(this.sessionsDir, profileId);
    await fs.mkdir(sessionPath, { recursive: true });
    return sessionPath;
  }

  /**
   * Saves a BrowserContext's state (cookies, localStorage) to disk
   * @param context - The BrowserContext to save
   * @param profileId - Unique identifier for the session profile
   */
  async saveContext(context: BrowserContext, profileId: string): Promise<void> {
    try {
      const sessionPath = await this.ensureSessionDir(profileId);

      // Save cookies
      const cookies = await context.cookies();
      await fs.writeFile(
        path.join(sessionPath, 'cookies.json'),
        JSON.stringify(cookies, null, 2),
        'utf-8'
      );
      this.logger(`Saved ${cookies.length} cookies for profile ${profileId}`);

      // Save localStorage via page evaluation
      const pages = context.pages();
      if (pages.length > 0) {
        const localStorageData = await pages[0].evaluate(() => {
          const data: Record<string, string> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              data[key] = localStorage.getItem(key) ?? '';
            }
          }
          return data;
        });
        await fs.writeFile(
          path.join(sessionPath, 'localStorage.json'),
          JSON.stringify(localStorageData, null, 2),
          'utf-8'
        );
        this.logger(`Saved localStorage for profile ${profileId}`);
      }

      // Save sessionStorage if available
      try {
        const sessionPages = context.pages();
        if (sessionPages.length > 0) {
          const sessionStorageData = await sessionPages[0].evaluate(() => {
            const data: Record<string, string> = {};
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (key) {
                data[key] = sessionStorage.getItem(key) ?? '';
              }
            }
            return data;
          });
          await fs.writeFile(
            path.join(sessionPath, 'sessionStorage.json'),
            JSON.stringify(sessionStorageData, null, 2),
            'utf-8'
          );
          this.logger(`Saved sessionStorage for profile ${profileId}`);
        }
      } catch (sessionError) {
        this.logger(`Could not save sessionStorage: ${sessionError}`);
      }

      this.logger(`Session ${profileId} saved successfully`);
    } catch (error) {
      this.logger(`Error saving session ${profileId}: ${error}`);
      throw error;
    }
  }

  /**
   * Loads a saved session state into a new context
   * @param profileId - Unique identifier for the session profile
   * @param options - Options for creating the new context
   * @returns A new BrowserContext with loaded state, or a fresh context if no saved state exists
   */
  async loadContext(
    profileId: string,
    options: {
      browser: import('playwright').Browser;
      proxy?: ProxyConfig;
      locale?: string;
      timezoneId?: string;
    }
  ): Promise<BrowserContext> {
    const sessionPath = path.join(this.sessionsDir, profileId);

    try {
      // Check if session exists
      await fs.access(sessionPath);
    } catch {
      this.logger(`No saved session found for ${profileId}, creating fresh context`);
      return this.createNewContext(options);
    }

    try {
      // Create new context with proxy support if needed
      const context = await options.browser.newContext(
        createContextDefaults({
          proxy: toPlaywrightProxy(options.proxy),
          locale: options.locale,
          timezoneId: options.timezoneId
        })
      );

      // Load cookies
      try {
        const cookiesPath = path.join(sessionPath, 'cookies.json');
        const cookiesData = await fs.readFile(cookiesPath, 'utf-8');
        const cookies = JSON.parse(cookiesData);
        await context.addCookies(cookies);
        this.logger(`Loaded ${cookies.length} cookies for profile ${profileId}`);
      } catch (cookieError) {
        this.logger(`Could not load cookies: ${cookieError}`);
      }

      // Load localStorage
      try {
        const localStoragePath = path.join(sessionPath, 'localStorage.json');
        const localStorageData = await fs.readFile(localStoragePath, 'utf-8');
        const localStorageObj = JSON.parse(localStorageData);

        const page = await context.newPage();
        await page.addInitScript((data) => {
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, value as string);
          });
        }, localStorageObj);
        await page.close();
        this.logger(`Loaded localStorage for profile ${profileId}`);
      } catch (lsError) {
        this.logger(`Could not load localStorage: ${lsError}`);
      }

      // Load sessionStorage
      try {
        const sessionStoragePath = path.join(sessionPath, 'sessionStorage.json');
        const sessionStorageData = await fs.readFile(sessionStoragePath, 'utf-8');
        const sessionStorageObj = JSON.parse(sessionStorageData);

        const page = await context.newPage();
        await page.addInitScript((data) => {
          Object.entries(data).forEach(([key, value]) => {
            sessionStorage.setItem(key, value as string);
          });
        }, sessionStorageObj);
        await page.close();
        this.logger(`Loaded sessionStorage for profile ${profileId}`);
      } catch (ssError) {
        this.logger(`Could not load sessionStorage: ${ssError}`);
      }

      // Apply fingerprint noise to ensure consistent fingerprinting
      const page = await context.newPage();
      await applyFingerprintNoise(page);
      await page.close();

      this.logger(`Session ${profileId} loaded successfully`);
      return context;
    } catch (error) {
      this.logger(`Error loading session ${profileId}: ${error}, creating fresh context`);
      return this.createNewContext(options);
    }
  }

  /**
   * Creates a fresh context without loading any saved state
   */
  private async createNewContext(options: {
    browser: import('playwright').Browser;
    proxy?: ProxyConfig;
    locale?: string;
    timezoneId?: string;
  }): Promise<BrowserContext> {
    const context = await options.browser.newContext(
      createContextDefaults({
        proxy: toPlaywrightProxy(options.proxy),
        locale: options.locale,
        timezoneId: options.timezoneId
      })
    );

    const page = await context.newPage();
    await applyFingerprintNoise(page);
    await page.close();

    return context;
  }

  /**
   * Switches proxy for an existing context by closing and recreating it
   * @param context - The current BrowserContext
   * @param profileId - The profile ID to maintain session state
   * @param newProxy - The new proxy configuration
   * @param options - Browser and other options
   * @returns A new BrowserContext with the new proxy
   */
  async switchProxy(
    context: BrowserContext,
    profileId: string,
    newProxy: ProxyConfig,
    options: {
      browser: import('playwright').Browser;
      locale?: string;
      timezoneId?: string;
    }
  ): Promise<BrowserContext> {
    // Save current session state before closing
    await this.saveContext(context, profileId);

    // Close old context
    await context.close();

    // Load session with new proxy
    return this.loadContext(profileId, {
      browser: options.browser,
      proxy: newProxy,
      locale: options.locale,
      timezoneId: options.timezoneId
    });
  }

  /**
   * Deletes a saved session from disk
   * @param profileId - Unique identifier for the session profile
   */
  async deleteSession(profileId: string): Promise<void> {
    const sessionPath = path.join(this.sessionsDir, profileId);
    try {
      await fs.rm(sessionPath, { recursive: true, force: true });
      this.logger(`Deleted session ${profileId}`);
    } catch (error) {
      this.logger(`Error deleting session ${profileId}: ${error}`);
      throw error;
    }
  }

  /**
   * Checks if a saved session exists for a given profile
   * @param profileId - Unique identifier for the session profile
   * @returns true if session exists, false otherwise
   */
  async sessionExists(profileId: string): Promise<boolean> {
    const sessionPath = path.join(this.sessionsDir, profileId);
    try {
      await fs.access(sessionPath);
      return true;
    } catch {
      return false;
    }
  }
}
