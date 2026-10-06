// Shared test setup. Every browser test gets:
// - A network guard: the early-access form NEVER reaches the real Formspree
//   inbox (tests mock it), and analytics never fire.
// - OFFLINE=1 (for machines without internet): Google Fonts are served from the
//   local @fontsource/manrope copy so layout matches production, and every
//   other external request is blocked quietly.
// - `errors`: console errors and uncaught exceptions collected for the page.
import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const OFFLINE = process.env.OFFLINE === '1';

let fontDir = null;
try { fontDir = path.join(path.dirname(require.resolve('@fontsource/manrope/package.json')), 'files'); } catch {}

export const PAGES = [
  '/', '/how-it-works', '/why-it-works', '/pricing', '/solutions', '/about',
  '/promise', '/faq', '/early-access', '/thanks', '/privacy', '/terms',
];

export const test = base.extend({
  errors: [async ({ page, baseURL }, use) => {
    const errors = [];
    const localOrigin = new URL(baseURL).origin;
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const loc = m.location()?.url || '';
      // External resources blocked on purpose in OFFLINE mode are not site bugs.
      if (OFFLINE && loc && !loc.startsWith('http://localhost')) return;
      if (OFFLINE && /net::ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text()) && !loc.startsWith('http://localhost')) return;
      errors.push(`console: ${m.text()} ${loc}`);
    });
    page.on('pageerror', (e) => errors.push(`exception: ${e.message}`));
    page.on('requestfailed', (r) => {
      const u = r.url();
      if (!/cloudflareinsights\.com/.test(u) && !(OFFLINE && !u.startsWith(localOrigin)) && r.failure()?.errorText !== 'net::ERR_ABORTED') errors.push(`request failed: ${u} ${r.failure()?.errorText}`);
    });
    page.on('response', (r) => {
      const u = r.url();
      if (u.startsWith(localOrigin) && r.status() >= 400 && r.request().resourceType() !== 'document') errors.push(`HTTP ${r.status()}: ${u}`);
    });
    await use(errors);
  }, { auto: true }],

  page: async ({ page }, use) => {
    await page.route('https://formspree.io/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await page.route(/cloudflareinsights\.com/, (route) => route.abort());
    if (OFFLINE) {
      await page.route(/fonts\.googleapis\.com/, (route) => {
        if (!fontDir) return route.abort();
        const css = [400, 500, 600, 700, 800].map((w) => `@font-face{font-family:'Manrope';font-style:normal;font-weight:${w};font-display:swap;src:url(https://fonts.gstatic.com/manrope-${w}.woff2) format('woff2');}`).join('\n');
        return route.fulfill({ status: 200, contentType: 'text/css', body: css });
      });
      await page.route(/fonts\.gstatic\.com\/manrope-(\d+)\.woff2/, (route) => {
        const w = route.request().url().match(/manrope-(\d+)/)[1];
        return route.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(path.join(fontDir, `manrope-latin-${w}-normal.woff2`)) });
      });
      await page.route((url) => !/^(localhost|127\.0\.0\.1|fonts\.googleapis\.com|fonts\.gstatic\.com|formspree\.io)$/.test(url.hostname), (route) => route.abort());
    }
    await use(page);
  },
});

export { expect };

// ---- In-page helpers (passed to page.evaluate) ----

// Real horizontal scrolling, plus which elements stick out past the viewport.
export const overflowReport = () => {
  const vw = document.documentElement.clientWidth;
  const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const describe = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') +
    ` "${(el.textContent || '').trim().slice(0, 40)}"`;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || (r.right <= vw + 1 && r.left >= -1)) continue;
    let a = el.parentElement, clipped = false;
    while (a && a !== document.documentElement) {
      if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(a).overflowX)) {
        const ar = a.getBoundingClientRect();
        if (ar.right <= vw + 1 && ar.left >= -1) { clipped = true; break; }
      }
      a = a.parentElement;
    }
    if (!clipped) offenders.push(describe(el));
  }
  const bodyHidesIt = ['hidden', 'clip'].includes(getComputedStyle(document.body).overflowX) || ['hidden', 'clip'].includes(getComputedStyle(document.documentElement).overflowX);
  return { vw, sw, scrolls: sw > vw + 1, bodyHidesIt, offenders: offenders.slice(0, 6) };
};

// Is the element and everything above it actually showing?
export const effectiveOpacity = (el) => {
  let o = 1;
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
  return o;
};
