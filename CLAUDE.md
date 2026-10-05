# CLAUDE.md — sprysafe-site (ScamPrep)

Rules for anyone, human or AI, drafting or editing copy in this repo.

## Copy rules

- **No em dashes (—) in any new or edited copy.** Rephrase the sentence, or use a period,
  comma, colon, or parentheses instead. (Bryce's standing rule, 2026-08-19. It matches the
  outbound-email voice rule already in the marketing docs.)
- Existing em dashes in copy that predates this rule are grandfathered. Do not run a bulk
  find-and-replace; instead, remove them from any line you are already editing.
- This applies to customer-facing text only: page copy, headings, meta titles/descriptions,
  FAQ content, alt text. Code comments and commit messages are exempt.

## Voice reminders (see the brand docs in the ScamPrep project for the full system)

- Plain language; the audience skews older. Never fear or shame framing.
- The Resilience Report is **quarterly** (changed from monthly on 2026-08-18).
- The product is **ScamPrep** in all copy; the repo/domain names (sprysafe) are
  infrastructure and stay as-is until the domain migration in README.md.

## Design rules ("Lamplight", adopted 2026-10-04)

Read `brand/TOKENS.md` before changing colors, type, or motion. The short version:

- **No dark surfaces.** Walnut ink (`#332B23`) is for text and thin lines only. Never a
  section, card, button, or footer background.
- **Nothing loops.** No sweeping, pulsing, or blinking. Motion settles once and holds.
- **One amber button per view:** the primary button. Every other button is outlined. The
  amber closing band (`CtaBand`) is the single allowed amber surface per page.
- **Tinted sections are rounded panels**, not full-width stripes. One honey panel per page.
- **Product artifacts get a walnut outline** (drill card, report, phone, pricing cards).
- **Amber never carries text.** Amber-toned text is deep amber (`#6E4A0A`).
- **Coaching is dusk blue** (`#2F4A73` on `#E8EEF6`). Never red, never amber.
- **Manrope, 700 at most, sentence case.** No uppercase eyebrows or letter-spaced caps.
- **No people or faces** in illustration. Household objects only.
- Use the `--color-*` tokens in new CSS. The older names (`--ink`, `--pine-deep`, ...) are
  aliases; three of them changed meaning (see `brand/TOKENS.md`).

## Workflow

- Deploys: push to `main` → Cloudflare Pages rebuilds getscamprep.com automatically.
- After edits, verify with a clean `astro build` before shipping.
