// Accessibility and older-reader legibility. The audience skews older, so the
// bar is higher than the legal minimum: 44px tap targets, no tiny text, a
// visible focus ring on everything, and zero axe violations.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, PAGES, overflowReport } from '../fixtures.mjs';

const MIN_TEXT_PX = 15;   // TOKENS.md: 16px body; 15px (0.9375rem) is the smallest label size it defines
const MIN_TARGET_PX = 44; // TOKENS.md: hit targets 44px+

const axe = (page) => new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']);
const summarize = (violations) => violations.map((v) =>
  `${v.impact} ${v.id}: ${v.help} -> ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}${v.nodes.length > 3 ? ` (+${v.nodes.length - 3} more)` : ''}`);

for (const path of PAGES) {
  test.describe(`a11y ${path}`, () => {
    test('axe: no violations', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'axe runs on Chromium (desktop and mobile layouts)');
      await page.goto(path);
      await page.waitForTimeout(3500); // finished state, after entrance animations
      await page.evaluate(async () => {
        const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        for (let y = 0; y <= document.body.scrollHeight; y += Math.round(innerHeight / 2)) { window.scrollTo(0, y); await frame(); await new Promise((r) => setTimeout(r, 120)); }
      });
      await page.waitForTimeout(2500);
      const { violations } = await axe(page).analyze();
      expect(summarize(violations)).toEqual([]);
    });

    test(`no text smaller than ${MIN_TEXT_PX}px`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'font sizes are engine-independent; checked once per layout');
      await page.goto(path);
      const small = await page.evaluate((min) => {
        const out = new Map();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const text = n.textContent.trim();
          if (!text) continue;
          const el = n.parentElement;
          if (el.closest('[aria-hidden="true"], script, style, .sr-only, .skip-link')) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const px = parseFloat(getComputedStyle(el).fontSize);
          if (px < min) {
            const key = `${px.toFixed(1)}px <${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? ' class="' + el.className.trim() + '"' : ''}>`;
            if (!out.has(key)) out.set(key, text.slice(0, 50));
          }
        }
        return [...out].map(([k, t]) => `${k} "${t}"`);
      }, MIN_TEXT_PX);
      expect(small).toEqual([]);
    });

    test(`tap targets are at least ${MIN_TARGET_PX}px`, async ({ page, isMobile }) => {
      test.skip(!isMobile, 'touch layouts only');
      await page.goto(path);
      const toggle = page.locator('.menu-toggle');
      const tooSmall = await page.evaluate((min) => {
        const out = [];
        for (const el of document.querySelectorAll('a[href], button, summary, input, select, textarea, [role="button"]')) {
          if (el.closest('[aria-hidden="true"]') || el.type === 'hidden' || el.classList.contains('skip-link')) continue;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (!r.width || !r.height || cs.visibility === 'hidden') continue;
          // WCAG inline exception: a link inside a sentence of body text.
          if (el.tagName === 'A' && cs.display === 'inline') {
            const block = el.closest('p, li, dd, td, figcaption');
            if (block && block.textContent.trim().length > el.textContent.trim().length + 10) continue;
          }
          if (el.type === 'range') { if (r.height < min - 20) out.push(`range ${Math.round(r.width)}x${Math.round(r.height)}`); continue; }
          if (r.height < min || r.width < min) out.push(`${Math.round(r.width)}x${Math.round(r.height)} <${el.tagName.toLowerCase()} class="${el.className}"> "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)}"`);
        }
        return [...new Set(out)];
      }, MIN_TARGET_PX);
      expect(tooSmall).toEqual([]);
      await expect(toggle).toBeVisible();
    });
  });
}

test.describe('a11y in interactive states', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');

  test('mobile menu open', async ({ page, isMobile }) => {
    test.skip(!isMobile);
    await page.goto('/');
    await page.waitForTimeout(3500); // hero finished arriving (mid-fade text reads as low contrast)
    await page.locator('.menu-toggle').click();
    const { violations } = await axe(page).analyze();
    expect(summarize(violations)).toEqual([]);
  });

  test('pricing on monthly, FAQ open', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: 'Monthly' }).click();
    await page.locator('details.faq-item summary').first().click();
    await page.waitForTimeout(1500);
    const { violations } = await axe(page).analyze();
    expect(summarize(violations)).toEqual([]);
  });

  test('home walkthrough on step 4', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3500);
    await page.locator('.hiw__card').nth(3).click();
    await page.waitForTimeout(2500);
    const { violations } = await axe(page).analyze();
    expect(summarize(violations)).toEqual([]);
  });
});

test.describe('keyboard', () => {
  // Desktop Safari does not Tab to links by default (Option-Tab), so it is excluded.
  test.skip(({ browserName, isMobile }) => isMobile || browserName === 'webkit');

  test('skip link is first, visible, and jumps into the page', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box && box.x >= 0 && box.y >= 0, 'skip link is off-screen when focused').toBe(true);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    const inMain = await page.evaluate(() => !!document.activeElement.closest('main'));
    expect(inMain, 'after the skip link, the next Tab should land inside the main content').toBe(true);
  });

  for (const path of PAGES) {
    test(`every focus stop on ${path} is visible and shows a focus ring`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(3500);
      const problems = [];
      const seen = new Set();
      for (let i = 0; i < 160; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          let op = 1;
          for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
          const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow && cs.boxShadow !== 'none');
          const label = `<${el.tagName.toLowerCase()}> "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)}"`;
          return { key: el.outerHTML.slice(0, 120) + r.top, label, visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && op > 0.5, ring, inFooter: !!el.closest('footer') };
        });
        if (!info) break;
        if (seen.has(info.key)) break;
        seen.add(info.key);
        if (!info.visible) problems.push(`focus lands on something invisible: ${info.label}`);
        else if (!info.ring) problems.push(`no visible focus ring: ${info.label}`);
      }
      expect(seen.size, 'Tab never moved focus').toBeGreaterThan(3);
      expect(problems).toEqual([]);
    });
  }
});

test.describe('zoom and reflow', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile);

  for (const path of PAGES) {
    test(`${path} at 200% text size has no sideways scrolling`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(path);
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      await page.waitForTimeout(3500);
      const r = await page.evaluate(overflowReport);
      expect(r.scrolls, `${r.sw}px wide at 200% text. Sticking out: ${r.offenders.join(' | ')}`).toBe(false);
    });
  }

  const widths = [320, 360, 390, 430, 600, 768, 820, 900, 901, 1024, 1039, 1040, 1280, 1920];
  for (const path of PAGES) {
    test(`${path} has no sideways scrolling at any common width`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(3500);
      const bad = [];
      for (const w of widths) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.waitForTimeout(150);
        const r = await page.evaluate(overflowReport);
        if (r.scrolls) bad.push(`${w}px: page is ${r.sw}px wide. ${r.offenders.slice(0, 3).join(' | ')}`);
      }
      expect(bad).toEqual([]);
    });
  }

  test('header nav fits on one line from 901px up', async ({ page }) => {
    for (const w of [901, 960, 1024, 1100]) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto('/');
      const h = await page.locator('.site-header').boundingBox();
      expect(h.height, `header is ${h.height}px tall at ${w}px (nav wrapped)`).toBeLessThan(90);
    }
  });
});
