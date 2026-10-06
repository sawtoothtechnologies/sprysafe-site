# Launch review: October 6, 2026

Follow-up to `2026-10-06-baseline.md`. Codex started this review and ran out of
budget partway through; Claude finished it. Branch: `launch-fixes`.

## Decision that shapes this review

The test suite exists to catch a buggy site, not imperfect copy (Bryce, October 6).
A FAIL means something is broken for a visitor. Copy and voice rules, product claims,
text size, tap-target size, contrast, heading order, 200% text, text spacing, printing
and the advisor slider are WARNs. Site copy and visual design were left as they are.

## What changed

**Test suite and protocol** (commit `63ede8b`, started by Codex)

- The live check compares full page content and asset hashes with the local build,
  not page titles only.
- A failed or rate-limited Formspree request can no longer count as a pass.
- New resilience tests: signup service errors, rate limits, timeouts, blocked
  browser storage, unsafe input, increased text spacing.
- `TESTING.md` separates PASS, FAIL, BLOCKED and NOT RUN, and lists coverage limits
  and extra manual checks.

**Behavior fixes** (commits `45cf88e`, `c06eaef`)

- Mobile menu: Escape and tapping outside now close it.
- Pricing: switching Annual and Monthly is announced to screen readers, and
  "3 months free" is hidden from them on Monthly instead of only faded.
- Signup page: when the browser jumps to an empty required field, it lands below
  the sticky header. (Applied to that page only. Site-wide, it made the homepage
  walkthrough jump.)

**Requested edits** (commit `c06eaef`)

- Removed the "For families" label above the pricing heading.
- Phones: the financial advisor link moved below the family plans. Desktop unchanged.
- Homepage example text: the bubble's tail no longer covers the start of the link.
- Comparison cards on phones: no white showing behind the rounded corners.

**Warnings instead of failures** (commit `0589648`).

## Results

- Clean build: pass.
- Static checks: 0 FAIL. WARNs are content items (see below).
- Browser tests, Chrome desktop and Android-size phone: 350 pass, 63 skipped,
  3 fail before the final fix. Two were the walkthrough jump caused by the site-wide
  header fix (now scoped to the signup page; rerun passes). One was a timing flake on
  /how-it-works that passed on rerun.
- Safari (desktop, iPhone 13, iPhone SE, iPad) and Firefox: NOT RUN here. Run
  `npm test` on the Mac.

## Codex findings, and what happened to each

| Finding | Status |
| --- | --- |
| Mobile menu stays open after Escape or a tap outside | Fixed |
| Empty signup submit hides the email field under the sticky header | Fixed |
| Pricing toggle not announced; "3 months free" read on Monthly | Fixed |
| Live-vs-build check compared titles only | Fixed in tests |
| Formspree check could pass after a network failure | Fixed in tests |
| Advisor page shows pilot terms, quarter-end timing, "who might need a closer look" | WARN, left as is (Bryce's call) |
| Text under 15px, small tap targets, contrast, heading order | WARN, left as is |
| "Fall", "spoofed number", em dashes, "3 months free" for Family, advisor slider rounding | WARN, left as is |
| 71% older-adult statistic | Supported by the AP-NORC chart (correction to the baseline) |
| Duplicate share images | Intentional compatibility files; keep |

## Not run

- Real signup to the Formspree inbox (needs Bryce's OK and a test address).
- Statistics checked against the cited federal report PDF.
- Physical iPhone, iPad and Windows Edge checks in the manual pass.
