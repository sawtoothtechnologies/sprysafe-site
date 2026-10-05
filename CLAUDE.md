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

## Design rules (Signal Amber v1.1, 2026-10-05)

Read `brand/TOKENS.md` before changing colors, type, or motion. The short version:

- **Dark (ink) surfaces are the hero, footer and table headers only.** Do not add more.
- **The Resilience Report section is honey; the closing band is amber.**
- **Selected states are lit** (glow fill, thin amber line), never inverted to black.
- **The primary button has a still glow**, not a pulsing ring. Nothing new should loop.
- **Coached items are dusk blue**, never red. No blue in the hero drill card.
- **Small labels are sentence case**, never uppercase. Headlines stay Manrope 800.
- **The logo is the Open Ring** (`brand/logo-*.svg`, `brand/lockup-*.svg`). The radar dial is retired.
- `brand/lamplight-exploration/` is an archived exploration, not the active brand.

## Workflow

- Deploys: push to `main` → Cloudflare Pages rebuilds getscamprep.com automatically.
- After edits, verify with a clean `astro build` before shipping.
