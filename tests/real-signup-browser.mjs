// One REAL signup through the website in a real browser, to check signup attribution
// end to end before a release. Unlike `live-checks.mjs --real-signup`, which posts
// straight to Formspree, this runs the site's own tracking code.
//
//   LIVE_URL=https://<branch>.sprysafe-site.pages.dev npm run test:real-signup -- you@example.com
//   npm run test:real-signup -- you@example.com           # production
//
// The browser arrives from Google on /how-it-works with a campaign tag unique to this
// run, clicks Pricing, picks the Couples plan and submits the form for real. The script
// checks what the browser sent and prints the run ID. Then search the inbox at
// hello@getscamprep.com for that run ID, compare the email with the expected lines,
// and delete the test signup in Formspree. Exits 1 if anything does not match.
import { chromium } from '@playwright/test';

const BASE = (process.env.LIVE_URL || 'https://getscamprep.com').replace(/\/$/, '');
const email = process.argv[2];
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) {
  console.error('Usage: npm run test:real-signup -- you@example.com   (set LIVE_URL for a preview)');
  process.exit(2);
}
const run = 'release-' + new Date().toISOString().replace(/\D/g, '').slice(0, 14);
const expected = {
  plan: 'couples',
  landing_page: '/how-it-works',
  referrer: 'https://www.google.com/', // Google sends only its site address
  utm_source: 'release-check',
  utm_campaign: run,
  previous_page: '/pricing',
};

const fieldsOf = (body) => {
  const out = {};
  for (const m of (body || '').matchAll(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n--/g)) out[m[1]] = m[2];
  return out;
};

const problems = [];
let fields = {};
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let body = null;
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.url().startsWith('https://formspree.io/')) body = req.postData();
  });
  await page.goto(`${BASE}/how-it-works?utm_source=${expected.utm_source}&utm_campaign=${run}`, { referer: expected.referrer });
  await page.locator('#site-nav').getByRole('link', { name: 'Pricing', exact: true }).click();
  await page.waitForURL(/\/pricing$/);
  await page.locator('.price-card [data-checkout]').nth(1).click();
  await page.waitForURL(/\/early-access\?plan=couples$/);
  await page.fill('#name', `ScamPrep release check ${run} (delete me)`);
  await page.fill('#email', email);
  await page.selectOption('#role', 'Other');
  await page.fill('#worry', `Automated attribution check ${run}. Safe to delete.`);
  await page.locator('form.form-card button[type=submit]').click();
  await page.waitForURL(/\/thanks$/, { timeout: 40_000 });
  fields = fieldsOf(body);
  for (const [k, v] of Object.entries(expected)) if (fields[k] !== v) problems.push(`${k}: sent "${fields[k] ?? ''}", expected "${v}"`);
  for (const k of Object.keys(fields)) if (k.startsWith('latest_')) problems.push(`unexpected ${k}: "${fields[k]}"`);
} catch (e) {
  problems.push(`signup did not complete: ${e.message.split('\n')[0]}`);
} finally {
  await browser.close();
}

console.log(`\nReal browser signup against ${BASE}`);
console.log(`Run ID: ${run}`);
if (Object.keys(fields).length) {
  console.log('\nThe browser sent:');
  for (const [k, v] of Object.entries(fields)) console.log(`  ${k}: ${v}`);
}
if (problems.length) {
  console.log(`\nFAIL (${problems.length})`);
  problems.forEach((p) => console.log('  x ' + p));
  process.exit(1);
}
console.log(`\nSent and confirmed by the site. Now search hello@getscamprep.com for "${run}".`);
console.log('Within 5 minutes, not in spam, the email should show:');
for (const [k, v] of Object.entries(expected)) console.log(`  ${k}: ${v}`);
console.log('and no latest_ lines. Then delete the test signup in Formspree.');
