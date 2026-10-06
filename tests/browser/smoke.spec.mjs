// Every page, every browser: it loads, nothing errors, nothing is broken or
// sticks out sideways, and the basics a visitor needs are there.
import { test, expect, PAGES, overflowReport } from '../fixtures.mjs';

for (const path of PAGES) {
  test.describe(`page ${path}`, () => {
    test('loads cleanly', async ({ page, errors }) => {
      const res = await page.goto(path, { waitUntil: 'load' });
      expect(res.status(), 'HTTP status').toBe(200);
      await page.waitForTimeout(300);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.title()).toMatch(/ScamPrep/);

      // Every image actually rendered (no broken image icons).
      const broken = await page.$$eval('img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
      expect(broken, 'broken images').toEqual([]);

      // Header and footer are present and the logo goes home.
      await expect(page.locator('header .logo')).toHaveAttribute('href', '/');
      await expect(page.locator('footer.site-footer')).toBeVisible();

      expect(errors, 'console errors, exceptions, or failed requests').toEqual([]);
    });

    test('no sideways scrolling', async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(3500); // let entrance animations settle
      const r = await page.evaluate(overflowReport);
      expect(r.scrolls, `page is ${r.sw}px wide in a ${r.vw}px viewport. Sticking out: ${r.offenders.join(' | ')}`).toBe(false);
      expect(r.bodyHidesIt && r.offenders.length ? r.offenders : [], 'content is cut off at the screen edge (hidden by overflow-x)').toEqual([]);
    });

    test('Manrope web font is in use', async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const ok = await page.evaluate(() => document.fonts.check('800 16px Manrope') && document.fonts.check('400 16px Manrope'));
      expect(ok, 'Manrope did not load; headings fall back to a system font').toBe(true);
    });
  });
}

test('unknown URL returns a real 404 page with a way home', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('main a[href="/"]').first()).toBeVisible();
  await expect(page.locator('link[rel=canonical]')).toHaveCount(0);
});

test('retired solution URLs redirect to /solutions', async ({ request }) => {
  for (const slug of ['credit-unions', 'financial-advisors', 'home-care', 'senior-living']) {
    for (const form of [`/solutions/${slug}`, `/solutions/${slug}/`]) {
      const res = await request.get(form, { maxRedirects: 0 });
      expect(res.status(), form).toBe(301);
      expect(res.headers()['location'], form).toBe('/solutions');
    }
  }
});

test('thanks page is kept out of search results', async ({ page }) => {
  await page.goto('/thanks');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
