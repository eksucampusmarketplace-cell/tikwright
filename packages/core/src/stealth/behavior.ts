// Educational demonstration only — do not use on live platforms without explicit permission.

import { Page } from 'playwright';

export const sleep = (minMs: number, maxMs: number) => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const moveMouseHumanLike = async (
  page: Page,
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  const steps = 15 + Math.floor(Math.random() * 10);
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const controlX = start.x + (end.x - start.x) * t + Math.sin(t * Math.PI) * 10;
    const controlY = start.y + (end.y - start.y) * t + Math.cos(t * Math.PI) * 10;
    await page.mouse.move(controlX, controlY);
    await sleep(15, 40);
  }
};

export const randomScroll = async (page: Page) => {
  const distance = 200 + Math.floor(Math.random() * 600);
  await page.mouse.wheel(0, distance);
  await sleep(200, 700);
};

export const typeWithVariability = async (page: Page, selector: string, text: string) => {
  await page.focus(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: 40 + Math.floor(Math.random() * 80) });
  }
  await sleep(300, 800);
};
