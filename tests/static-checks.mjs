// Static checks over the built site in dist/. No browser needed.
// Run after `npm run build` (from the repo root): node tests/static-checks.mjs
//
// Covers: build output hygiene, SEO and share tags, links and anchors, HTML
// structure, sitemap/robots, copy rules from ~/ScamPrep/voice.md, product facts,
// pricing math, and page weight. Exits 1 if anything FAILs. WARNs are worth a
// look but do not block a release.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const dist = path.join(repo, 'dist');
const SITE = 'https://getscamprep.com';
const scamprepDir = process.env.SCAMPREP_DIR || path.join(os.homedir(), 'ScamPrep');

const fails = [];
const warns = [];
const fail = (area, msg) => fails.push(`[${area}] ${msg}`);
const warn = (area, msg) => warns.push(`[${area}] ${msg}`);

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/ is missing. Run `npm run build` in the repo root first.');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
const allFiles = walk(dist).map((f) => path.relative(dist, f));
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const publicPath = (f) => {
  const p = '/' + f.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
  return p === '/' ? '/' : p.replace(/\/$/, '');
};
const pages = htmlFiles.map((f) => {
  const html = fs.readFileSync(path.join(dist, f), 'utf8');
  return { file: f, path: publicPath(f), html, $: cheerio.load(html) };
});
const byPath = new Map(pages.map((p) => [p.path, p]));
const NOINDEX_EXPECTED = new Set(['/thanks', '/404']);

// ---------------------------------------------------------------------------
// 1. Build output hygiene
// ---------------------------------------------------------------------------
const EXPECTED_PAGES = ['/', '/about', '/early-access', '/faq', '/how-it-works', '/pricing',
  '/privacy', '/promise', '/solutions', '/terms', '/thanks', '/why-it-works', '/404'];
for (const p of EXPECTED_PAGES) if (!byPath.has(p)) fail('build', `expected page ${p} is missing from dist/`);
for (const p of byPath.keys()) if (!EXPECTED_PAGES.includes(p))
  warn('build', `new page ${p} is not in EXPECTED_PAGES in tests/static-checks.mjs; add it so it gets checked everywhere`);

const strayPatterns = [/\.tgz$/, /\.patch$/, /\.zip$/, /\.map$/, /\.DS_Store$/, /\.bak$/, /~$/, /\.log$/];
for (const f of allFiles) if (strayPatterns.some((r) => r.test(f))) fail('build', `stray file would be published: dist/${f}`);

// Duplicate binary assets (usually leftovers that still get deployed).
const sizes = new Map();
for (const f of allFiles.filter((f) => /\.(png|jpe?g|webp|svg)$/.test(f))) {
  const buf = fs.readFileSync(path.join(dist, f));
  const key = buf.length + ':' + buf.subarray(0, 64).toString('hex') + buf.subarray(-64).toString('hex');
  sizes.set(key, [...(sizes.get(key) || []), f]);
}
for (const group of sizes.values()) if (group.length > 1) warn('build', `identical files published more than once: ${group.join(', ')}`);

// ---------------------------------------------------------------------------
// 2. Per-page structure, SEO and share tags
// ---------------------------------------------------------------------------
const titles = new Map();
const descriptions = new Map();
const pngSize = (file) => {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

for (const pg of pages) {
  const { $, path: p } = pg;
  const A = `page ${p}`;
  const isIndexable = !NOINDEX_EXPECTED.has(p);

  if ($('html').attr('lang') !== 'en') fail(A, '<html lang="en"> missing');
  if (!$('meta[name=viewport]').attr('content')?.includes('width=device-width')) fail(A, 'viewport meta missing');
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test($('meta[name=viewport]').attr('content') || ''))
    fail(A, 'viewport blocks pinch zoom (bad for older readers)');

  const title = $('title').text().trim();
  if (!title) fail(A, 'missing <title>');
  else {
    if (title.length > 60) warn(A, `title is ${title.length} chars (Google truncates around 60): "${title}"`);
    if (!/ScamPrep/.test(title)) fail(A, `title does not mention ScamPrep: "${title}"`);
    if (isIndexable) titles.set(title, [...(titles.get(title) || []), p]);
  }
  const desc = $('meta[name=description]').attr('content')?.trim() || '';
  if (!desc) fail(A, 'missing meta description');
  else {
    if (desc.length < 70 || desc.length > 160) warn(A, `meta description is ${desc.length} chars (aim for 70 to 160)`);
    if (isIndexable) descriptions.set(desc, [...(descriptions.get(desc) || []), p]);
  }

  const robots = $('meta[name=robots]').attr('content') || '';
  if (NOINDEX_EXPECTED.has(p) && p !== '/404' && !/noindex/.test(robots)) fail(A, 'should be noindex but is not');
  if (isIndexable && /noindex/.test(robots)) fail(A, 'is noindex but should be indexable');

  const canonical = $('link[rel=canonical]').attr('href');
  if (p === '/404') {
    if (canonical) fail(A, '404 page should not have a canonical URL');
  } else {
    const want = SITE + (p === '/' ? '/' : p);
    if (canonical !== want) fail(A, `canonical is "${canonical}", expected "${want}"`);
    const ogUrl = $('meta[property="og:url"]').attr('content');
    if (ogUrl !== canonical) fail(A, `og:url "${ogUrl}" does not match canonical`);
  }

  for (const prop of ['og:title', 'og:description', 'og:image', 'og:image:alt', 'og:type', 'og:site_name']) {
    if (!$(`meta[property="${prop}"]`).attr('content')) fail(A, `missing ${prop}`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    if (!$(`meta[name="${name}"]`).attr('content')) fail(A, `missing ${name}`);
  }
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  if (!ogImage.startsWith(SITE + '/')) fail(A, `og:image must be an absolute ${SITE} URL, got "${ogImage}"`);
  else {
    const local = path.join(dist, ogImage.slice(SITE.length + 1));
    if (!fs.existsSync(local)) fail(A, `og:image file not found in dist: ${ogImage}`);
    else {
      const s = pngSize(local);
      const w = Number($('meta[property="og:image:width"]').attr('content'));
      const h = Number($('meta[property="og:image:height"]').attr('content'));
      if (s && (s.w !== w || s.h !== h)) fail(A, `og:image is ${s.w}x${s.h} but tags say ${w}x${h}`);
      if (s && (s.w !== 1200 || s.h !== 630)) warn(A, `og:image is ${s.w}x${s.h}; 1200x630 is the safe size`);
      if (fs.statSync(local).size > 300_000) warn(A, `og:image is ${(fs.statSync(local).size / 1024) | 0} KB; some apps skip previews over 300 KB`);
    }
  }

  $('script[type="application/ld+json"]').each((_, el) => {
    try { JSON.parse($(el).text()); } catch { fail(A, 'JSON-LD block is not valid JSON'); }
  });

  // Structure
  const h1s = $('h1');
  if (h1s.length !== 1) fail(A, `has ${h1s.length} <h1> elements (expected exactly 1)`);
  let last = 0;
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const lvl = Number(el.tagName[1]);
    if (last && lvl > last + 1) fail(A, `heading level skips from h${last} to h${lvl}: "${$(el).text().trim().slice(0, 60)}"`);
    last = lvl;
  });
  const ids = new Map();
  $('[id]').each((_, el) => { const id = $(el).attr('id'); ids.set(id, (ids.get(id) || 0) + 1); });
  for (const [id, n] of ids) if (n > 1) fail(A, `duplicate id="${id}" (${n} times)`);
  $('[aria-controls]').each((_, el) => {
    for (const id of ($(el).attr('aria-controls') || '').split(/\s+/)) if (id && !ids.has(id)) fail(A, `aria-controls points to missing id "${id}"`);
  });
  $('label[for]').each((_, el) => { if (!ids.has($(el).attr('for'))) fail(A, `<label for="${$(el).attr('for')}"> has no matching field`); });
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    if ($(el).attr('alt') === undefined) fail(A, `<img src="${src}"> has no alt attribute`);
    if (!$(el).attr('width') || !$(el).attr('height')) warn(A, `<img src="${src}"> has no width/height (causes layout shift)`);
  });
  $('[tabindex]').each((_, el) => { if (Number($(el).attr('tabindex')) > 0) fail(A, 'positive tabindex breaks keyboard order'); });
  $('a').each((_, el) => {
    const a = $(el);
    const name = (a.text() + (a.attr('aria-label') || '') + a.find('img').attr('alt')).trim();
    if (!name.replace('undefined', '')) fail(A, `link with no accessible name: href="${a.attr('href')}"`);
  });
  $('button').each((_, el) => { if (!($(el).text().trim() || $(el).attr('aria-label'))) fail(A, 'button with no accessible name'); });
  $('form').each((_, el) => {
    const f = $(el);
    if (!/^https:\/\//.test(f.attr('action') || '')) fail(A, `form action is not an https URL: "${f.attr('action')}"`);
    if ((f.attr('method') || '').toUpperCase() !== 'POST') fail(A, 'form method should be POST');
    f.find('input:not([type=hidden]), select, textarea').each((_, inp) => {
      const id = $(inp).attr('id');
      if (!id || !$(`label[for="${id}"]`).length) fail(A, `form field "${$(inp).attr('name')}" has no <label>`);
      if (!$(inp).attr('name')) fail(A, `form field #${id} has no name, so it is never submitted`);
    });
    if ($(f).find('input[type=email]').length && !$(f).find('input[type=email][required]').length)
      fail(A, 'email field is not required');
  });
}
for (const [t, ps] of titles) if (ps.length > 1) fail('seo', `duplicate title "${t}" on ${ps.join(', ')}`);
for (const [d, ps] of descriptions) if (ps.length > 1) fail('seo', `duplicate meta description on ${ps.join(', ')}`);

// ---------------------------------------------------------------------------
// 3. Links and anchors
// ---------------------------------------------------------------------------
const external = new Set();
for (const pg of pages) {
  const { $, path: p } = pg;
  const A = `links ${p}`;
  $('a[href], link[href], img[src], script[src], source[srcset]').each((_, el) => {
    const raw = $(el).attr('href') ?? $(el).attr('src') ?? $(el).attr('srcset');
    if (raw === undefined) return;
    if (el.tagName === 'link' && /preconnect|dns-prefetch/.test($(el).attr('rel') || '')) return;
    const href = raw.trim();
    if (href === '' || href === '#') return fail(A, `empty or "#" link on <${el.tagName}>`);
    if (/^javascript:/i.test(href)) return fail(A, `javascript: link "${href}"`);
    if (/^http:\/\//i.test(href)) fail(A, `insecure http:// URL "${href}"`);
    if (/^mailto:/i.test(href)) {
      if (!/^mailto:[^@\s]+@getscamprep\.com(\?.*)?$/i.test(href)) warn(A, `mailto to a non-ScamPrep address: ${href}`);
      return;
    }
    if (/^tel:/i.test(href)) return;
    if (/^https?:\/\//i.test(href)) {
      const u = new URL(href);
      if (u.hostname === 'getscamprep.com' && el.tagName === 'a') warn(A, `absolute link to own site (use a relative link): ${href}`);
      if (/sprysafe|scamdrill/i.test(u.hostname)) fail(A, `link to retired domain: ${href}`);
      if (u.hostname !== 'getscamprep.com') external.add(href);
      if ($(el).attr('target') === '_blank' && !/noopener/.test($(el).attr('rel') || '')) fail(A, `target=_blank without rel=noopener: ${href}`);
      return;
    }
    const u = new URL(href, SITE + (p === '/' ? '/' : p));
    let target = u.pathname;
    if (target !== '/' && target.endsWith('/')) fail(A, `internal link with trailing slash (redirects): ${href}`);
    if (target.endsWith('.html')) fail(A, `internal link ends in .html (redirects): ${href}`);
    target = target.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const isPage = byPath.has(target);
    const isFile = fs.existsSync(path.join(dist, decodeURIComponent(u.pathname)));
    if (!isPage && !isFile) return fail(A, `broken internal link: ${href}`);
    if (u.hash && isPage) {
      const id = decodeURIComponent(u.hash.slice(1));
      if (!byPath.get(target).$(`[id="${id}"]`).length) fail(A, `anchor ${u.hash} not found on ${target} (from ${href})`);
    }
    if (isPage && u.searchParams.has('plan') && target === '/early-access') {
      if (!['individual', 'couples', 'family'].includes(u.searchParams.get('plan'))) fail(A, `unknown plan in ${href}`);
    }
  });
}
// Every indexable page should be reachable from somewhere other than itself.
for (const pg of pages) {
  if (NOINDEX_EXPECTED.has(pg.path)) continue;
  const linked = pages.some((o) => o !== pg && o.$(`a[href="${pg.path}"], a[href^="${pg.path}#"], a[href^="${pg.path}?"]`).length);
  if (!linked && pg.path !== '/') fail('links', `orphan page: nothing links to ${pg.path}`);
}
fs.writeFileSync(path.join(here, '.external-links.json'), JSON.stringify([...external].sort(), null, 2));

// ---------------------------------------------------------------------------
// 4. Sitemap and robots
// ---------------------------------------------------------------------------
const readIf = (f) => (fs.existsSync(path.join(dist, f)) ? fs.readFileSync(path.join(dist, f), 'utf8') : null);
const robots = readIf('robots.txt');
if (!robots) fail('sitemap', 'robots.txt missing');
else {
  if (/Disallow:\s*\/\s*$/m.test(robots)) fail('sitemap', 'robots.txt blocks the whole site');
  if (!robots.includes(`${SITE}/sitemap-index.xml`)) fail('sitemap', 'robots.txt does not point to the sitemap index');
}
const sIndex = readIf('sitemap-index.xml');
if (!sIndex) fail('sitemap', 'sitemap-index.xml missing');
else {
  const subs = [...sIndex.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const norm = (u) => (u === SITE ? SITE + '/' : u);
  const urls = subs.flatMap((s) => {
    const x = readIf(s.replace(SITE + '/', ''));
    if (!x) { fail('sitemap', `sitemap index points to missing file ${s}`); return []; }
    return [...x.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => norm(m[1]));
  });
  const want = EXPECTED_PAGES.filter((p) => !NOINDEX_EXPECTED.has(p)).map((p) => SITE + (p === '/' ? '/' : p));
  for (const w of want) if (!urls.includes(w)) fail('sitemap', `missing from sitemap: ${w}`);
  for (const u of urls) {
    if (!want.includes(u)) fail('sitemap', `unexpected URL in sitemap (noindex, redirect, or wrong form): ${u}`);
    if (/\.html$|.\/$/.test(u.replace(SITE + '/', 'x'))) fail('sitemap', `non-canonical URL form in sitemap: ${u}`);
  }
}
const redirectsFile = readIf('_redirects');
if (redirectsFile) {
  for (const line of redirectsFile.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [from, to, code] = t.split(/\s+/);
    if (!from?.startsWith('/') || !to || !['301', '302', '307', '308', undefined].includes(code)) fail('redirects', `malformed rule: "${t}"`);
    else if (to.startsWith('/') && !byPath.has(to.split(/[?#]/)[0])) fail('redirects', `rule points to a page that does not exist: "${t}"`);
    else if (byPath.has(from.replace(/\/(index\.html)?$/, '') || '/')) fail('redirects', `rule shadows a real page: "${t}"`);
  }
}

// ---------------------------------------------------------------------------
// 5. Copy rules (voice.md is the single source; read it live)
// ---------------------------------------------------------------------------
let banned = [];
const voicePath = path.join(scamprepDir, 'voice.md');
if (fs.existsSync(voicePath)) {
  const voice = fs.readFileSync(voicePath, 'utf8');
  const line = voice.split('\n').find((l, i, arr) => arr[i - 2]?.startsWith('## Banned AI-speak'))
    || voice.split('## Banned AI-speak')[1]?.split('\n').find((l) => l.includes('·'));
  banned = (line || '').split('·').map((s) => s.trim()).filter(Boolean);
} else {
  warn('copy', `could not read ${voicePath}; using the built-in fallback banned list. Set SCAMPREP_DIR to fix.`);
}
if (!banned.length) banned = ['delve', 'elevate', 'unlock', 'unleash', 'empower', 'supercharge', 'seamless', 'effortless',
  'robust', 'streamline', 'leverage (as a verb)', 'navigate (metaphorically)', 'landscape (metaphorically)', 'journey',
  'game-changer', 'revolutionize', 'transform', 'cutting-edge', 'state-of-the-art', 'best-in-class', 'world-class',
  'next-level', 'dive in / deep dive (in copy)', '"peace of mind" as a standalone claim'];
// Turn voice.md entries into regexes. Words get stems (transform -> transforms, transformative).
const bannedRules = banned.flatMap((entry) => {
  const quoted = entry.match(/"([^"]+)"/);
  const base = (quoted ? quoted[1] : entry.replace(/\(.*?\)/g, '')).trim();
  return base.split('/').map((s) => s.trim()).filter(Boolean).map((phrase) => {
    const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/X|A|B/g, '\\w+').replace(/\s+/g, '\\s+');
    const stem = /^[a-z-]+$/i.test(phrase) ? esc.replace(/e$/, '') + '\\w*' : esc;
    return { entry, re: new RegExp(`\\b${stem}\\b`, 'i') };
  });
});

// Locked facts and retired language (from voice.md, 00_CONTEXT.md and AGENTS.md).
const factRules = [
  { re: /—/, msg: 'em dash (voice.md bans them; use a period, comma, or parentheses)' },
  { re: /\b(Spry|ScamDrill|SprySafe)\b/, msg: 'retired product name' },
  { re: /(our|ScamPrep['’]?s?|Bryce[^.]{0,30}),?\s+CEO|CEO,?\s+Bryce|Founder\s*(and|&)\s*CEO|\bCEO\s*(and|&)\s*Founder/i, msg: 'Bryce is "Founder", never "CEO"' },
  { re: /monthly (resilience )?report|report card/i, msg: 'the Resilience Report is quarterly and never a "report card"' },
  { re: /free trial|\btrial\b|14-day/i, msg: 'there is no free trial (removed Oct 5, 2026)' },
  { re: /Practice over pamphlets/i, msg: 'retired tagline (now "Pamphlets fade. Practice sticks.")' },
  { re: /^\s*fall\b|\bfall\s+(resilience|report|quarter|season)|(resilience|report)[^.]{0,20}\bfall\b/i, msg: 'voice.md: name reports for the season and say "autumn", never "fall"' },
  { re: /act now|limited time|don't wait|hurry/i, msg: 'fake urgency' },
  { re: /trusted by|the leading|thousands of (families|customers|users)/i, msg: 'unsupported social proof (pre-launch)' },
  { re: /^(?!.*\b(no|never|not|can['’]?t|cannot|nobody|no one)\b).*(guarantee[sd]? (protection|you won't|safety)|never be scammed|scam-?proof)/i, msg: 'implied guarantee of fraud prevention' },
  { re: /power of attorney/i, msg: 'check: consent can never come through power of attorney' },
  { re: /up to 15|free,? 90[- ]day|90[- ]day free/i, msg: 'internal advisor pilot terms must never be published' },
  { re: /spoof(ed|ing)? (number|caller)|caller ?ID spoof/i, msg: 'locked position: drills never falsify caller ID; do not show a ScamPrep drill as spoofed' },
  { re: /not just \w+[^.]{0,40}but/i, msg: 'banned rhythm: "not just X, but Y"' },
  { re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2705\u2714]/u, msg: 'emoji or checkmark character' },
];
const ACRONYMS = new Set(['USPS', 'IRS', 'FBI', 'FTC', 'IC3', 'AARP', 'NORC', 'PNAS', 'YES', 'CRM', 'SEC', 'RIA', 'LLC', 'URL', 'FAQ', 'AI', 'SMS', 'PDF', 'USA', 'US', 'OTP', 'PIN', 'ID', 'NYC', 'SSA', 'TCPA', 'AUM', 'AAA', 'CEO', 'COO', 'IRA', 'IT']);

const visibleText = ($) => {
  const c = $.root().clone();
  const $$ = cheerio.load(c.html());
  $$('script, style, template, svg title').remove();
  const out = [];
  out.push(['title', $$('title').text()]);
  out.push(['meta description', $$('meta[name=description]').attr('content') || '']);
  $$('meta[property^="og:"], meta[name^="twitter:"]').each((_, el) => {
    const k = $$(el).attr('property') || $$(el).attr('name');
    if (/title|description|alt/.test(k)) out.push([k, $$(el).attr('content') || '']);
  });
  $$('[alt]').each((_, el) => out.push(['alt text', $$(el).attr('alt')]));
  $$('[aria-label]').each((_, el) => out.push(['aria-label', $$(el).attr('aria-label')]));
  $$('[title]').each((_, el) => out.push(['title attr', $$(el).attr('title')]));
  $$('[data-annual], [data-monthly]').each((_, el) => {
    out.push(['data-annual', $$(el).attr('data-annual') || '']);
    out.push(['data-monthly', $$(el).attr('data-monthly') || '']);
  });
  $$('head').remove();
  $$('br').replaceWith(' ');
  $$('p, li, h1, h2, h3, h4, h5, h6, td, th, dt, dd, summary, button, label, figcaption, blockquote, div, span, a, option, strong, em').each((_, el) => {
    // Only the element's own text nodes, so nothing is counted twice.
    const own = $$(el).contents().filter((_, n) => n.type === 'text').text().replace(/\s+/g, ' ').trim();
    if (own) out.push([el.tagName, own]);
  });
  return out;
};

const PAGES_FOR_COPY = pages.filter((p) => !['/privacy', '/terms'].includes(p.path));
for (const pg of pages) {
  const texts = visibleText(pg.$);
  const legal = ['/privacy', '/terms'].includes(pg.path);
  let bangs = 0;
  const seen = new Set();
  for (const [where, t] of texts) {
    if (!t) continue;
    const key = where + '|' + t;
    if (seen.has(key)) continue;
    seen.add(key);
    const snippet = (re) => { const m = t.match(re); const i = Math.max(0, (m?.index ?? 0) - 40); return '…' + t.slice(i, i + 110) + '…'; };
    for (const r of factRules) {
      if (legal && /trial|fall|power of attorney|guarantee/.test(r.msg)) continue;
      if (legal && /em dash/.test(r.msg)) { if (r.re.test(t)) warn(`copy ${pg.path}`, `legacy ${r.msg} (${where}): "${snippet(r.re)}". AGENTS.md: fix when the line is next edited`); continue; }
      if (r.re.test(t)) fail(`copy ${pg.path}`, `${r.msg} (${where}): "${snippet(r.re)}"`);
    }
    if (!legal) for (const b of bannedRules) if (b.re.test(t)) fail(`copy ${pg.path}`, `banned word from voice.md "${b.entry}" (${where}): "${snippet(b.re)}"`);
    if (!legal && /\bsharp(er|est)?\b/i.test(t)) warn(`copy ${pg.path}`, `voice.md says avoid "sharp/sharper" (patronizing); check this use (${where}): "${snippet(/sharp/i)}"`);
    if (!legal && /\bfall\b(?!\s+(for|behind|through|victim|prey|into|short|apart))/i.test(t) && !/^\s*fall\b|resilience|report/i.test(t)) warn(`copy ${pg.path}`, `"fall" as a season (voice.md prefers "autumn"); also a date promise to recheck (${where}): "${snippet(/fall/i)}"`);
    bangs += (t.match(/!/g) || []).length;
    if (!legal) for (const w of t.match(/\b[A-Z]{3,}\b/g) || []) if (!ACRONYMS.has(w)) warn(`copy ${pg.path}`, `ALL CAPS word "${w}" (${where}); voice.md bans caps for emphasis`);
    if (/^h[1-3]$/.test(where)) {
      const words = t.replace(/[^\w\s'’-]/g, '').split(/\s+/).slice(1).filter((w) => w.length > 3);
      const caps = words.filter((w) => /^[A-Z][a-z]/.test(w) && !/^(ScamPrep|Resilience|Report|Mary|Michael|USPS|IRS|FBI|Fortune|Bryce|Google|Bain|Sawtooth|Technologies)$/.test(w));
      if (words.length >= 3 && caps.length / words.length > 0.5) fail(`copy ${pg.path}`, `heading looks Title Case, use sentence case: "${t}"`);
      if (/^(Worried|Concerned|Afraid|Scared|Tired)\b.*\?$/.test(t)) fail(`copy ${pg.path}`, `headline-question opener: "${t}"`);
    }
  }
  if (bangs > 1) fail(`copy ${pg.path}`, `${bangs} exclamation points (voice.md: one per surface maximum)`);
}

// Product facts that must hold on specific pages.
const textOf = (p) => byPath.get(p)?.$('body').text().replace(/\s+/g, ' ') || '';
const all = PAGES_FOR_COPY.map((p) => textOf(p.path)).join(' ');
if (!/Pamphlets fade\. Practice sticks\./.test(all)) fail('facts', 'tagline "Pamphlets fade. Practice sticks." not found');
if (!/You invite, they opt in/i.test(textOf('/'))) warn('facts', 'homepage does not say "You invite, they opt in."');
if (!/4(–|-| to )6/.test(textOf('/'))) fail('facts', 'homepage does not say how often drills arrive (4 to 6 a month)');
if (!/quarterly|every three months/i.test(textOf('/'))) fail('facts', 'homepage does not say the Resilience Report is quarterly');
for (const pg of pages) {
  const body = pg.$('body');
  const hasPhone = body.find('.phone, .report, .drill-card').length;
  if (hasPhone && !/Illustrative|Simulated|Example practice simulation/i.test(body.text()))
    fail(`facts ${pg.path}`, 'simulated artifact on page without an "Illustrative" or "Simulated" label');
  const hasStat = /\b\d{1,3}%|\$\d+(\.\d+)?\s?(k|billion|B|million|M)\b/.test(body.find('main').text());
  if (hasStat && !body.find('main a[href^="http"]').length) fail(`facts ${pg.path}`, 'page shows statistics but links to no source');
}

// ---------------------------------------------------------------------------
// 6. Pricing math (the page is the source; the claims around it must agree)
// ---------------------------------------------------------------------------
const pricing = byPath.get('/pricing');
if (pricing) {
  const $ = pricing.$;
  const money = (s) => Number(String(s).replace(/[^0-9.]/g, ''));
  const cards = $('.price-card').toArray().map((c) => ({
    name: $(c).find('h2').text().trim(),
    annualPerMonth: money($(c).find('.price-card__num').attr('data-annual')),
    monthly: money($(c).find('.price-card__num').attr('data-monthly')),
    annualTotal: money($(c).find('.price-card__billing').attr('data-annual')),
    href: $(c).find('[data-checkout]').attr('href'),
  }));
  const expected = { Individual: [9, 12, 108], Pairs: [15, 20, 180], Family: [19, 25, 228] };
  for (const c of cards) {
    const e = expected[c.name];
    if (!e) { fail('pricing', `unexpected plan card "${c.name}"`); continue; }
    if (c.annualPerMonth !== e[0] || c.monthly !== e[1] || c.annualTotal !== e[2])
      fail('pricing', `${c.name} shows $${c.annualPerMonth}/$${c.monthly}/$${c.annualTotal}, SITE-OPS.md says $${e[0]}/$${e[1]}/$${e[2]}. Update one of them.`);
    if (c.annualPerMonth * 12 !== c.annualTotal) fail('pricing', `${c.name}: $${c.annualPerMonth}/mo x 12 = $${c.annualPerMonth * 12}, but the card says $${c.annualTotal}/year`);
    const note = $('.billing-note').text();
    const m = note.match(/(\d+) months? free/);
    if (m) {
      const freeMonths = (c.monthly * 12 - c.annualTotal) / c.monthly;
      if (Math.abs(freeMonths - Number(m[1])) > 0.01)
        fail('pricing', `"${note.trim()}" is not true for ${c.name}: annual saves $${c.monthly * 12 - c.annualTotal}, which is ${freeMonths.toFixed(2)} months of the $${c.monthly} monthly price`);
    }
  }
  if (cards.length !== 3) fail('pricing', `expected 3 family plan cards, found ${cards.length}`);
}
// Every price mentioned anywhere must be one of the real ones.
const realPrices = new Set(['$9', '$12', '$15', '$19', '$20', '$25', '$108', '$180', '$228', '$4', '$8', '$7.50', '$450', '$1.95', '$38k']);
for (const pg of PAGES_FOR_COPY) {
  for (const m of textOf(pg.path).matchAll(/\$\d[\d,]*(\.\d+)?(\s?(k|billion|million|trillion|B|M)\b)?/gi)) {
    if (m[2]) continue; // a statistic, not a price
    if (!realPrices.has(m[0])) warn(`pricing ${pg.path}`, `price ${m[0]} is not a known plan price; confirm it is correct`);
  }
}

// Org pricing curve from components/OrgPricing.astro: the total must never drop as people are added.
const orgSrc = fs.readFileSync(path.join(repo, 'src/components/OrgPricing.astro'), 'utf8');
if (/8 - \(\(p - 10\) \/ \(500 - 10\)\) \* \(8 - 4\)/.test(orgSrc) && /Math\.round\(raw \* 2\) \/ 2/.test(orgSrc)) {
  const per = (n) => Math.round((8 - ((Math.max(10, Math.min(500, n)) - 10) / 490) * 4) * 2) / 2;
  const drops = [];
  for (let n = 20; n <= 500; n += 10) if (per(n) * n < per(n - 10) * (n - 10)) drops.push(`${n - 10}→${n} people: $${per(n - 10) * (n - 10)} → $${per(n) * n}`);
  if (drops.length) fail('pricing', `advisor slider: monthly total goes DOWN when people are added (${drops.length} places), e.g. ${drops.slice(0, 3).join('; ')}`);
} else warn('pricing', 'OrgPricing formula changed; update the monotonic-total check in static-checks.mjs');

// ---------------------------------------------------------------------------
// 7. Page weight
// ---------------------------------------------------------------------------
for (const pg of pages) {
  let bytes = Buffer.byteLength(pg.html);
  pg.$('link[rel=stylesheet][href^="/"], script[src^="/"], img[src^="/"]').each((_, el) => {
    const f = path.join(dist, (pg.$(el).attr('href') || pg.$(el).attr('src')).split('?')[0]);
    if (fs.existsSync(f)) bytes += fs.statSync(f).size;
  });
  if (bytes > 600_000) fail(`weight ${pg.path}`, `${(bytes / 1024) | 0} KB of local HTML/CSS/JS/images (budget 600 KB)`);
  else if (bytes > 300_000) warn(`weight ${pg.path}`, `${(bytes / 1024) | 0} KB of local HTML/CSS/JS/images`);
}
for (const f of allFiles.filter((f) => /\.(png|jpe?g|webp)$/.test(f))) {
  const kb = fs.statSync(path.join(dist, f)).size / 1024;
  if (kb > 250 && !/og/.test(f)) warn('weight', `${f} is ${kb | 0} KB`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const uniq = (a) => [...new Set(a)];
const F = uniq(fails), W = uniq(warns);
console.log(`\nStatic checks: ${pages.length} pages, ${allFiles.length} files, ${external.size} external links (saved to tests/.external-links.json)`);
if (W.length) { console.log(`\nWARN (${W.length})`); W.forEach((w) => console.log('  ! ' + w)); }
if (F.length) { console.log(`\nFAIL (${F.length})`); F.forEach((f) => console.log('  x ' + f)); }
console.log(F.length ? `\n${F.length} failure(s).` : '\nAll static checks passed.');
process.exit(F.length ? 1 : 0);
