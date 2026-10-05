# ScamPrep website operations

Last reviewed: October 5, 2026. Repository details below were checked against the
local source and configuration. External account settings were not inspected.

## Sources of guidance

Read `AGENTS.md` before website work. Both Codex and Claude use those shared rules.
Business documents stay in `~/ScamPrep`:

- `00_CONTEXT.md` controls current status, goals, offers, and decisions.
- `voice.md` controls all copy, including when an older website document disagrees.
- `PROJECT-INSTRUCTIONS.md` describes Bryce's working preferences.
- `product/decisions.md` contains detailed product decisions when needed.

Do not treat this runbook as a replacement for those originals. `README.md` and
`STRIPE-SETUP.md` contain older business and launch guidance; verify their instructions
against the originals and current code before using them. Archived material is history.
Google Drive is frozen, subject to the existing-share-link exception in the project
instructions; website work belongs in this repo.

## Current business and copy guidance

As of this review, the product is **ScamPrep**, live marketing is at
**https://getscamprep.com**, and the consumer CTA is **"Get early access."** The
product MVP and checkout are still to be built. Do not imply paying customers,
working enrollment, or an available trial checkout. The consumer path comes first,
with financial advisors as the parallel channel. There are no stage or kill gates.

Use the original voice guidance, including these corrections to the old runbook:

- Tagline: "Pamphlets fade. Practice sticks."
- Describe realistic practice with personal consent: "You invite, they opt in."
  Drills arrive 4 to 6 times a month on no set schedule, with friendly coaching and
  current scam briefings.
- The Resilience Report arrives every three months, timed from each person's signup.
  Name sample reports for their arrival season; use "autumn," not "fall."
- Address the reader as "you" and name older adults or loved ones early. The old
  blanket ban on saying "your parent" is not current guidance.
- No fear, shame, em dashes, fake urgency, or unsupported social proof. Do not make
  guarantees of fraud prevention or imply research organizations endorse ScamPrep.
  Verify evidence for factual claims before adding or revising them.
- Personal consent cannot be replaced by power of attorney. Partners see only
  aggregate, anonymized stats. Drills never touch real financial information or
  falsify caller ID. Simulated artifacts must be labeled.
- Advisor pilot terms are internal. Read them only in the original business context;
  do not copy them into website documentation or publish them.

Current consumer prices shown in `src/pages/pricing.astro` are $9, $15, and $19 per
month billed annually ($108, $180, and $228 per year). The monthly toggle shows $12,
$20, and $25. Plans cover one, two, or up to four people. The stated offer includes a
14-day free trial and a 60-day money-back guarantee, but purchases are not available.
Recheck `00_CONTEXT.md` and the pricing source before changing any offer.

The legacy `sprysafe-site` repo, local folder, and Cloudflare project names are
intentional. `sprysafe.com` is the old redirect domain. Do not rename infrastructure
or revive Spry or ScamDrill as product names.

## Technical details and verification limits

| Piece | Checked source or operational instruction |
| --- | --- |
| Repository | `~/Documents/sprysafe-site` is the Git root. `origin` is `https://github.com/sawtoothtechnologies/sprysafe-site.git`. |
| Framework | Static Astro site. `package.json` defines `dev`, `build`, and `preview`; it has no test or lint script. Install dependencies with `npm ci` after a fresh checkout or lockfile change. |
| Production deployment | A push to `main`, including a merged pull request, publishes through Cloudflare Pages to getscamprep.com. Treat it as a release, not a backup operation. |
| Build settings | Build from the repository root with `npm run build`; output is `dist/`. Match these when checking Cloudflare settings. The dashboard configuration was not independently verified in this review. |
| Branch previews | The existing repo workflow uses Cloudflare branch deployments. Get the actual preview URL from the commit/PR checks or Cloudflare Deployments. Do not assume a branch preview is private or access-controlled. |
| URLs and sitemap | `astro.config.mjs` sets `https://getscamprep.com`, `trailingSlash: 'never'`, and flat HTML output. `src/lib/public-url.js` normalizes canonical URLs. Sitemap generation excludes `/thanks`; that page also sets `noindex`. `public/robots.txt` points to `/sitemap-index.xml`. |
| Early-access form | `src/pages/early-access.astro` sets `FORM_ACTION` to `https://formspree.io/f/moeajjvb`. It submits through fetch, redirects success to `/thanks`, and has a normal POST fallback. The code documents reCAPTCHA as off for this integration. Inbox delivery and Formspree settings still need an account or end-to-end check before claiming they work. |
| Payments | All six Stripe link slots in `src/data/checkout.js` are empty. `src/pages/pricing.astro` falls back to `/early-access?plan=...`. Adding links changes the button destinations automatically, so do not do it as routine documentation cleanup. |
| Confirmation page | `/thanks` is the early-access confirmation. It is not a checkout confirmation. Its source calls for a separate `/welcome` page when billing launches; that page does not exist yet. |
| Booking | `https://cal.com/scamprep/partner-call` is already used in `src/pages/solutions/index.astro`, `src/components/OrgPricing.astro`, and `src/layouts/Base.astro`. Account availability was not tested. |
| Email | Current site links use `hello@getscamprep.com`. DNS, mailbox delivery, and legacy email forwarding cannot be verified from these links. Check the relevant service before changing routing. |
| Analytics | `Base.astro` documents Cloudflare Web Analytics injection at the edge. Verify the live response or Cloudflare settings before adding another tracker; absence of a source script does not prove analytics are missing. |
| Legal pages | `privacy.astro` and `terms.astro` show August 9, 2026 effective dates and no DRAFT labels. This does not establish attorney-review status. The old claim that checkout is already live and review is now blocking is obsolete. |
| Redirects | `public/_redirects` redirects the retired senior-living, home-care, financial-advisors, and credit-unions solution URLs to `/solutions`. Old-domain redirects and DNS are external configuration, not this file. |

Do not infer account activation, pricing tiers, credentials, legal approval, or
successful delivery from old notes or source comments. Verify those details in the
relevant service when a task depends on them. Do not delete the legacy domain or its
DNS zone as part of a branding update.

## Edit, preview, build, then publish

1. Read the original guidance and inspect the current branch and working tree. Preserve
   existing edits. Use a suitable non-`main` branch; do not switch branches by discarding
   someone else's work.
2. Make the requested changes. Stage only named files for that task. A documentation
   request does not authorize page, stylesheet, configuration, or dependency changes.
3. For website edits, show Bryce a usable preview before publishing. Use `npm run dev`
   while editing, or the built preview below. Inspect affected pages at desktop and
   mobile sizes, relevant interactions, links, and reduced motion where applicable.
   Documentation-only work can be reviewed through its diff.
4. Run the clean build below. Resolve failures, and rebuild if source changes after
   the check. Report what passed and anything that could not be verified.
5. Commit only the intended files with a plain-English message. Give the exact push
   command for the actual branch. Uploading a non-`main` branch can create a hosted
   preview; do not present it as publishing production.
6. After preview review and successful build checks, publish only when Bryce has asked
   to publish. Merging a reviewed PR into `main` or pushing to `main` makes the site live.
   Verify the production deployment result and affected pages before calling it done.

Run these commands from `~/Documents/sprysafe-site`. Commands are separate so it is
clear which steps only preview or build, and which can publish.

Open the local development preview (use the address printed by Astro):

```sh
npm run dev
```

Remove only the generated build and Astro cache directories for a clean build:

```sh
rm -rf dist .astro
```

Run the production build:

```sh
npm run build
```

Serve the completed build locally and share the printed address with Bryce:

```sh
npm run preview
```

These local commands do not publish. Build output and dependencies (`dist/`, `.astro/`,
`node_modules/`) are ignored and should not be committed. There is no separate test or
lint command configured; choose additional checks based on the actual change.

If production has a problem, inspect its deployment status in Cloudflare Pages before
diagnosing a stale browser. The existing recovery procedure is to select the previous
successful production deployment under the `sprysafe-site` project's Deployments and
roll back, then fix or revert the corresponding code. Confirm the available deployment
and current dashboard controls before acting.

## Editing map and design

`brand/TOKENS.md` is the active **Signal Amber v1.1** design reference. Keep token
changes synchronized with `src/styles/global.css`. Preserve the Open Ring logo, ink
hero/footer/table headers, honey report section, amber closing band, lit selected
states, still button glow, dusk-blue coaching, sentence-case labels, and Manrope 800
headlines. The hero ripple spreads once from an amber point, then holds still; the
button glow, stat dots, and report lights also play once. Nothing loops or sweeps.
The Lamplight exploration is archived. Keep the portable summary in
`~/ScamPrep/brand/visual-brand.md` aligned with adopted design changes and read the
rollout record linked from `~/ScamPrep/00_CONTEXT.md` for publication and off-site status.

| To change | Edit |
| --- | --- |
| Page copy | `src/pages/*.astro`; the consolidated partner page is `src/pages/solutions/index.astro`. |
| Shared FAQ answers | `src/data/faqs.js`; `homeFaqs` picks the homepage subset. Pricing and solutions also define their own FAQs. |
| Colors, type, spacing, and motion | `brand/TOKENS.md` and `src/styles/global.css`, plus page/component styles where relevant. |
| Header, footer, navigation, and shared SEO | `src/layouts/Base.astro`; URL normalization is in `src/lib/public-url.js`. |
| Sample Resilience Report | `src/components/ReportCard.astro`; the internal filename is intentional. |
| Phone example and closing CTA | `src/components/PhoneDemo.astro` and `src/components/CtaBand.astro`. |
| Early-access form and confirmation | `src/pages/early-access.astro` and `src/pages/thanks.astro`. |
| Consumer prices, billing toggle, and link destinations | `src/pages/pricing.astro` and `src/data/checkout.js`. |
| Partner pricing and booking | `src/components/OrgPricing.astro` and `src/pages/solutions/index.astro`. |
| Homepage interactions | Script and style blocks in `src/pages/index.astro`. |
| Redirects, robots, and sitemap configuration | `public/_redirects`, `public/robots.txt`, and `astro.config.mjs`. |

When billing work begins, revisit `STRIPE-SETUP.md` against the current business
context, source code, and Stripe settings. Its old waitlist-placeholder, checkout
confirmation, and brand instructions are not current launch requirements.
