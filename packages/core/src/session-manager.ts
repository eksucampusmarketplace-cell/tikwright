// Educational demonstration only — do not use on live platforms without explicit permission.

import * as fs from 'fs';
import * as path from 'path';
import { BrowserContext, Cookie } from 'playwright';
import { ProxyConfig } from '@tikwright/shared';
import { StealthBrowserFactory } from './stealth/StealthBrowserFactory';

const SESSIONS_DIR = path.resolve(process.cwd(), 'sessions');

/**
 * Serialised shape stored in localStorage.json.
 * Keys map directly to localStorage key/value pairs for a given origin.
 */
type LocalStorageSnapshot = Record<string, Record<string, string>>;

/**
 * Manages persistent browser-session state (cookies + localStorage) across
 * browser restarts for research into how modern sites maintain authenticated
 * state.
 *
 * State is stored under `sessions/{profileId}/` as:
 *  - `cookies.json`   — array of Playwright `Cookie` objects
 *  - `localStorage.json` — map of origin → { key: value } pairs
 */
export class SessionManager {
  private readonly sessionsDir: string;

  constructor(sessionsDir: string = SESSIONS_DIR) {
    this.sessionsDir = sessionsDir;
  }

  /** Returns the directory path for a given profileId. */
  private profileDir(profileId: string): string {
    return path.join(this.sessionsDir, profileId);
  }

  /**
   * Saves a BrowserContext's cookies and localStorage to disk.
   *
   * @param context  - The Playwright BrowserContext whose state should be saved.
   * @param profileId - An arbitrary string that identifies this session profile.
   */
  async saveContext(context: BrowserContext, profileId: string): Promise<void> {
    const dir = this.profileDir(profileId);
    fs.mkdirSync(dir, { recursive: true });

    const cookies = await context.cookies();
    fs.writeFileSync(
      path.join(dir, 'cookies.json'),
      JSON.stringify(cookies, null, 2),
      'utf-8'
    );
    console.log(`[SessionManager] Saved ${cookies.length} cookies for profile "${profileId}".`);

    const pages = context.pages();
    const localStorage: LocalStorageSnapshot = {};

    for (const page of pages) {
      try {
        const origin = new URL(page.url()).origin;
        if (!origin || origin === 'null') continue;

        const entries: Record<string, string> = await page.evaluate(() => {
          const result: Record<string, string> = {};
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key !== null) {
              result[key] = window.localStorage.getItem(key) ?? '';
            }
          }
          return result;
        });

        if (Object.keys(entries).length > 0) {
          localStorage[origin] = entries;
        }
      } catch {
        // Page may be navigating or closed; skip silently.
      }
    }

    fs.writeFileSync(
      path.join(dir, 'localStorage.json'),
      JSON.stringify(localStorage, null, 2),
      'utf-8'
    );
    console.log(`[SessionManager] Saved localStorage for ${Object.keys(localStorage).length} origin(s) for profile "${profileId}".`);
  }

  /**
   * Loads a previously saved session into a fresh BrowserContext.
   * Restores cookies via `context.addCookies()` and localStorage via
   * `addInitScript()` so values are injected before the page executes.
   *
   * If no saved state is found, a fresh context is returned with a warning.
   *
   * @param profileId - The profile identifier used when the session was saved.
   * @param options   - Optional proxy configuration for the new context.
   * @returns A BrowserContext with the restored session (or a fresh one).
   */
  async loadContext(
    profileId: string,
    options: { proxy?: ProxyConfig } = {}
  ): Promise<BrowserContext> {
    const factory = new StealthBrowserFactory({ proxy: options.proxy });
    const context = await factory.newContext();

    const dir = this.profileDir(profileId);
    const cookiesPath = path.join(dir, 'cookies.json');
    const localStoragePath = path.join(dir, 'localStorage.json');

    if (!fs.existsSync(cookiesPath)) {
      console.warn(
        `[SessionManager] No saved session found for profile "${profileId}". Returning fresh context.`
      );
      return context;
    }

    try {
      const rawCookies = fs.readFileSync(cookiesPath, 'utf-8');
      const cookies: Cookie[] = JSON.parse(rawCookies);
      await context.addCookies(cookies);
      console.log(`[SessionManager] Restored ${cookies.length} cookies for profile "${profileId}".`);
    } catch (err) {
      console.error(`[SessionManager] Failed to restore cookies for profile "${profileId}":`, err);
    }

    if (fs.existsSync(localStoragePath)) {
      try {
        const rawLocalStorage = fs.readFileSync(localStoragePath, 'utf-8');
        const localStorage: LocalStorageSnapshot = JSON.parse(rawLocalStorage);

        await context.addInitScript((snapshot: LocalStorageSnapshot) => {
          const origin = window.location.origin;
          const entries = snapshot[origin];
          if (entries) {
            for (const [key, value] of Object.entries(entries)) {
              window.localStorage.setItem(key, value);
            }
          }
        }, localStorage);

        console.log(
          `[SessionManager] Queued localStorage restoration for profile "${profileId}" (injected via init script).`
        );
      } catch (err) {
        console.error(
          `[SessionManager] Failed to restore localStorage for profile "${profileId}":`,
          err
        );
      }
    }

    return context;
  }
}
