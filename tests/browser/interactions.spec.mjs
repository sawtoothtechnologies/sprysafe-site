// Everything a visitor can click, tap, type or drag.
import { test, expect, warnIf } from '../fixtures.mjs';

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile);

  test('opens, every link works, and closes', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.menu-toggle');
    const nav = page.locator('#site-nav');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();
    for (const name of ['How it works', 'For financial advisors', 'Pricing', 'About', 'Get early access']) {
      await expect(nav.getByRole('link', { name })).toBeVisible();
    }
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();

    await toggle.click();
    await nav.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.locator('#site-nav')).toBeHidden();
  });

  test('Escape closes the open menu and returns focus to the button', async ({ page }) => {
    await page.goto('/');
    await page.locator('.menu-toggle').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#site-nav'), 'menu stays open after Escape').toBeHidden();
    await expect(page.locator('.menu-toggle')).toBeFocused();
  });

  test('tapping outside the open menu closes it', async ({ page }) => {
    await page.goto('/pricing');
    await page.locator('.menu-toggle').click();
    const vp = page.viewportSize();
    await page.mouse.click(vp.width / 2, vp.height - 20); // empty page area below the open menu
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.locator('#site-nav'), 'menu stays open over the page after tapping elsewhere').toBeHidden();
  });

  test('open menu stays usable after scrolling (sticky header)', async ({ page }) => {
    await page.goto('/');
    // Scroll by script: mobile WebKit has no mouse wheel.
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(300);
    await page.locator('.menu-toggle').click();
    await expect(page.locator('#site-nav').getByRole('link', { name: 'About' })).toBeInViewport();
  });
});

test('desktop nav links all reach their pages', async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.goto('/');
  for (const [name, url] of [['How it works', '/how-it-works'], ['For financial advisors', '/solutions'], ['Pricing', '/pricing'], ['About', '/about'], ['Get early access', '/early-access']]) {
    await page.locator('#site-nav').getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(url + '$'));
    await expect(page.locator('h1')).toBeVisible();
  }
});

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------
test.describe('pricing', () => {
  const read = (page) => page.$$eval('.price-card', (cards) => cards.map((c) => ({
    plan: c.querySelector('h2').textContent.trim(),
    price: c.querySelector('.price-card__num').textContent.trim(),
    billing: c.querySelector('.price-card__billing').textContent.trim(),
    href: c.querySelector('[data-checkout]').getAttribute('href'),
  })));

  test('annual is the default and shows the right prices', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('button', { name: 'Annual' })).toHaveAttribute('aria-pressed', 'true');
    expect(await read(page)).toEqual([
      { plan: 'Individual', price: '$9', billing: '$108 / year, billed annually', href: '/early-access?plan=individual' },
      { plan: 'Pairs', price: '$15', billing: '$180 / year, billed annually', href: '/early-access?plan=couples' },
      { plan: 'Family', price: '$19', billing: '$228 / year, billed annually', href: '/early-access?plan=family' },
    ]);
  });

  test('monthly toggle swaps every price and back', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(page.getByRole('button', { name: 'Monthly' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Annual' })).toHaveAttribute('aria-pressed', 'false');
    expect((await read(page)).map((c) => [c.price, c.billing, c.href])).toEqual([
      ['$12', 'billed monthly, cancel anytime', '/early-access?plan=individual'],
      ['$20', 'billed monthly, cancel anytime', '/early-access?plan=couples'],
      ['$25', 'billed monthly, cancel anytime', '/early-access?plan=family'],
    ]);
    await page.getByRole('button', { name: 'Annual' }).click();
    expect((await read(page)).map((c) => c.price)).toEqual(['$9', '$15', '$19']);
    // Rapid toggling never leaves a mixed state.
    for (let i = 0; i < 10; i++) await page.locator('.billing-toggle__btn').nth(i % 2).click();
    expect((await read(page)).map((c) => c.price)).toEqual(['$12', '$20', '$25']);
  });

  test('"3 months free" is hidden from screen readers on Monthly', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: 'Monthly' }).click();
    await page.waitForTimeout(400);
    const exposed = await page.locator('.billing-note').evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && !el.closest('[aria-hidden="true"]') && !el.hidden;
    });
    expect(exposed, 'the note is only faded out (opacity 0), so screen readers still read "3 months free" on Monthly').toBe(false);
  });

  test('the price change is announced to screen readers', async ({ page }) => {
    await page.goto('/pricing');
    const live = await page.evaluate(() => [...document.querySelectorAll('[aria-live]')].some((r) => r.querySelector('.price-card__num') || r.closest('.pricing-grid')));
    expect(live, 'pressing Monthly silently changes every price; nothing tells a screen reader user').toBe(true);
  });

  test('toggle buttons are big enough to tap', async ({ page, isMobile }) => {
    test.skip(!isMobile);
    await page.goto('/pricing');
    const box = await page.getByRole('button', { name: 'Monthly' }).boundingBox();
    if (box.height < 44) warnIf(`${Math.round(box.height)}px tall`, 'Annual/Monthly buttons under 44px');
  });

  for (const [plan, i] of [['individual', 0], ['couples', 1], ['family', 2]]) {
    test(`choosing ${plan} carries the plan into the signup form`, async ({ page }) => {
      await page.goto('/pricing');
      await page.locator('.price-card [data-checkout]').nth(i).click();
      await expect(page).toHaveURL(new RegExp(`/early-access\\?plan=${plan}$`));
      await expect(page.locator('#plan')).toHaveValue(plan);
    });
  }

  test('availability notice: dismiss sticks for the visit, returns next visit', async ({ page, browser }) => {
    await page.goto('/pricing');
    const notice = page.locator('#pricing-notice');
    await expect(notice).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss notice' }).click();
    await expect(notice).toBeHidden();
    await page.reload();
    await expect(notice).toBeHidden();
    const fresh = await browser.newContext();
    const p2 = await fresh.newPage();
    await p2.goto(page.url());
    await expect(p2.locator('#pricing-notice')).toBeVisible();
    await fresh.close();
  });
});

// ---------------------------------------------------------------------------
// Early-access form (Formspree is always mocked; nothing real is sent)
// ---------------------------------------------------------------------------
test.describe('early-access form', () => {
  const capture = async (page, reply) => {
    const sent = [];
    await page.route('https://formspree.io/**', async (route) => {
      sent.push(route.request().postData() || '');
      return reply(route);
    });
    return sent;
  };
  const ok = (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  const fieldsOf = (body) => {
    const out = {};
    for (const m of body.matchAll(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n--/g)) out[m[1]] = m[2];
    if (!Object.keys(out).length) for (const [k, v] of new URLSearchParams(body)) out[k] = v;
    return out;
  };

  test('empty submit is blocked and nothing is sent', async ({ page }) => {
    const sent = await capture(page, ok);
    await page.goto('/early-access');
    await page.getByRole('button', { name: 'Get early access' }).last().click();
    await page.waitForTimeout(500);
    expect(sent.length).toBe(0);
    await expect(page).toHaveURL(/\/early-access/);
    expect(await page.locator('#email').evaluate((el) => el.matches(':invalid'))).toBe(true);
  });

  for (const bad of ['mary', 'mary@', '@example.com', 'mary example.com']) {
    test(`invalid email "${bad}" is blocked`, async ({ page }) => {
      const sent = await capture(page, ok);
      await page.goto('/early-access');
      await page.fill('#email', bad);
      await page.locator('form.form-card button[type=submit]').click();
      await page.waitForTimeout(400);
      expect(sent.length).toBe(0);
    });
  }

  test('a valid signup sends the right fields once and lands on /thanks', async ({ page }) => {
    const sent = await capture(page, ok);
    await page.goto('/?utm_source=linkedin&utm_medium=social&utm_campaign=launch');
    await page.goto('/pricing'); // browse first: tags must survive the visit
    await page.locator('.price-card [data-checkout]').nth(1).click();
    await page.fill('#name', 'Test Person');
    await page.fill('#email', 'test+scamprep@example.com');
    await page.selectOption('#role', 'Protect myself');
    await page.fill('#worry', 'Phone calls pretending to be my bank. "Quotes", ampersands & émojis are fine.');
    const submit = page.locator('form.form-card button[type=submit]');
    await submit.dblclick(); // impatient double-click
    await expect(page).toHaveURL(/\/thanks$/);
    expect(sent.length, 'double-click must not submit twice').toBe(1);
    const f = fieldsOf(sent[0]);
    expect(f).toMatchObject({ name: 'Test Person', email: 'test+scamprep@example.com', role: 'Protect myself', plan: 'couples', utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'launch' });
    expect(f.worry).toContain('émojis');
  });

  test('empty optional fields are left out of the email', async ({ page }) => {
    const sent = await capture(page, ok);
    await page.goto('/early-access');
    await page.fill('#email', 'a@example.com');
    await page.locator('form.form-card button[type=submit]').click();
    await expect(page).toHaveURL(/\/thanks$/);
    const f = fieldsOf(sent[0]);
    for (const k of ['plan', 'utm_source', 'utm_medium', 'utm_campaign', 'referrer']) expect(f[k], k).toBeUndefined();
  });

  for (const [label, reply] of [
    ['Formspree rejects it (422)', (r) => r.fulfill({ status: 422, contentType: 'application/json', body: '{"errors":[{"message":"should be an email"}]}' })],
    ['Formspree is down (500)', (r) => r.fulfill({ status: 500, body: 'error' })],
    ['the network drops', (r) => r.abort('internetdisconnected')],
  ]) {
    test(`when ${label}, the visitor stays on the site and sees what to do`, async ({ page }) => {
      await capture(page, reply);
      await page.goto('/early-access');
      await page.fill('#email', 'a@example.com');
      await page.locator('form.form-card button[type=submit]').click();
      await page.waitForTimeout(2000);
      expect(new URL(page.url()).hostname, 'visitor was sent off-site to Formspree (or a browser error page)').toBe('localhost');
      await expect(page.locator('form.form-card [role="alert"], form.form-card .form-error'), 'no error message shown').toBeVisible();
      await expect(page.locator('#email'), 'typed email was lost').toHaveValue('a@example.com');
      await expect(page.locator('form.form-card button[type=submit]')).toBeEnabled();
    });
  }

  test('inputs are 16px+ so iPhones do not zoom in on tap', async ({ page }) => {
    await page.goto('/early-access');
    const sizes = await page.$$eval('form.form-card input:not([type=hidden]), form.form-card select, form.form-card textarea', (els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    for (const s of sizes) expect(s).toBeGreaterThanOrEqual(16);
  });

  test('without JavaScript the form still posts to Formspree', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    let posted = false;
    await page.route('https://formspree.io/**', (r) => { posted = r.request().method() === 'POST'; return r.fulfill({ status: 200, contentType: 'text/html', body: '<h1>ok</h1>' }); });
    await page.goto('/early-access');
    await page.fill('#email', 'a@example.com');
    await page.locator('form.form-card button[type=submit]').click();
    await page.waitForTimeout(800);
    expect(posted).toBe(true);
    await ctx.close();
  });
});

// ---------------------------------------------------------------------------
// FAQ accordions
// ---------------------------------------------------------------------------
for (const path of ['/', '/faq', '/pricing', '/solutions']) {
  test(`FAQ on ${path} opens and closes by click and keyboard`, async ({ page, isMobile, browserName }) => {
    await page.goto(path);
    const items = page.locator('details.faq-item');
    const n = await items.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const d = items.nth(i);
      await d.locator('summary').click();
      await expect(d).toHaveAttribute('open', '');
      await expect(d.locator('.faq-body')).toBeVisible();
      await d.locator('summary').click();
      await expect(d).not.toHaveAttribute('open', '');
    }
    if (!isMobile && browserName !== 'webkit') {
      await items.first().locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(items.first()).toHaveAttribute('open', '');
      await page.keyboard.press('Space');
      await expect(items.first()).not.toHaveAttribute('open', '');
    }
  });
}

// ---------------------------------------------------------------------------
// Homepage walkthrough ("How it works" steps + phone)
// ---------------------------------------------------------------------------
test.describe('home walkthrough', () => {
  test('wide screens: choosing a step shows its scene on the phone', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const cards = page.locator('.hiw__card');
    for (let i = 0; i < 4; i++) {
      await cards.nth(i).click();
      await expect(cards.nth(i)).toHaveAttribute('aria-pressed', 'true');
      for (let j = 0; j < 4; j++) if (j !== i) await expect(cards.nth(j)).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator(`#phone-demo .scene[data-scene="${i}"]`)).toBeVisible();
      await expect(page.locator('#phone-demo .scene:visible')).toHaveCount(1);
      await expect(cards.nth(i).locator('.hiw__card-teaser > span')).toBeVisible();
    }
  });

  test('wide screens: phone messages finish arriving for every step', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.locator('#how').scrollIntoViewIfNeeded();
    for (let i = 0; i < 4; i++) {
      await page.locator('.hiw__card').nth(i).click();
      await page.waitForTimeout(6000);
      const hidden = await page.$$eval(`#phone-demo .scene[data-scene="${i}"] .beat`, (bs) => bs.filter((b) => Number(getComputedStyle(b).opacity) < 0.99).length);
      expect(hidden, `step ${i + 1}: some messages never appeared`).toBe(0);
    }
  });

  test('small screens: each step opens its example in place, and closes again', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const cards = page.locator('.hiw__card');
    await expect(cards.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#hiw-example-0')).toBeVisible();
    await page.locator('#how').scrollIntoViewIfNeeded();
    // Bring the step fully into view first. Otherwise the test tool scrolls the page
    // itself before tapping (WebKit does this when a step is cut off at the bottom),
    // which looks like a jump but is not the site moving.
    await cards.nth(2).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const firstTop = (await cards.nth(0).boundingBox()).y;
    await cards.nth(2).click();
    await expect(cards.nth(2)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#hiw-example-2')).toBeVisible();
    expect(Math.abs((await cards.nth(0).boundingBox()).y - firstTop), 'content above the tapped step jumped').toBeLessThan(2);
    await page.locator('#hiw-example-2').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    const hidden = await page.$$eval('#hiw-example-2 .beat', (bs) => bs.filter((b) => Number(getComputedStyle(b).opacity) < 0.99).length);
    expect(hidden, 'opened example stayed blank').toBe(0);
    await cards.nth(2).click();
    await expect(cards.nth(2)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#hiw-example-2')).toBeHidden();
  });

  test('rotating/resizing between layouts keeps a sensible state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.locator('.hiw__card').nth(2).click();
    await page.setViewportSize({ width: 800, height: 1100 });
    await page.waitForTimeout(300);
    await expect(page.locator('.hiw__example:visible')).not.toHaveCount(0);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(300);
    await expect(page.locator('#phone-demo .scene:visible')).toHaveCount(1);
    await expect(page.locator('.hiw__example:visible')).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// Solutions page
// ---------------------------------------------------------------------------
test.describe('solutions page', () => {
  test('"runs on autopilot" panels open on tap and stay open', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch behavior');
    await page.goto('/solutions');
    const panels = page.locator('.runs__panel');
    for (let i = 0; i < await panels.count(); i++) {
      await panels.nth(i).tap();
      await page.waitForTimeout(500);
      await expect(panels.nth(i), `panel ${i + 1} did not stay open after a tap`).toHaveAttribute('aria-expanded', 'true');
      await expect(panels.nth(i).locator('.runs__body > span')).toBeVisible();
    }
  });

  test('"runs on autopilot" panels open on hover and keyboard focus', async ({ page, isMobile, browserName }) => {
    test.skip(isMobile);
    await page.goto('/solutions');
    const p = page.locator('.runs__panel').first();
    await p.hover();
    await expect(p).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.move(0, 0);
    await expect(p).toHaveAttribute('aria-expanded', 'false');
    await p.click(); // a click on an open (hovered) panel must not close it
    await expect(p).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.move(0, 0);
    if (browserName !== 'webkit') {
      // Keyboard: Tab from the element just before the first panel.
      await page.locator('.runs').evaluate((el) => {
        const b = document.createElement('button'); b.id = 'tab-start'; b.textContent = 'start';
        el.parentElement.insertBefore(b, el);
      });
      await page.locator('#tab-start').focus();
      await page.keyboard.press('Tab');
      await expect(p).toBeFocused();
      await expect(p, 'keyboard focus should open the panel').toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Tab');
      await expect(p).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('advisor price slider: keyboard, limits, and math', async ({ page, browserName }) => {
    await page.goto('/solutions');
    const slider = page.locator('#op-slider');
    await slider.scrollIntoViewIfNeeded();
    const read = async () => ({
      per: await page.locator('#op-per').textContent(),
      total: Number((await page.locator('#op-total').textContent()).replace(/[$,]/g, '')),
      count: await page.locator('#op-count').textContent(),
    });
    expect((await read()).count).toBe('60');
    await slider.focus();
    await page.keyboard.press('Home');
    expect(await read()).toEqual({ per: '$8', total: 80, count: '10' });
    await page.keyboard.press('End');
    expect(await read()).toEqual({ per: '$4', total: 2000, count: '500+' });
    // A bigger group must never cost less in total than a smaller one.
    await page.keyboard.press('Home');
    let prev = await read();
    const drops = [];
    for (let i = 0; i < 49; i++) {
      await page.keyboard.press('ArrowRight');
      const cur = await read();
      if (cur.total < prev.total) drops.push(`${prev.count}→${cur.count} people: $${prev.total} → $${cur.total}`);
      prev = cur;
    }
    warnIf(drops, 'advisor slider total drops when people are added');
  });

  test('advisor slider announces people, not just a number', async ({ page }) => {
    await page.goto('/solutions');
    const vt = await page.locator('#op-slider').getAttribute('aria-valuetext');
    if (!/people/.test(vt || '')) warnIf('screen readers hear the number with no unit or price', 'advisor slider label');
  });

  test('book-a-call links point at the booking page', async ({ page }) => {
    await page.goto('/solutions');
    const hrefs = await page.$$eval('a', (as) => as.filter((a) => /book|call/i.test(a.textContent)).map((a) => a.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(h).toBe('https://cal.com/scamprep/partner-call');
  });
});

// ---------------------------------------------------------------------------
// With JavaScript off, nothing is hidden
// ---------------------------------------------------------------------------
test.describe('no JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const path of ['/', '/pricing', '/solutions', '/how-it-works', '/why-it-works']) {
    test(`${path} shows all of its content`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(4000); // CSS-only entrance animations still run without JS
      const hiddenText = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll('main p, main li, main h2, main h3, main .beat, main .runs__body > span, main .hiw__card-teaser > span')) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          let op = 1;
          for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
          if (op < 0.99 && el.textContent.trim()) out.push(el.textContent.trim().slice(0, 50));
        }
        return out;
      });
      expect(hiddenText).toEqual([]);
    });
  }
});
