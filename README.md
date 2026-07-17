# Spry marketing site

Built with [Astro](https://astro.build) — a static site, no database, no server. Live at
**https://sprysafe.com**.

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

## Copy & naming conventions

- The monthly report is the **"Resilience Report"** — never "report card" (teacherly, wrong
  power dynamic). The sample component file is still named `ReportCard.astro` internally.
- Family-facing copy says **"the person you care about"** — not "your parent," "Mom," or
  "grandparent." (B2B pages may name audiences like "older adults" or "members" factually.)
- Core positioning: **practice beats lecture** — simulated drills + coaching at the moment
  they slip, married to a drip of always-current scam briefings. One-time education fades;
  practice sticks.
- Pricing: Individual $9/mo billed annually ($12 monthly) · Two people $15/mo billed annually
  ($20 monthly) · 14-day free trial · 60-day money-back guarantee · businesses $4–8/person/mo.

## Before charging real customers — remaining checklist

- [ ] **Waitlist form:** replace `YOUR_FORM_ID` in `src/pages/early-access.astro` with a real
      Formspree (or Tally) endpoint — submissions don't arrive until this is done.
- [ ] **Booking link:** "Book a 20-minute call" buttons open a pre-filled email; swap the
      `mailto:hello@` hrefs for a Cal.com/Calendly link when available.
- [ ] **Privacy & Terms:** `src/pages/privacy.astro` and `terms.astro` are labeled DRAFT —
      have an attorney review.
- [ ] **Analytics (optional):** paste a Plausible/Fathom script tag into
      `src/layouts/Base.astro` `<head>`.

## Editing map

- **Copy lives in the pages:** `src/pages/*.astro` — plain HTML; edit and push.
- **FAQ answers:** all in one file, `src/data/faqs.js` (`homeFaqs` picks the homepage subset).
- **Colors & fonts:** design tokens at the top of `src/styles/global.css`.
- **Sample Resilience Report:** `src/components/ReportCard.astro` — real HTML/CSS so it can
  become the actual product template later.
- **Header/footer/nav/SEO:** `src/layouts/Base.astro`.
- **Interactive bits on the homepage** (stat count-up, how-it-works tiles) and the pricing
  toggle are small vanilla-JS `<script>` blocks at the bottom of `index.astro` /
  `pricing.astro` — all progressively enhanced (the site works with JS off).

## Structure

```
src/
├── layouts/Base.astro          header, footer, SEO, fonts
├── components/
│   ├── ReportCard.astro        sample Resilience Report (the hero artifact)
│   ├── CtaBand.astro           reusable bottom call-to-action
│   └── Faq.astro               accordion renderer
├── data/faqs.js                all FAQ copy
├── styles/global.css           the whole design system
└── pages/                      one file per page, incl. solutions/
    └── solutions/              senior-living, home-care, financial-advisors, credit-unions
```
