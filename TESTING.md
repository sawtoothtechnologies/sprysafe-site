# ScamPrep website testing protocol

How to prove the site works before it goes live, and that it still works after.
Claude and Codex follow this too (see `AGENTS.md`). The suite lives in `tests/`,
in its own folder, so Cloudflare's build never installs it.

**The rule:** nothing is published to `main` with a FAIL, unless Bryce has accepted
that specific failure in writing in the known-issues list at the bottom of this file.
WARN lines are judgment calls; read them, decide, move on.

Record PASS, FAIL, BLOCKED (could not execute), and NOT RUN separately. A browser
that could not start is not a site failure or a pass. A manual checkbox is only
complete when someone actually performs it. Preserve the commit, date, browser
versions, counts including skips, logs and screenshots with each launch review.

## The four gates

| When | Run | Time | Blocks publishing? |
| --- | --- | --- | --- |
| After any edit, while working | `npm run test:quick` | ~6 min | Fix before asking for review |
| Before publishing to `main` | `npm test` + the 10-minute manual pass | ~25 min | Yes |
| Right after publishing | `npm run test:live` + 2-minute phone check | ~3 min | Roll back if it fails |
| Before launch, then monthly | The full manual protocol below | ~90 min | Yes for launch |

## One-time setup (Terminal, in the website folder)

Install the test tools and Chromium, WebKit and Firefox test engines:

```sh
npm run test:setup
```

## Commands

Fast check: clean build, static checks, then Chrome desktop and Android-size phone:

```sh
npm run test:quick
```

Full check: adds WebKit (desktop, iPhone 13, iPhone SE, iPad emulation) and Firefox:

```sh
npm test
```

These are browser engines and emulated screen/device settings, not physical
iPhones, iPads or installed Safari/Edge. The real-device checks below still matter.
Tests use four workers and refuse to silently reuse an existing local test server.

See screenshots, traces and exact failures from the last browser run:

```sh
npm --prefix tests run report
```

Check the live site (needs internet; run after every publish):

```sh
npm run test:live
```

Check a branch preview instead of production:

```sh
LIVE_URL=https://<branch>.sprysafe-site.pages.dev npm run test:live
```

Send ONE real signup through Formspree, then confirm it reaches hello@getscamprep.com:

```sh
npm --prefix tests run live -- --real-signup you+sitetest@gmail.com
```

## What the automated suite covers

**Static checks** (`tests/static-checks.mjs`, every built page, no browser)

- Build hygiene: every expected page exists, no stray files (`.tgz`, `.patch`, `.map`) get published, duplicate assets flagged.
- SEO and sharing: unique title and description, canonical URL in the no-slash form, `og:` and `twitter:` tags, share image exists at the size the tags claim, valid JSON-LD, `/thanks` is noindex, sitemap lists exactly the indexable pages, robots.txt points to it, `_redirects` rules are well formed and do not shadow real pages.
- Structure: one `<h1>`, no skipped heading levels, no duplicate ids, every `aria-controls` and `<label for>` target exists, images have alt text, no positive tabindex, every link and button has a name, form fields are labelled and named, email is required, form posts over HTTPS.
- Links: every internal link and `#anchor` resolves, no `.html` or trailing-slash links, no links to retired domains, `target=_blank` has `rel=noopener`, `?plan=` values are real plans. Saves outbound links for the live check.
- Copy rules, read live from `~/ScamPrep/voice.md`: the banned AI-speak list, em dashes (including alt text, aria-labels and meta tags), retired names, "CEO", "monthly report" or "report card", free trial, "fall" as a report season, fake urgency, social proof, fraud-prevention guarantees, internal advisor pilot terms, spoofed caller ID, "not just X but Y", emoji, exclamation points over one per page, Title Case headings, ALL CAPS.
- Product facts: tagline present, drill frequency and quarterly report on the homepage, every simulated artifact labelled, every page with statistics links a source.
- Pricing math: card prices match `SITE-OPS.md`, monthly x 12 equals the annual total, the "N months free" claim is true for every plan, the advisor slider total never drops as people are added, no unknown prices anywhere.
- Local page weight budget per page. This excludes remote fonts and analytics and
  does not measure loading speed or Core Web Vitals.

**Browser tests** (`tests/browser/`, 7 browser and screen combinations)

- Smoke (every page): HTTP 200, zero console errors, exceptions or failed requests, no broken images, no sideways scrolling, Manrope actually loads, real 404 status for unknown URLs, retired URLs redirect.
- Accessibility (every page): zero axe violations (WCAG 2.2 AA plus best practices), no text under 15px, tap targets 44px+ on phones, skip link works, every Tab stop is visible and has a focus ring, no sideways scrolling at 14 widths from 320px to 1920px, none at 200% text size, header fits on one line from 901px. axe also runs with the menu open, pricing on Monthly with a FAQ open, and the walkthrough on step 4.
- Interactions: mobile menu (open, close, links, Escape, tap outside, after scrolling); desktop nav; pricing toggle (all prices, rapid toggling, screen-reader exposure, tap size); plan carried into the form; notice dismissal per visit; signup form (empty, four bad emails, a full valid signup with UTM attribution kept across pages, double-click sends once, empty fields left out, Formspree 422, Formspree 500, network drop, 16px inputs, no-JavaScript fallback); every FAQ by click and keyboard; homepage walkthrough on wide and small screens, messages finish arriving, no layout jump, resizing between layouts; advisor panels by tap, hover and keyboard; advisor slider by keyboard with limits and price math; booking links; all content visible with JavaScript off.
- Motion (every page): nothing loops, motion settles, no text stuck invisible after scrolling, reduced motion shows the finished page at once, hero finishes within about 3 seconds, layout shift under 0.1, printing shows the content.
- The form is always mocked in browser tests. No test run ever sends a real signup.
- Resilience: a recovered 503, a 429 followed by manual retry, both 15-second
  request timeouts, unavailable browser storage, HTML-like URL/error input, and
  increased text spacing on the homepage, pricing, solutions and early access.

Coverage limits: axe runs on Chromium layouts only and cannot certify WCAG
conformance. Keyboard checks omit WebKit's platform-specific Tab behavior. The
15px label floor does not prove the separate 16px body-text rule. A CSS root-font
override is not browser zoom. Check overlap, truncation, focus obscured by the
sticky header, screen-reader announcements and actual browser zoom by hand.
The local server emulates routing only; it does not enforce Cloudflare headers.

**Live checks** (`tests/live-checks.mjs`, against the real site)

- Every page 200; authored text, metadata, controls, script content and asset URLs
  match the local build, and referenced local CSS/JS/images match by SHA-256.
  Cloudflare's added analytics script is excluded. Also verify the deployment's
  commit in Cloudflare: this comparison is not a byte-for-byte HTML attestation.
- `/about.html`, `/about/`, `/index.html` redirect to the one true URL; unknown URLs return 404; retired solution URLs redirect.
- `http://` to `https://`, `www.` to apex, `sprysafe.com` to `getscamprep.com` with the path kept; certificate valid 14+ days.
- Security headers (HSTS, nosniff, restrictive framing, referrer) and long caching
  for hashed assets. A framing-only CSP is explicitly reported; its presence
  does not establish protection against script injection.
- robots, sitemaps (every listed URL 200), share image, icons.
- Cloudflare Web Analytics beacon present in what visitors receive.
- Formspree endpoint is reachable (GET only, not submission or inbox delivery);
  network errors, 429 and server errors cannot pass. Every outbound source,
  social and booking link is requested. A 403/429/999 may be bot protection:
  inspect the exact URL in a normal browser and record evidence before judging it.
- Email DNS: MX, SPF and DMARC for getscamprep.com.

`test:live` retains both static and live failure exit codes. Do not hide a static
failure behind a passing network check. Build the intended revision first; a
different deployed revision should fail comparison until reconciled.

## The 10-minute manual pass (before every publish)

Automation cannot judge how the page feels. On the preview for the change:

1. iPhone Safari: load the changed pages. Scroll top to bottom. Anything cramped, overlapping, cut off, or blank for a moment too long?
2. Mac Safari and Chrome: same pages at full width and with the window narrowed slowly from wide to narrow. Watch for the layout snapping badly at any point.
3. Tap through every button and link on the changed pages.
4. If the form or pricing changed: run through a signup on the preview (it is mocked only in tests; the preview form is real, so use your own email and delete it in Formspree afterward).
5. Read every changed sentence out loud. Check it against `voice.md`.
6. Turn on Reduce Motion (iPhone: Settings, Accessibility, Motion) and reload the homepage. It should show the finished page with no movement.

## The 2-minute check right after publishing

1. `npm run test:live` passes.
2. On your phone, not on Wi-Fi: open getscamprep.com, the changed page, and /early-access. Hard-refresh if anything looks old.
3. If something is wrong: Cloudflare Pages, `sprysafe-site`, Deployments, roll back to the previous production deployment, then fix forward (see `SITE-OPS.md`).

## Full manual protocol (before launch, then monthly)

**Real devices and settings.** Older adults are on iPads, older iPhones, large text, and Windows laptops.

- [ ] iPhone with Settings, Display and Brightness, Text Size at the largest standard step, plus Accessibility, Larger Text on: every page readable, nothing overlaps.
- [ ] iPad in portrait and landscape: the homepage walkthrough and pricing cards.
- [ ] An Android phone in Chrome: the advisor page panels, menu, pricing toggle.
- [ ] A Windows laptop in Edge at 125% display scaling (the Windows default on many laptops).
- [ ] Mac Chrome with Settings, Appearance, Font size "Very large": no sideways scrolling.
- [ ] Browser zoom to 200% (Cmd and plus, four times) on the homepage, pricing, and early access.
- [ ] Use the browser's displayed zoom percentage to check 200% and 400%, not a
  fixed number of key presses. At 400%, check reflow, focused controls and menu access.
- [ ] Increase text spacing; check wrapped labels, card content and input text for
  clipping. The automated width check cannot detect every overlap or truncation.
- [ ] Keyboard through the open mobile menu and page with the sticky header:
  focus stays visible, does not get trapped, and is not wholly covered.
- [ ] Phone in landscape on the homepage and the form.
- [ ] A slow connection: Chrome DevTools, Network, "Slow 4G". Homepage readable within 3 seconds, no blank hero.

**Screen reader (20 minutes).** Mac: Cmd and F5 turns VoiceOver on. iPhone: triple-click the side button after enabling the shortcut.

- [ ] Homepage: headings rotor (VO, U) lists a sensible outline; the example drill is announced as an example; nothing reads twice.
- [ ] Pricing: switch to Monthly; you hear the new prices; "3 months free" is not read on Monthly.
- [ ] Early access: every field announces its label and whether it is required; submitting with an empty email tells you why.
- [ ] Force a service error: the alert is announced once, entered details remain,
  and a successful retry reaches the confirmation. For a rate limit, the message
  should explain waiting rather than falsely blaming the email address.
- [ ] Mobile menu: the button says whether it is expanded.

**Signup end to end.**

- [ ] `--real-signup` command above arrives at hello@getscamprep.com within 5 minutes, not in spam, with plan and UTM fields when present.
- [ ] A signup from the live site on your phone with `?utm_source=test` lands on /thanks and the email shows `utm_source: test`.
- [ ] Formspree dashboard: reCAPTCHA is still OFF (the fetch submit breaks if it is on), the monthly submission limit has room for launch week, and spam filtering is on.
- [ ] Confirm the actual quota, spam behavior, retention and deletion controls in
  Formspree. Do not disable an existing security control solely to satisfy a test.
- [ ] Check the received message headers for SPF, DKIM and DMARC alignment.
  DNS records alone do not prove deliverability or signing.
- [ ] Reply to the test signup from hello@. The reply lands in a Gmail inbox, not spam.

**Links, previews and search.**

- [ ] Paste getscamprep.com, /pricing and /solutions into the LinkedIn Post Inspector, the Facebook Sharing Debugger, and an iMessage to yourself: right title, description and image.
- [ ] Book a test call through cal.com/scamprep/partner-call, then cancel it.
- [ ] Google Search Console: no coverage errors, sitemap read, the pages you expect are indexed.
- [ ] PageSpeed Insights (pagespeed.web.dev) on the homepage, mobile: Performance 90+, Accessibility 100, Largest Contentful Paint under 2.5 seconds.

**Content truth.**

- [ ] Every statistic on the site: open its source, including charts and tables,
  and find the same number, population (adults 60+ or everyone), and year.
- [ ] Every promise ("opens this fall", "drills begin within two weeks", "60-day money-back guarantee") is still true this month.
- [ ] Prices match `00_CONTEXT.md` and `SITE-OPS.md`.
- [ ] Nothing describes advisor pilot terms that are internal.

**Security and release operations.**

- [ ] Run `npm audit --omit=dev` in the repo and `npm --prefix tests audit` for
  the test tooling. Record versions and assess each advisory against deployed
  static assets, build-time processing, or an actually deployed server. Do not
  equate severity counts with proven public exploitability, or use forced major
  upgrades without a full regression run.
- [ ] Inspect the publish directory for credentials, private documents, source
  maps and archives. Search source for untrusted HTML insertion and mixed content.
- [ ] Verify headers on /early-access, /pricing and a real 404 as well as the
  homepage. Check framing protection in a real browser against the edge response.
- [ ] A full script CSP is a separate hardening change. Inventory inline scripts,
  Google Fonts, Formspree and analytics first; stage any policy in report-only mode
  and test it before enforcing it. Do not add unsafe allowances just for a green test.
- [ ] Confirm Cloudflare deployment revision, preview indexing/access policy,
  account MFA for Cloudflare/GitHub/Formspree/email, and an available rollback.
  Preview URLs may be public. Never put private business material in a preview.
- [ ] Record a slow-network mobile performance run separately from functional
  tests. Lab results vary; field Core Web Vitals may not exist before launch.
- [ ] No real signup, calendar booking or email should be sent without explicit
  authorization for that action and a designated test address. Mark these checks
  NOT RUN when unavailable; a mocked form does not satisfy them.

**A real person (the best test there is).** Sit with someone over 65 for 10 minutes.
Give them a phone with the homepage open. Ask: "What is this, and who is it for?"
after 5 seconds. Then: "Join the early-access list for yourself or someone you care
about." Check that they understand this is a list, not payment or enrollment, and
that a participant must later opt in personally. Watch silently and record hesitations.

## Keeping the suite honest

- New page: add it to `PAGES` in `tests/fixtures.mjs` and `EXPECTED_PAGES` in `tests/static-checks.mjs`.
- Prices change: update `expected` in `static-checks.mjs`, the pricing tests in `browser/interactions.spec.mjs`, and `SITE-OPS.md` together.
- `voice.md` changes: nothing to do; the static checks read it fresh each run.
- A test fails and the site is right: fix the test in the same commit and say why in the message. Never delete a failing test to get a green run.
- No retries are configured. A flaky test is a bug to fix.
- Offline machines (no Google Fonts): prefix the command with `OFFLINE=1`; fonts load from a local copy.
- OFFLINE runs prove local functionality only. They do not verify production
  fonts, analytics, third parties or real-network performance. Report that mode.
- Keep legacy share-image aliases required by `brand/TOKENS.md`; a duplicate-file
  warning is not grounds to break existing shared links.

## Known issues (accepted by Bryce)

None accepted yet. The baseline run on October 6, 2026 is in `tests/reports/2026-10-06-baseline.md`.
The independent follow-up and protocol corrections are in
`tests/reports/2026-10-06-launch-review.md`.
Add accepted items here as: ID, one-line description, why it is acceptable, date, and when to revisit.
