// Educational demonstration only — do not use on live platforms without explicit permission.

import { Browser, BrowserContext, BrowserType, chromium } from 'playwright';
import { ProxyConfig } from '@tikwright/shared';
import { applyFingerprintNoise, createContextDefaults } from './fingerprint';

export type StealthBrowserOptions = {
  browserType?: BrowserType;
  proxy?: ProxyConfig;
  locale?: string;
  timezoneId?: string;
};

export class StealthBrowserFactory {
  private browser?: Browser;

  constructor(private readonly options: StealthBrowserOptions = {}) {}

  async launchBrowser() {
    if (!this.browser) {
      const browserType = this.options.browserType ?? chromium;
      this.browser = await browserType.launch({
        headless: true,
        proxy: this.options.proxy
          ? {
              server: `http://${this.options.proxy.host}:${this.options.proxy.port}`,
              username: this.options.proxy.username,
              password: this.options.proxy.password
            }
          : undefined
      });
    }

    return this.browser;
  }

  async newContext(): Promise<BrowserContext> {
    const browser = await this.launchBrowser();
    const context = await browser.newContext(
      createContextDefaults({
        locale: this.options.locale,
        timezoneId: this.options.timezoneId
      })
    );

    const page = await context.newPage();
    await applyFingerprintNoise(page);
    await page.close();

    return context;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}
