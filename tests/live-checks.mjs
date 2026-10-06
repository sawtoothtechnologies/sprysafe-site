// Checks the LIVE site (or a branch preview) from the outside: what visitors,
// Google, link previews and email actually get. Run after every publish.
//   node live-checks.mjs                                  # production
//   LIVE_URL=https://<branch>.sprysafe-site.pages.dev node live-checks.mjs   # a preview
//   node live-checks.mjs --real-signup you@example.com    # also sends ONE real test signup
// Needs internet. Exits 1 on any FAIL.
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import { pageSignature, formEndpointStatus } from './live-evidence.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.LIVE_URL || 'https://getscamprep.com').replace(/\/$/, '');
const PROD = BASE === 'https://getscamprep.com';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const PAGES = ['/', '/how-it-works', '/why-it-works', '/pricing', '/solutions', '/about', '/promise', '/faq', '/early-access', '/thanks', '/privacy', '/terms'];

const fails = [], warns = [], passes = [];
const fail = (m) => fails.push(m), warn = (m) => warns.push(m), pass = (m) => passes.push(m);
const get = async (url, opts = {}) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try { return await fetch(url, { redirect: 'manual', headers: { 'user-agent': UA }, signal: ctl.signal, ...opts }); }
  finally { clearTimeout(t); }
};
const expectRedirect = async (from, to, label) => {
  try {
    const r = await get(from);
    const loc = r.headers.get('location') || '';
    const abs = loc ? new URL(loc, from).href : '';
    if (![301, 308].includes(r.status)) fail(`${label}: ${from} returned ${r.status}${loc ? ' -> ' + loc : ''} (want a permanent 301/308 to ${to})`);
    else if (abs.replace(/\/$/, '') !== to.replace(/\/$/, '')) fail(`${label}: ${from} redirects to ${abs}, want ${to}`);
    else pass(`${label}: ${from} -> ${abs}`);
  } catch (e) { fail(`${label}: ${from} failed (${e.cause?.code || e.message})`); }
};

// 1. Every page answers 200 and matches the local build (catches stale deploys).
const localHtml = (p) => {
  const f = path.join(here, '..', 'dist', (p === '/' ? 'index' : p.slice(1)) + '.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};
let homeHtml = '';
const localAssets = new Set();
for (const p of PAGES) {
  try {
    const r = await get(BASE + p);
    const html = await r.text();
    if (p === '/') homeHtml = html;
    if (r.status !== 200) { fail(`page ${p}: HTTP ${r.status}`); continue; }
    if (!/text\/html/.test(r.headers.get('content-type') || '')) fail(`page ${p}: content-type ${r.headers.get('content-type')}`);
    const local = localHtml(p);
    if (!local) fail(`page ${p}: local build missing; deployment comparison is unverified`);
    else {
      if (pageSignature(html) !== pageSignature(local)) fail(`page ${p}: deployed content or behavior differs from the local build; verify the intended release and deployed commit`);
      else pass(`page ${p}: authored content and behavior match the local build`);
      const $ = cheerio.load(local);
      $('link[rel="stylesheet"][href^="/"], script[src^="/"], img[src^="/"]').each((_, el) => localAssets.add($(el).attr('href') || $(el).attr('src')));
    }
    pass(`page ${p}: 200`);
  } catch (e) { fail(`page ${p}: ${e.cause?.code || e.message}`); }
}

for (const asset of localAssets) {
  try {
    const file = path.join(here, '..', 'dist', asset.split('?')[0]);
    const r = await get(BASE + asset);
    const hash = (b) => createHash('sha256').update(b).digest('hex');
    if (r.status !== 200 || !fs.existsSync(file) || hash(Buffer.from(await r.arrayBuffer())) !== hash(fs.readFileSync(file))) fail(`asset ${asset}: missing or differs from the local build`);
    else pass(`asset ${asset}: matches the local build`);
  } catch (e) { fail(`asset ${asset}: ${e.message}`); }
}

// 2. One address per page (no duplicate URLs for Google), and a real 404.
await expectRedirect(BASE + '/about.html', BASE + '/about', 'url form');
await expectRedirect(BASE + '/about/', BASE + '/about', 'url form');
await expectRedirect(BASE + '/index.html', BASE + '/', 'url form');
{
  const r = await get(BASE + '/no-such-page-' + Date.now());
  if (r.status !== 404) fail(`unknown URL returns ${r.status}, want 404 (a 200 "soft 404" confuses Google)`);
  else pass('unknown URL returns 404');
}
for (const slug of ['credit-unions', 'financial-advisors', 'home-care', 'senior-living'])
  await expectRedirect(`${BASE}/solutions/${slug}`, `${BASE}/solutions`, 'retired page');

// 3. Domains and HTTPS (production only).
if (PROD) {
  await expectRedirect('http://getscamprep.com/pricing', 'https://getscamprep.com/pricing', 'https');
  await expectRedirect('https://www.getscamprep.com/pricing', 'https://getscamprep.com/pricing', 'www');
  await expectRedirect('https://sprysafe.com/pricing', 'https://getscamprep.com/pricing', 'old domain');
  await expectRedirect('https://www.sprysafe.com/', 'https://getscamprep.com/', 'old domain');
  await new Promise((resolve) => {
    const s = tls.connect(443, 'getscamprep.com', { servername: 'getscamprep.com' }, () => {
      const days = (new Date(s.getPeerCertificate().valid_to) - Date.now()) / 864e5;
      if (days < 14) fail(`TLS certificate expires in ${days.toFixed(0)} days`); else pass(`TLS certificate valid for ${days.toFixed(0)} more days`);
      s.end(); resolve();
    });
    s.on('error', (e) => { fail(`TLS check failed: ${e.message}`); resolve(); });
    s.setTimeout(20000, () => { fail('TLS check timed out'); s.destroy(); resolve(); });
  });
}

// 4. Security and caching headers.
try {
  const r = await get(BASE + '/');
  const h = (k) => r.headers.get(k) || '';
  if (!/max-age=\d{7,}/.test(h('strict-transport-security'))) fail('missing Strict-Transport-Security (HSTS) header');
  if (h('x-content-type-options') !== 'nosniff') fail('missing X-Content-Type-Options: nosniff');
  if (!/^(DENY|SAMEORIGIN)$/i.test(h('x-frame-options')) && !/frame-ancestors\s+'(none|self)'\s*(;|$)/.test(h('content-security-policy'))) fail('framing protection missing or permissive');
  if (!h('referrer-policy')) fail('missing Referrer-Policy header');
  if (!h('permissions-policy')) warn('no Permissions-Policy header');
  if (!h('content-security-policy')) warn('no Content-Security-Policy header');
  else if (!/(script-src|default-src)\s/.test(h('content-security-policy'))) warn('CSP restricts framing only; script injection protection is not configured');
  const css = homeHtml.match(/href="(\/_astro\/[^"]+\.css)"/)?.[1];
  if (css) {
    const c = await get(BASE + css);
    if (!/max-age=(\d{6,})/.test(c.headers.get('cache-control') || '')) warn(`${css} is not cached long-term (cache-control: ${c.headers.get('cache-control')})`);
  }
} catch (e) { fail(`header check failed: ${e.message}`); }

// 5. Crawlers and link previews.
for (const f of ['/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml', '/og-v3.png', '/favicon.svg', '/apple-touch-icon.png']) {
  const r = await get(BASE + f).catch((e) => ({ status: e.message }));
  if (r.status !== 200) fail(`${f}: HTTP ${r.status}`); else pass(`${f}: 200`);
}
{
  const sm = await (await get(BASE + '/sitemap-0.xml')).text().catch(() => '');
  for (const loc of [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])) {
    const url = PROD ? loc : loc.replace('https://getscamprep.com', BASE);
    const r = await get(url);
    if (r.status !== 200) fail(`sitemap URL ${loc} returns ${r.status} (sitemaps must list final 200 URLs)`);
  }
}
const og = homeHtml.match(/property="og:image" content="([^"]+)"/)?.[1];
if (og) {
  const r = await get(og);
  if (r.status !== 200 || !/image\//.test(r.headers.get('content-type') || '')) fail(`share image ${og}: ${r.status} ${r.headers.get('content-type')}`);
}

// 6. Analytics actually present in what visitors receive.
if (PROD) {
  if (!/cloudflareinsights\.com\/beacon/.test(homeHtml)) fail('Cloudflare Web Analytics beacon not found in the live homepage (no visitor data will be recorded)');
  else pass('analytics beacon present');
}

// 7. Third parties the site depends on.
{
  const r = await get('https://formspree.io/f/moeajjvb').catch((e) => ({ status: e.message }));
  const status = formEndpointStatus(r.status);
  if (status === 'missing') fail('Formspree form moeajjvb returns 404: early-access signups would be lost');
  else if (status === 'unverified') fail(`Formspree endpoint could not be verified (${r.status}); do not count this as a signup pass`);
  else pass(`Formspree endpoint reachable (${r.status}); acceptance and inbox delivery still require a real signup`);
}
const extFile = path.join(here, '.external-links.json');
const externals = fs.existsSync(extFile) ? JSON.parse(fs.readFileSync(extFile, 'utf8')) : [];
if (!externals.length) warn('no tests/.external-links.json; run static-checks first to check every outbound link');
for (const u of externals) {
  try {
    let r = await get(u, { redirect: 'follow' });
    if (r.status === 405) r = await get(u, { method: 'GET', redirect: 'follow' });
    const host = new URL(u).hostname;
    if (r.status >= 400) {
      if (/linkedin|facebook|x\.com|twitter/.test(host) && [403, 429, 999].includes(r.status)) warn(`${u}: ${r.status} (social sites block scripts; open it by hand)`);
      // 403, 429 and 999 usually mean the site blocks automated visitors (the FBI and
      // Oxford Academic do), not that the link is broken. Open it by hand to confirm.
      else if ([403, 429, 999].includes(r.status)) warn(`${u}: ${r.status} (likely blocks automated checks; open it by hand)`);
      else fail(`outbound link ${u}: HTTP ${r.status}`);
    } else pass(`outbound link ${u}: ${r.status}`);
  } catch (e) { fail(`outbound link ${u}: ${e.cause?.code || e.message}`); }
}

// 8. Email for hello@getscamprep.com (DNS over HTTPS).
if (PROD) {
  const dns = async (name, type) => (await (await fetch(`https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`, { headers: { accept: 'application/dns-json' } })).json()).Answer || [];
  try {
    const mx = await dns('getscamprep.com', 'MX');
    if (!mx.length) fail('no MX record for getscamprep.com: mail to hello@getscamprep.com bounces'); else pass(`MX: ${mx.map((a) => a.data).join(', ')}`);
    const txt = (await dns('getscamprep.com', 'TXT')).map((a) => a.data);
    if (!txt.some((t) => /v=spf1/.test(t))) warn('no SPF record: replies from hello@ may land in spam');
    const dmarc = (await dns('_dmarc.getscamprep.com', 'TXT')).map((a) => a.data);
    if (!dmarc.some((t) => /v=DMARC1/.test(t))) warn('no DMARC record: replies from hello@ may land in spam');
  } catch (e) { warn(`DNS check failed: ${e.message}`); }
}

// 9. Optional: one real end-to-end signup.
const i = process.argv.indexOf('--real-signup');
if (i > -1) {
  const email = process.argv[i + 1];
  if (!/@/.test(email || '')) fail('--real-signup needs an email address after it');
  else {
    const body = new FormData();
    body.set('name', 'ScamPrep site test (delete me)');
    body.set('email', email);
    body.set('role', 'Other');
    body.set('worry', `Automated live check ${new Date().toISOString()}`);
    const r = await fetch('https://formspree.io/f/moeajjvb', { method: 'POST', body, headers: { accept: 'application/json' } });
    if (!r.ok) fail(`real signup rejected by Formspree: ${r.status} ${await r.text()}`);
    else pass(`real signup accepted. Now confirm it arrived in hello@getscamprep.com within 5 minutes.`);
  }
}

console.log(`\nLive checks against ${BASE}`);
console.log(`PASS (${passes.length})`);
if (process.argv.includes('--verbose')) passes.forEach((p) => console.log('  ✓ ' + p));
if (warns.length) { console.log(`\nWARN (${warns.length})`); warns.forEach((w) => console.log('  ! ' + w)); }
if (fails.length) { console.log(`\nFAIL (${fails.length})`); fails.forEach((f) => console.log('  x ' + f)); }
console.log(fails.length ? `\n${fails.length} failure(s).` : '\nAll live checks passed.');
process.exit(fails.length ? 1 : 0);
