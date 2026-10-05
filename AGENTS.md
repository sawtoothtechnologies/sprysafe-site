# Website workspace instructions for Codex and Claude

These are the shared instructions for work in `~/Documents/sprysafe-site`.
`CLAUDE.md` points here so both assistants follow the same website rules.

## Read the original business guidance first

Before planning or editing, read these files in their existing folder:

1. `~/ScamPrep/00_CONTEXT.md`: current business status, goals, offers, and decisions.
2. `~/ScamPrep/voice.md`: the single source for copy and voice.
3. `~/ScamPrep/PROJECT-INSTRUCTIONS.md`: working preferences and business workflow.

Keep the business documents in `~/ScamPrep`. Do not move them, copy them into this
repo, or replace them with a website-specific business summary. Read relevant original
files there when a task needs more detail, such as `product/decisions.md` for product
behavior. If that folder is unavailable, say which guidance you could not read; do not
silently substitute an old snapshot for current business facts.

Resolve conflicts by subject:

- Current business facts and decisions come from `00_CONTEXT.md`.
- Copy guidance comes from `voice.md`, including when another document repeats it
  differently. Current positioning and wording on the live site are secondary to
  those original files.
- Website design comes from `brand/TOKENS.md`; implementation lives in this repo.
- Technical behavior must be checked against source, configuration, and build output.
  Use `SITE-OPS.md` as the operational guide, not as proof of an external service's status.
- Older business guidance in `README.md`, `STRIPE-SETUP.md`, other local notes, and
  archived material cannot override the original business files. Google Drive is frozen;
  follow the original project instructions for its limited existing-share-link exception.

## Copy reminders

These reminders do not replace reading `voice.md` and `00_CONTEXT.md`.

- The product is **ScamPrep**. Spry and ScamDrill are retired names. Legacy repo,
  folder, Cloudflare project, and redirect-domain names are intentional infrastructure.
- Use plain, warm, direct language. Older adults have dignity and agency. No fear,
  shame, fake urgency, or invented social proof. Describe consent explicitly:
  "You invite, they opt in."
- No em dashes in new or edited customer-facing text, including headings, metadata,
  FAQs, and alt text. Remove existing ones on lines you edit, but do not run a bulk
  replacement. Code comments and commit messages are exempt from this copy rule.
- Use sentence case. Follow the original voice file's formatting bans and banned
  language, rather than keeping a second list here.
- The **Resilience Report** is quarterly, every three months from each person's
  signup date. Never call it a monthly report or a report card in customer copy.
- The tagline is **"Pamphlets fade. Practice sticks."** Use "Founder," not "CEO,"
  for Bryce. Label simulated artifacts "Illustrative report" or "Simulated."
- Personal consent is required; no secret testing or enrollment through power of
  attorney. Partners receive aggregate, anonymized stats only. Drills never touch
  real financial information or falsify caller ID.
- Advisor pilot terms are internal. Do not reproduce them in this repo or public copy.
- Re-read current status before changing offers or CTAs. As of October 5, 2026, the
  product is not built and consumer signup is **"Get early access"**, not a working checkout.

## Website design: Signal Amber v1.1

Read `brand/TOKENS.md` before changing colors, type, layout, or motion. If changing
a token, update both that document and `src/styles/global.css`. For an adopted brand
decision, also align `~/ScamPrep/brand/visual-brand.md` and the visual-brand section
of `~/ScamPrep/PROJECT-INSTRUCTIONS.md`. Track rollout in the dated brand record
linked from `~/ScamPrep/00_CONTEXT.md`; a preview implementation is not a completed
rollout. Keep those business originals in their own folder.

- Dark ink surfaces are the hero, footer, and table headers only.
- The Resilience Report section is honey; the closing band is amber.
- Selected states are lit: glow fill and a thin amber line, never inverted to black.
- The hero has no rings and no card: the example drill arrives once, in order, on
  the ink, and one warm light fades up behind its coaching panel and holds still.
  The primary button glow, stat dots, report lights, and phone scenes also play
  once. Nothing loops or sweeps; respect reduced motion. Do not animate the Open
  Ring logo. The ripple and the radar are both retired.
- Coached items are dusk blue, never red. No blue in the hero drill card.
- Small labels are sentence case. Headlines stay Manrope 800.
- Use the Open Ring logo (`brand/logo-*.svg`, `brand/lockup-*.svg`). The radar dial
  is retired. `brand/lamplight-exploration/` is archived, not the active brand.
- No thick left-edge accent rules. Minimum body text is 16px; hit targets are 44px+.

## Editing, preview, and publishing

- Inspect the branch and working tree before editing. Preserve other work and stage
  only the files for the requested change. Never use `git add .` as the default.
- Work on a non-`main` branch. Reuse a suitable existing branch without mixing in
  unrelated edits; otherwise create one. Do not discard local work to change branches.
- For website changes, show Bryce a usable local or branch preview before publishing.
  Inspect affected pages at desktop and mobile sizes and check relevant interactions.
  A build log alone is not a preview. Documentation-only work can be reviewed as a diff.
- Run a clean `npm run build` (the package script runs `astro build`) before shipping.
  Follow `SITE-OPS.md` for the clean build steps. `package.json` currently has no
  separate test or lint scripts; run any additional checks relevant to the change.
- Fix failures and repeat the build if source changes afterward. Report what was
  checked, the preview location, and any limits on verification.
- **A push to `main` publishes to getscamprep.com through Cloudflare Pages.** A merge
  into remote `main` also publishes. Complete preview review and build checks first,
  and publish only when Bryce has asked to publish. A request to edit or commit alone
  is not a request to make the site live.
- When asked to commit, use a plain-English message. End with the exact commands for
  the actual branch and requested next step, one command per code block with a short
  explanation. Distinguish uploading a branch for preview from publishing to `main`.
