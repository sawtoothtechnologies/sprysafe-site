// Motion rules from brand/TOKENS.md: everything plays once and holds still,
// nothing loops, reduced-motion visitors see the finished state at once, and no
// content can get stuck invisible waiting for an animation.
import { test, expect, PAGES, warnIf } from '../fixtures.mjs';

// Scroll like a person reading: half a screen at a time, letting each frame render.
const scrollThrough = (page) => page.evaluate(async () => {
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  for (let y = 0; y <= document.body.scrollHeight; y += Math.round(innerHeight / 2)) {
    window.scrollTo(0, y); await frame(); await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});

const invisibleText = () => {
  const out = [];
  for (const el of document.querySelectorAll('main *')) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    let op = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
    if (op < 0.99 || getComputedStyle(el).visibility === 'hidden') out.push(`${el.tagName.toLowerCase()}.${el.className} "${el.textContent.trim().slice(0, 40)}" (opacity ${op.toFixed(2)})`);
  }
  return out;
};

for (const path of PAGES) {
  test(`${path}: nothing loops`, async ({ page }) => {
    await page.goto(path);
    await scrollThrough(page);
    await page.waitForTimeout(7000);
    const looping = await page.evaluate(() => document.getAnimations()
      .filter((a) => a.effect?.getComputedTiming().iterations === Infinity && a.playState === 'running')
      .map((a) => `${a.animationName || a.constructor.name} on ${a.effect.target?.className || a.effect.target?.tagName}`));
    expect(looping).toEqual([]);
    const stillRunning = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && !(a instanceof CSSTransition)).length);
    expect(stillRunning, 'animations still running 7s after the last scroll; motion should settle').toBe(0);
  });

  test(`${path}: all text ends up visible after scrolling through`, async ({ page }) => {
    await page.goto(path);
    await scrollThrough(page);
    await page.waitForTimeout(6500);
    expect(await page.evaluate(invisibleText)).toEqual([]);
  });

  test(`${path}: reduced motion shows the finished page at once`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.waitForTimeout(150);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.animationName || 'transition'));
    expect(running, 'animations play despite reduced motion').toEqual([]);
    // No scrolling at all: content further down must already be visible.
    expect(await page.evaluate(invisibleText)).toEqual([]);
  });
}

test('hero example drill finishes arriving within about 3 seconds', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero .drill-card__coach')).toBeVisible();
  await page.waitForTimeout(3600);
  const op = await page.locator('.hero .drill-card__coach').evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(op).toBeGreaterThan(0.99);
});

test('homepage layout does not jump while loading (CLS under 0.1)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'layout-shift API is Chromium-only');
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/');
  await page.waitForTimeout(4000);
  const cls = await page.evaluate(() => window.__cls);
  expect(cls).toBeLessThan(0.1);
});

test('printing a page shows its content (nothing stuck mid-animation)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium');
  for (const path of ['/', '/solutions', '/why-it-works']) {
    await page.goto(path);
    await page.waitForTimeout(4000); // hero entrance done; anything still hidden is waiting on scroll
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(invisibleText);
    warnIf(hidden, `${path} prints with blank sections`);
    await page.emulateMedia({ media: 'screen' });
  }
});
