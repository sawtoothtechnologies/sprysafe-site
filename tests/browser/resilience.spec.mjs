import { test, expect, overflowReport } from '../fixtures.mjs';

const submit = (page) => page.locator('form.form-card button[type="submit"]');
const ok = (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });

test('signup recovers from one service error without losing attribution', async ({ page }) => {
  const bodies = [];
  await page.route('https://formspree.io/**', (route) => {
    bodies.push(route.request().postData());
    return bodies.length === 1 ? route.fulfill({ status: 503, body: 'unavailable' }) : ok(route);
  });
  await page.goto('/early-access?plan=family&utm_source=launch-test');
  await page.fill('#email', 'test@example.com');
  await submit(page).click();
  await expect(page).toHaveURL(/\/thanks$/);
  expect(bodies).toHaveLength(2);
  // Multipart boundaries may differ between attempts; the actual fields must not.
  for (const body of bodies) {
    expect(body).toContain('test@example.com');
    expect(body).toContain('launch-test');
    expect(body).toContain('family');
  }
});

test('rate limiting preserves the form and allows a later manual retry', async ({ page }) => {
  let count = 0;
  await page.route('https://formspree.io/**', (route) => {
    count++;
    return count === 1 ? route.fulfill({ status: 429, headers: { 'Retry-After': '1' }, body: 'slow down' }) : ok(route);
  });
  await page.goto('/early-access');
  await page.fill('#email', 'test@example.com');
  await page.fill('#worry', 'Keep these details');
  await submit(page).click();
  await expect(page.locator('#form-error')).toBeVisible();
  await expect(page.locator('#worry')).toHaveValue('Keep these details');
  await expect(submit(page)).toBeEnabled();
  expect(count).toBe(1);
  await submit(page).click();
  await expect(page).toHaveURL(/\/thanks$/);
  expect(count).toBe(2);
});

test('a stalled signup times out and restores the form', async ({ page }) => {
  // Exercise the two real 15-second fetch timeouts and retry delay.
  await page.route('https://formspree.io/**', () => {});
  await page.goto('/early-access');
  await page.fill('#email', 'test@example.com');
  await submit(page).click();
  await expect(page.locator('#form-error')).toBeVisible({ timeout: 38_000 });
  await expect(page.locator('#email')).toHaveValue('test@example.com');
  await expect(submit(page)).toBeEnabled();
  await expect(page).toHaveURL(/\/early-access$/);
});

test('blocked browser storage does not prevent pricing or signup', async ({ page }) => {
  await page.addInitScript(() => {
    for (const name of ['localStorage', 'sessionStorage']) Object.defineProperty(window, name, {
      get() { throw new DOMException('Storage disabled', 'SecurityError'); },
    });
  });
  await page.goto('/pricing');
  await page.getByRole('button', { name: 'Dismiss notice' }).click();
  await expect(page.locator('#pricing-notice')).toBeHidden();
  await page.locator('.price-card [data-checkout]').first().click();
  await page.fill('#email', 'test@example.com');
  await submit(page).click();
  await expect(page).toHaveURL(/\/thanks$/);
});

test('URL values and service errors are never interpreted as HTML', async ({ page }) => {
  const payload = '<img src=x onerror="window.__injected=true">';
  await page.route('https://formspree.io/**', (route) => route.fulfill({
    status: 422, contentType: 'application/json', body: JSON.stringify({ errors: [{ message: payload }] }),
  }));
  await page.goto('/early-access?plan=' + encodeURIComponent(payload) + '&utm_source=' + encodeURIComponent(payload));
  await page.fill('#email', 'test@example.com');
  await submit(page).click();
  await expect(page.locator('#form-error')).toBeVisible();
  expect(await page.evaluate(() => window.__injected)).toBeUndefined();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
});

for (const path of ['/', '/pricing', '/solutions', '/early-access']) {
  test(`${path}: increased text spacing retains content within the viewport`, async ({ page, browserName, isMobile }) => {
    test.skip(browserName !== 'chromium' || isMobile);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
    const r = await page.evaluate(overflowReport);
    expect(r.scrolls, JSON.stringify(r)).toBe(false);
    expect(r.offenders, 'content clipped under increased text spacing').toEqual([]);
  });
}
