# Spry marketing site

Built with [Astro](https://astro.build) — a static site, no database, no server. All copy comes
from `Spry_Website_Brief.md` (in the Spry venture folder).

## Deploy in ~10 minutes (free)

1. **Put this folder on GitHub.** Create a new private repo at github.com/new, then from this
   folder run:
   ```
   git init && git add . && git commit -m "Spry site v1"
   git remote add origin <your repo URL>
   git push -u origin main
   ```
2. **Connect Vercel.** Sign in at vercel.com with GitHub → "Add New Project" → import the repo.
   Vercel auto-detects Astro; accept defaults and deploy. You'll get a live `*.vercel.app` URL.
3. **Add the domain.** Buy sprysafe.com (or whatever you land on) — Cloudflare or Namecheap are
   cheap — then in Vercel: Project → Settings → Domains → add it and follow the DNS instructions.

Every future `git push` redeploys automatically.

## Before launch — checklist

- [ ] **Waitlist form:** create a free form endpoint at formspree.io, then replace
      `YOUR_FORM_ID` in `src/pages/early-access.astro`. (Tally.so also works — swap the form for
      a Tally embed if you prefer their dashboard.)
- [ ] **Booking link:** the "Book a 20-minute call" buttons currently open a pre-filled email.
      When you have a Cal.com/Calendly link, search for `mailto:hello@` in `src/pages/solutions/`
      and `src/pages/pricing.astro` and swap the hrefs.
- [ ] **Domain:** update `site` in `astro.config.mjs` to the real domain.
- [ ] **Verify the 3,100+ AI-complaints stat is NOT on the site** (it isn't — it was flagged
      `[CONFIRM]` in the brief and left out until verified).
- [ ] **Privacy & Terms:** `src/pages/privacy.astro` and `terms.astro` are labeled DRAFT — have
      an attorney review before charging customers.
- [ ] **Analytics (optional):** add Plausible or Fathom by pasting their script tag into
      `src/layouts/Base.astro` `<head>`.

## Editing

- **Copy lives in the pages:** `src/pages/*.astro` — the text is plain HTML; edit and push.
- **FAQ answers:** all in one file, `src/data/faqs.js`.
- **Colors & fonts:** all design tokens are at the top of `src/styles/global.css`.
- **Report card:** `src/components/ReportCard.astro` — built in real HTML/CSS so it can become
  the actual product template later.
- **Header/footer/SEO:** `src/layouts/Base.astro`.

## Local preview

```
npm install
npm run dev        # live-reload at localhost:4321
npm run build      # production build to dist/
```

## Structure

```
src/
├── layouts/Base.astro          header, footer, SEO, fonts
├── components/
│   ├── ReportCard.astro        the hero artifact (sample report)
│   ├── CtaBand.astro           reusable bottom call-to-action
│   └── Faq.astro               accordion renderer
├── data/faqs.js                all FAQ copy
├── styles/global.css           the whole design system
└── pages/                      one file per page (14 pages)
```
