# SPRY-SITE-OPS — sprysafe.com infrastructure & edit workflow

> Read this before making any website changes. Last updated: 2026-07-17 (site overhaul v2 + repo restructure).

## The stack (all free except the domain)

| Piece | What/where |
|---|---|
| Live site | **https://sprysafe.com** (+ www) — also at sprysafe-site.pages.dev |
| Code | GitHub repo **sawtoothtechnologies/sprysafe-site** (private) |
| Source of truth | The local `~/Documents/sprysafe-site` folder on Bryce's Mac. **As of 2026-07-17 the folder itself IS the git repo** (repo root = site folder). The zip in this Drive folder is a pre-launch snapshot — do NOT edit the zip. |
| Hosting | Cloudflare Pages, connected to the GitHub repo. Auto-deploys on every push to `main` (~2 min). **Build config: Astro preset, root directory BLANK (repo root).** ⚠️ Historical note: before 2026-07-17 the repo was accidentally rooted in the Mac home directory with the site nested at `Documents/sprysafe-site/`, and the root-directory setting pointed there. That layout is retired — do not restore it. |
| Domain + DNS | Cloudflare (registrar + DNS + HTTPS) |
| Waitlist form | Formspree (free) — endpoint set in `src/pages/early-access.astro` (`FORM_ACTION`) |
| Payments | **Stripe Payment Links** (no backend). Link URLs pasted into `src/data/checkout.js`; pricing buttons fall back to /early-access until then. Post-checkout page: `/thanks`. Full dashboard walkthrough: `SPRY-STRIPE-SETUP.md` in the repo root. |
| Email | hello@sprysafe.com → forwards to hello@sawtoothtechnologies.com via Cloudflare Email Routing (verify it's active) |
| Framework | Astro (static, no server/database). Node + npm to build locally. |

## How to publish any change

1. Edit files in `~/Documents/sprysafe-site` (by hand, with Claude Code, or in a Cowork session with the folder connected)
2. Either:
   - **Terminal:** `cd ~/Documents/sprysafe-site && git add . && git commit -m "summary" && git push` (GitHub token is saved in the macOS keychain — no password prompt), or
   - **GitHub Desktop:** one-line summary → Commit to main → Push origin
3. Cloudflare auto-deploys in ~2 min. Green ✓ on the commit in GitHub = build succeeded. If the browser still shows the old site, hard-refresh (Cmd+Shift+R).
4. Broke something? Cloudflare Pages → Deployments → find last good deploy → **Rollback**. (A failed build never takes the site down — it keeps serving the last good deploy.)

`git add .` from inside the site folder is now safe — the repo can't see anything outside it.

Optional local preview before pushing: `npm run dev` in the folder → localhost:4321.

## Where things live in the code

| To change… | Edit… |
|---|---|
| Page copy | `src/pages/*.astro` (one file per page; solutions pages in `src/pages/solutions/` — senior-living, home-care, financial-advisors, credit-unions) |
| FAQ answers | `src/data/faqs.js` (used by both homepage teaser and /faq; `homeFaqs` picks the homepage subset) |
| Colors, fonts, spacing | tokens at top of `src/styles/global.css` |
| Header, footer, nav, SEO/meta defaults | `src/layouts/Base.astro` |
| Sample Resilience Report mockup | `src/components/ReportCard.astro` (real HTML/CSS — intended to become the actual product template; file keeps its old internal name) |
| Bottom CTA bands | `src/components/CtaBand.astro` |
| Waitlist form + Formspree endpoint | `src/pages/early-access.astro` |
| Stripe checkout links (per plan/billing) | `src/data/checkout.js` |
| Homepage interactions (stat count-up, how-it-works tiles) | `<script>`/`<style>` blocks at the bottom of `src/pages/index.astro` |
| Pricing toggle (families ↔ businesses) | `<script>`/`<style>` blocks in `src/pages/pricing.astro` |

## Copy & positioning (v2 — overhauled 2026-07-17)

- **Hero/positioning: practice beats lecture.** "A pamphlet won't stop the next scam. Practice will." Simulated drills + coaching at the moment they slip, married to a drip of always-current scam briefings. One-time education fades within a month (FTC-review-backed claim); practice sticks.
- **"Resilience Report"** — never "report card" (teacherly; wrong power dynamic). Renamed site-wide 2026-07-17.
- **"The person you care about"** — family-facing copy never says "your parent," "Mom," or "grandparent." (B2B pages may name audiences factually: "older adults," "residents," "members," "clients.")
- **Simplicity promise:** "No apps. No downloads. No logins." — nothing to install, monitor, or troubleshoot.
- **Pricing (changed 2026-07-17):** Individual $9/mo billed annually ($12 monthly) · Two people $15/mo billed annually ($20 monthly) · 14-day free trial ("Start free trial" CTAs) · 60-day money-back guarantee · businesses $4–8/person/mo. **The old "founding families lock $9/mo for life" offer was removed** ($9 is now simply the annual price). Note: "Start free trial" buttons currently link to the early-access waitlist — align when billing exists.
- **B2B pages:** financial-advisors page rebuilt with Carefull-inspired positioning (reduce risk / retain assets / whole-family relationships; next-gen bridge; "Spry does the work — you're never in the drill flow") and renamed **"Financial & wealth advisors"** (URL unchanged). New analogous **credit-unions** page ("Protect the member, not just the account"). Senior-living and home-care pages NOT yet upgraded to this standard.

## Brand rules baked into the site (don't undo)

- Brand is **Spry**; domain is sprysafe.com. **Never use "ScamDrill"** in copy — it's a competitor (scamdrill.com).
- Voice: protective never patronizing; agency and positivity, never fear/shame (per FTC messaging research).
- Claim guardrails: no "prevents fraud"/guarantees; no implied FTC/AARP endorsement; no fabricated testimonials (samples use fictional "Margaret," labeled illustrative); no unverifiable ROI/leads claims on B2B pages; text/voice drills described as consent-gated (TCPA); stats must match FBI IC3 2025 sourcing.
- Full spec: `Spry_Website_Brief.md` in this folder (predates the v2 overhaul — where they conflict, the live site + this file win).

## Outstanding pre-marketing checklist

- [ ] **Stripe:** activate account, create 3 products / 6 prices / 6 payment links (14-day trial, redirect to /thanks), paste URLs into `src/data/checkout.js` — steps in `SPRY-STRIPE-SETUP.md` (repo root). Test mode first.
- [ ] **Attorney review of /privacy + /terms is now blocking** — checkout is wired, so "before charging customers" is here.
- [ ] Confirm Formspree endpoint is wired (replace `YOUR_FORM_ID` if not done) + test a submission
- [ ] Confirm hello@sprysafe.com routing verified
- [ ] Swap "Book a 20-minute call" mailto links → Cal.com/Calendly link when created (`src/pages/solutions/*`, `src/pages/pricing.astro`)
- [ ] Attorney review of /privacy and /terms (currently marked DRAFT) before charging customers
- [ ] Attorney quick-screen of SPRY/SPRYSAFE marks before paid marketing (key record: SPRY reg. 5329213, Spry Methods, classes 36/42; SPRYSAFE screened clear 2026-07-14)
- [ ] Upgrade senior-living + home-care pages to match advisor/credit-union quality
- [ ] Optional: add Plausible/Fathom analytics script to `src/layouts/Base.astro`
