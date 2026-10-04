# ScamPrep marketing site

Built with [Astro](https://astro.build) — a static site, no database, no server. Live at
**https://getscamprep.com** (sprysafe.com 301-redirects here).

> **Naming, as of August 2026:** the product is **ScamPrep** and the domain is
> **getscamprep.com**. The GitHub repo, Cloudflare Pages project, and local folder are still
> named `sprysafe-site` — that's deliberate (renaming them buys nothing and risks breaking the
> deploy hook). Keep sprysafe.com registered: it serves the 301s and still receives email.

## How the site runs

- **Code lives here:** `~/Documents/sprysafe-site` — this folder IS the git repository.
  `node_modules/`, `dist/` and `.astro/` are build output and are git-ignored; after a fresh
  clone or pull, run `npm ci` once to reinstall packages.
- **GitHub:** https://github.com/sawtoothtechnologies/sprysafe-site (private). GitHub is the
  source of truth for deploys.
- **Hosting/deploy:** Cloudflare Pages, connected to the GitHub repo. Cloudflare installs
  packages and builds (`npm run build`, output `dist/`, root directory = repo root) on every
  push. A push to `main` deploys to getscamprep.com within a minute or two; a push to any
  other branch builds a private preview at its own `*.sprysafe-site.pages.dev` address
  (marked `noindex`, so search engines skip it).
- **Auth:** the GitHub personal access token is saved in the macOS keychain
  (`credential.helper osxkeychain`) — pushes won't prompt for credentials.

## How to update the live site

Never edit `main` directly. Make each change on a branch, check its preview, then merge.

1. **Branch and edit.** Ask Claude Code to make the change on a new branch and open a pull
   request, or by hand:
   ```
   cd ~/Documents/sprysafe-site
   git switch main && git pull
   git switch -c describe-the-change
   # ...edit files...
   git add -- path/to/each/changed/file
   git commit -m "describe what changed"
   git push -u origin describe-the-change
   ```
   Stage files by name rather than `git add .`, so stray local files never ride along.
2. **Preview.** Cloudflare builds the branch in a minute or two. The preview link appears on
   the commit or pull request on GitHub (the "Cloudflare Pages" check) and under Workers &
   Pages → sprysafe-site → Deployments. Each later push to the branch updates it.
3. **Publish.** Merge the pull request on GitHub. That push to `main` is the only step that
   changes getscamprep.com. Then `git switch main && git pull` on your Mac.

If the live site looks unchanged afterward, hard-refresh (Cmd+Shift+R) — it's usually browser
cache.

A green ✓ next to the commit on GitHub = Cloudflare build succeeded. A red ✗ = build failed;
check Workers & Pages → sprysafe-site → Deployments in the Cloudflare dashboard for the log.
(A failed build never takes the site down — it keeps serving the last good deploy.)

**Undo a bad deploy:** Workers & Pages → sprysafe-site → Deployments → the previous production
deployment → Rollback. It takes effect instantly; then fix or revert the commit on `main`.

**Quick local preview** while editing: `npm run dev` → http://localhost:4321 (updates as you
save; nothing is published).

## Design system

**"Signal · Amber" v1.0** — warm near-black ink, radar amber, Manrope, 9px controls, three
graphic motifs (radar = state, ping = event, trace = data). It replaced "Evergreen Modern"
(pine green / Plus Jakarta Sans / pill buttons) in August 2026.

- Tokens and usage rules: **`brand/TOKENS.md`** — read this before changing colors or type.
- Implementation: `src/styles/global.css`. Old Evergreen variable names survive as aliases;
  `brand/TOKENS.md` explains which ones changed meaning and must not be blind-swapped.
- Logo, favicon, OG image: `brand/` and `public/`.

## Copy & naming conventions

- The product is **ScamPrep**. Never "Spry" in customer-facing copy.
- The monthly report is the **"Resilience Report"** — never "report card" (teacherly, wrong
  power dynamic). The sample component file is still named `ReportCard.astro` internally.
- Family-facing copy says **"the person you care about"** — not "your parent," "Mom," or
  "grandparent." (B2B pages may name audiences like "older adults" or "members" factually.)
- The primary CTA is **"Start your free trial"** everywhere. ("Get early access" is retired.)
- Core positioning: **practice beats lecture** — simulated drills + coaching at the moment
  they slip, married to a drip of always-current scam briefings. One-time education fades;
  practice sticks.
- Every simulated artifact on the site is labeled — "Illustrative report", "Simulated".

## Pricing — one source of truth

Three plans, all with a 14-day free trial and a 60-day money-back guarantee:

| Plan | Annual (shown as) | Monthly |
| --- | --- | --- |
| Individual — one person | $108/yr ($9/mo) | $12/mo |
| Couples & pairs — up to two | $180/yr ($15/mo) | $20/mo |
| Family — up to four | $228/yr ($19/mo) | $25/mo |

Organizations: $4–8/person/mo depending on volume.

These numbers appear in `src/pages/pricing.astro`, `src/data/checkout.js`, and
`STRIPE-SETUP.md`. **Change all four places together** (this README included).

## Before charging real customers — remaining checklist

- [ ] **Waitlist form:** replace `YOUR_FORM_ID` in `src/pages/early-access.astro` with a real
      Formspree (or Tally) endpoint — submissions don't arrive until this is done.
- [ ] **Stripe payment links:** paste the six URLs into `src/data/checkout.js` (see
      `STRIPE-SETUP.md`). Until then, "Start free trial" falls back to `/early-access`.
- [ ] **Booking link:** "Book a 20-minute call" buttons open a pre-filled email; swap the
      `mailto:hello@` hrefs for a Cal.com/Calendly link when available.
- [ ] **Privacy & Terms:** `src/pages/privacy.astro` and `terms.astro` are labeled DRAFT —
      have an attorney review.
- [ ] **Analytics:** paste a Plausible/Fathom script tag into `src/layouts/Base.astro` `<head>`.
      Without it there is no way to tell whether the rebrand moved conversion.
- [x] **Sitemap + robots.txt:** `@astrojs/sitemap` generates `/sitemap-index.xml` on build; `public/robots.txt` points to it. Submit it in Google Search Console.

## The old domain (sprysafe.com)

Moved August 2026. sprysafe.com stays registered and active in Cloudflare for two jobs:
a zone-level 301 redirect rule (`https://*sprysafe.com/* → https://getscamprep.com/$2`) and
MX records so hello@sprysafe.com keeps receiving. Don't delete the zone or let the domain
lapse — for a fraud-prevention brand, a lapsed old domain is a phishing gift.

## Editing map

- **Copy lives in the pages:** `src/pages/*.astro` — plain HTML; edit and push.
- **FAQ answers:** all in one file, `src/data/faqs.js` (`homeFaqs` picks the homepage subset).
- **Colors & fonts:** design tokens at the top of `src/styles/global.css`; rules in `brand/TOKENS.md`.
- **Sample Resilience Report:** `src/components/ReportCard.astro` — real HTML/CSS so it can
  become the actual product template later. Takes `variant="full|trimmed"` and `tone="dark|light"`.
- **Header/footer/nav/SEO:** `src/layouts/Base.astro` (also sets OG/Twitter tags and canonical).
- **Interactive bits on the homepage** (stat count-up, motif animations, how-it-works tiles) and
  the pricing toggle are small vanilla-JS `<script>` blocks at the bottom of `index.astro` /
  `pricing.astro` — all progressively enhanced (the site works with JS off, and all motion
  respects `prefers-reduced-motion`).

## Structure

```
brand/                          design system source of truth
├── TOKENS.md                   colors, type, motifs, usage rules, known deviations
├── logo-ink.svg                radar mark for light backgrounds
└── logo-on-dark.svg            radar mark for ink backgrounds
public/                         favicon.svg · apple-touch-icon.png · og.png
src/
├── layouts/Base.astro          header, footer, SEO, fonts
├── components/
│   ├── ReportCard.astro        sample Resilience Report (the hero artifact)
│   ├── PhoneDemo.astro         animated drill walkthrough
│   ├── CtaBand.astro           reusable bottom call-to-action
│   ├── OrgPricing.astro        organization pricing slider
│   └── Faq.astro               accordion renderer
├── data/faqs.js                all FAQ copy
├── data/checkout.js            Stripe payment links
├── styles/global.css           the whole design system
└── pages/                      one file per page; 404.astro is the not-found page
    └── solutions/index.astro   /solutions (old audience pages 301 here via public/_redirects)
```
