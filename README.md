# ScamPrep marketing site

Built with [Astro](https://astro.build) — a static site, no database, no server. Live at
**https://sprysafe.com**.

> **Naming, as of August 2026:** the product is **ScamPrep**. The domain, email, repo, and
> Cloudflare project are still `sprysafe*` — that's deliberate, not drift. Customer-facing copy
> says ScamPrep; the infrastructure keeps its old names until a domain move is decided.
> See "If the domain moves" below.

## How the site runs

- **Code lives here:** `~/Documents/sprysafe-site` — this folder IS the git repository
  (the repo root is this folder; `git add .` from inside it is safe).
- **GitHub:** https://github.com/sawtoothtechnologies/sprysafe-site (private). GitHub is the
  source of truth for deploys.
- **Hosting/deploy:** Cloudflare Pages, connected to the GitHub repo. Every push to `main`
  triggers an automatic build (`npm run build`, output `dist/`, root directory = repo root)
  and deploys to sprysafe.com within a minute or two.
- **Auth:** the GitHub personal access token is saved in the macOS keychain
  (`credential.helper osxkeychain`) — pushes won't prompt for credentials.

## How to update the live site

```
cd ~/Documents/sprysafe-site
# ...edit files...
git add .
git commit -m "describe what changed"
git push
```

That's it. Cloudflare redeploys automatically on push. If the site looks unchanged in the
browser afterward, hard-refresh (Cmd+Shift+R) — it's usually browser cache.

A green ✓ next to the commit on GitHub = Cloudflare build succeeded. A red ✗ = build failed;
check Workers & Pages → sprysafe-site → Deployments in the Cloudflare dashboard for the log.
(A failed build never takes the site down — it keeps serving the last good deploy.)

To preview locally before pushing: `npm run dev` → http://localhost:4321

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
- [ ] **Sitemap + robots.txt:** not present. `@astrojs/sitemap` is a two-line install.

## If the domain moves

Everything customer-facing already says ScamPrep. A domain change would touch, in this order:
Cloudflare Pages custom domain → `site:` in `astro.config.mjs` → the `hello@` mailto links in
`Base.astro`, `about.astro`, `promise.astro`, `privacy.astro`, `terms.astro`, `thanks.astro`,
`solutions/index.astro`, `OrgPricing.astro` → Stripe payment-link redirect URLs → Google
Workspace email → the GitHub repo name. Set up 301s from the old domain; the pages are indexed.

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
└── pages/                      one file per page, incl. solutions/
    └── solutions/              senior-living, home-care, financial-advisors, credit-unions
```
