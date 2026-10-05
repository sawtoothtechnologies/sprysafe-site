# ScamPrep brand — "Signal · Amber" v1.1

v1.0 adopted 2026-08-04. **v1.1 adopted 2026-10-05**: the same system, lightened.
Implemented in `src/styles/global.css`; this file is the human-readable source of truth.
**If you change a token, change it in both places.**

## What v1.1 changed, and why

In October 2026 a full light-surface rebrand ("Lamplight") was built and previewed. Bryce
preferred the live site overall but found it too dark in places, so v1.1 keeps Signal Amber
and imports the parts of the preview that worked:

| Area | v1.0 | v1.1 |
| --- | --- | --- |
| Ink surfaces | hero, report band, closing band, footer, table header | **hero, footer, table header only** |
| Resilience Report section | ink band with radar rings | **honey panel** (`.section--band`): rounded (32px), inset from the page edges; report in the wider column, no outline on the card |
| Closing CTA band | ink with radar sweep | **amber band** with a shallow arched top edge, ink text, white button |
| Selected / active states | inverted (ink fill, light text) | **lit**: glow fill, thin amber line, dark text |
| Primary button | looping ping ring | **still glow** that fades up once on load |
| Phone demo | dark device with heavy shadow | **line drawing**: one ink outline, white screen |
| Coached items | red outline, red text | **dusk blue** tint and text, open ring |
| Small labels | uppercase, letter-spaced | **sentence case**, weight 700 |
| Resilience Report card | rows only | adds a **string of lights** under the count: 12 lit, 3 open dusk rings (`.lights`) |
| Consent promise (homepage) | amber dot | **outline icon in a soft amber circle**, same family as the drill-example icons |
| Callout boxes | white card with a thick rule down the left edge | **whole box softly lit** (glow fill, honey border). No left-edge accent rules |
| Logo | radar dial (two rings, needle, amber center) | **the Open Ring**: one ring left open at the upper right, amber center |
| Recommended pricing card | gray drop shadow | **warm yellow halo** behind the white card |

Unchanged from v1.0: the dark hero, Manrope with 800 headlines,
paper and sand bands, the amber coaching panel in the hero drill card.

The full Lamplight exploration (guide, logo set) is archived in
`brand/lamplight-exploration/`. It is **not** the active brand.

## The idea

One typeface, warm near-black, signal amber. Amber is a *signal*, not a theme.

| Motif | Means | Where |
| --- | --- | --- |
| **The Open Ring** | the brand | the logo: one ring left open at the upper right around a steady amber center. Attention, with a way in |
| **Ripple** | state | the hero only: rings spreading from one steady amber point, farther apart and fainter as they travel out. They spread once on load, then hold still. No sweeping line, no blinking contacts, nothing looping (the radar sweep was retired 2026-10-05: a scan reads as surveillance) |
| **Lit button** | the one primary action | the amber button with its still glow |
| **Blip** | status | amber dot = fine; open dusk ring = coached |

## Color

| Token | Value | Use |
| --- | --- | --- |
| ink | `#121110` | text; hero, footer, table-header surfaces |
| amber | `#F0A11C` | THE accent: primary button, blips, closing band |
| amber-deep | `#6E4A0A` | amber-toned text on light and honey backgrounds |
| amber-text | `#8A5D0A` | links and section labels on light |
| amber-tint | `#F9E9C9` | badge fills ("Mostly strong ↑") |
| amber-row | `#FDF4E1` | highlighted table row |
| glow | `#FBEFD3` | lit / selected state fill |
| honey | `#F9E3AE` | the report section; one honey band per page |
| coach / coach-tint | `#2F4A73` / `#E8EEF6` | coached items in reports and the coaching mock card |
| alert | `#B3362E` | form errors ONLY. Never for coached moments |
| paper | `#F8F7F4` | page background |
| sand | `#EFEDE8` | alternate section band |
| line | `#E7E5E0` | borders/dividers |
| gray-700 / 500 / 400 | `#55524C` / `#6B6862` / `#A3A09A` | body / muted / on-dark text |

Rules: amber never carries body text. On light surfaces amber text is `#6E4A0A` or
`#8A5D0A`. Dusk blue is for coached items in reports only; **not** in the hero drill card,
where a blue block under a text bubble reads as a sent iMessage (that panel is amber tint).

## Type — Manrope, one family

Loaded from Google Fonts at 400/500/600/700/800 in `Base.astro`.

- display: 800 / −0.035em / clamp(2.3–3.4rem)
- h2: 800 / −0.03em · h3: 800 / −0.02em
- body: 400 / 17px / 1.65
- UI: 600–700 / 15px
- section label (`.kicker`): **700 / 15px / sentence case**, amber-text on light, amber on ink
- data numbers: 800

No uppercase micro-labels anywhere (section labels, table headers, footer headings, tags).

## Shape, spacing, motion

- Radius: **6** chips/tags · **9** buttons/inputs/rows · **14** cards. No pills except toggles.
- Spacing: 4px base. Sections 56 / 88; the closing band 104. Content max 1120px.
- Motion: primary button glow fades up once (0.9s) · report rows
  rise in once on scroll · UI transitions 150ms. All behind `prefers-reduced-motion`.

## Usage rules — quick reference

- Ink is for the hero, footer and table headers. Do not add new dark sections.
- Curves sit on whatever is above them. After a gray (sand) band, the honey panel and the
  amber arch rise straight out of the gray: no strip of paper, no line, between them.
- The amber fill is the one conversion action on a page, plus the closing band (whose own
  button turns white).
- Selected states are lit (glow + amber line), never inverted to ink.
- No thick accent rule down the left edge of a box or list item, anywhere. Bryce reads it as
  an AI-generated tell. Light the whole box, or separate items with hairlines.
- Coached is dusk blue, never red.
- Minimum body size 16px; hit targets 44px+ (the audience skews older).
- Every simulated artifact is labeled ("Illustrative report", "Simulated").

## Assets

- `brand/logo-ink.svg`, `brand/logo-on-dark.svg`: the Open Ring mark (active since 2026-10-05)
- `brand/lockup-ink.svg`, `brand/lockup-on-dark.svg`: mark + wordmark (Manrope 800, -0.03em,
  outlined) for use off the site: decks, documents, email signature
- `public/favicon.svg`, `public/apple-touch-icon.png`: paper ring, amber center, on ink
- `public/og.png`: share image, ink with still rings (1200 x 630)

Logo rules: the ring is ink on light and paper (`#f8f7f4`) on ink; the center is always
amber. Never put the ink ring on amber or honey without checking it at small size. Minimum
size 16px. Clear space: one ring-stroke width on every side. Do not rotate the gap, close
the ring, or animate it. The radar-dial mark is retired; it lives in git history.
- `brand/lamplight-exploration/`: archived October 2026 exploration, not in use
