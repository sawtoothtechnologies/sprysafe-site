# ScamPrep brand: Signal Amber v1.1 with the Open Ring

v1.0 adopted 2026-08-04. **v1.1 adopted 2026-10-05**: the same system, lightened.
Implemented in `src/styles/global.css`; this file is the human-readable source of truth.
**If you change a token, change it in both places.**

The portable business summary is `~/ScamPrep/brand/visual-brand.md`. Keep it and the
visual-brand section of `~/ScamPrep/PROJECT-INSTRUCTIONS.md` aligned with decisions
here. Rollout status lives in `~/ScamPrep/00_CONTEXT.md` and its linked dated brand
record. Adoption of the design does not establish that it is published or that
off-site assets have been updated. The `lamplight-reskin` branch name is historical;
Signal Amber v1.1 is the chosen brand.

## What v1.1 changed, and why

In October 2026 a full light-surface rebrand ("Lamplight") was built and previewed. Bryce
preferred the live site overall but found it too dark in places, so v1.1 keeps Signal Amber
and imports the parts of the preview that worked:

| Area | v1.0 | v1.1 |
| --- | --- | --- |
| Ink surfaces | hero, report band, closing band, footer, table header | **hero, footer, table header only** |
| Resilience Report section | ink band with radar rings | **honey panel** (`.section--band`): rounded (32px), inset from the page edges; report in the wider column, no outline on the card |
| Closing CTA band | ink with radar sweep | **amber band** with a shallow arched top edge, ink text, white button. On the homepage the sources line sits inside it, so amber runs straight into the footer |
| Selected / active states | inverted (ink fill, light text) | **lit**: glow fill, thin amber line, dark text |
| Hero motif | radar sweep | **one warm light** behind the example drill, fading up once and then holding still (a ripple came first and was replaced the same day) |
| Primary button | looping ping ring | **still glow** that fades up once on load |
| Hero example drill | text and coaching on a light card | **no card**: the text bubble and the coaching panel sit straight on the ink |
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
| **Warm light** | state | the hero only: one soft amber glow behind the coaching panel of the example drill. It fades up once as the coaching arrives, then holds still. No rings, no formal dot, no sweeping line, nothing looping (the radar sweep was retired 2026-10-05 because a scan reads as surveillance; the ripple that briefly replaced it was retired the same day in favor of the light) |
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
`#8A5D0A`. Dusk blue is for coached items in reports and the coaching mock card; **not** in the hero drill card,
where a blue block under a text bubble reads as a sent iMessage (that panel is amber tint).

## Type: Manrope, one family

Loaded from Google Fonts at 400/500/600/700/800 in `Base.astro`.

- display: 800 / −0.035em / clamp(2.3–3.4rem)
- h2: 800 / −0.03em · h3: 800 / −0.02em
- body: 400 / 17px / 1.65
- UI: 600–700 / 15px
- section label (`.kicker`): **700 / 15px / sentence case**, amber-text on light, amber on ink
- data numbers: 800

No uppercase micro-labels anywhere (section labels, table headers, footer headings, tags).

## Shape, spacing, motion

- Hero, adopted October 5 (it replaced the ripple, which is gone from the source):
  - The headline side is present at once. It has one button, "Get early access";
    the "How practice works" anchor button was removed. The sentence under the
    headline holds to two even lines from about 980px wide (wider copy column,
    type easing between 16px and 18.4px, balanced wrapping). The trust line under
    the button is quiet (`#9A978F`).
  - The example drill has no card. It arrives once, in order, over about 3s: the
    text bubble pops in from its tail corner like an arriving text, the dotted
    "If they tap the link" line draws downward, and the coaching panel fades up
    where the line lands.
  - One warm light fades up behind the coaching panel as it arrives (2.4s), low
    on the right, with no formal dot. Then everything holds still.
  - On wide screens the two columns sit up to 88px apart, with one faint white
    hairline between them that stops short at both ends.
  - Reduced motion shows the finished hero at once.
- Walkthrough ("How it works"), adopted October 5:
  - Visitor-controlled. No timers or automatic progression between steps.
  - Step titles show first. A step's description appears when it is chosen (wide
    screens) or opened (smaller screens), like the reveal panels on the advisors
    page. Click or tap only, no hover.
  - Wide screens: the chosen step is lit and the phone beside the list shows its
    scene. The phone is 300px wide and just tall enough for its fullest scene,
    with an "Illustrative example" caption beneath it. No "Simulated" tag inside
    a message.
  - Under 1040px there is no shared phone: each step opens its description and
    its own example in place, without the phone frame, and stays open until it
    is tapped again. Steps open and close independently, so the page never
    jumps. Step 1 starts open.
  - Inside a scene the messages arrive one after another, once, when the scene
    is on screen: the simulated text gives a small buzz and the simulated call
    rings twice. Reduced motion shows the whole scene at once.
- The header tagline and the footer use "Pamphlets fade. Practice sticks." The
  closing band headline is "Help them practice before the real thing arrives."
- Restrained glow tokens (also defined in `global.css`):
  - `--glow-button`: `0 0 0 2px rgba(240,161,28,.10), 0 6px 20px -8px rgba(240,161,28,.38)`
  - `--glow-button-ink`: `0 0 0 1px rgba(240,161,28,.18), 0 0 22px -2px rgba(240,161,28,.30), 0 8px 22px -10px rgba(240,161,28,.45)`.
    The primary button on ink (the hero) uses this slightly stronger glow, adopted
    2026-10-06, because `--glow-button` barely shows on the dark surface.
  - `--glow-pricing`: `0 0 32px 6px rgba(249,227,174,.46), 0 14px 32px -20px rgba(240,161,28,.22)`

- Radius: **6** chips/tags · **9** buttons/inputs/rows · **14** cards. No pills except toggles.
- Spacing: 4px base. Sections 56 / 88; the closing band 104. Content max 1120px.
- Motion: everything plays once and then holds still. Nothing loops.
  - hero: the example drill arrives in order and one warm light fades up behind
    the coaching panel, about 5s in all, then holds still
  - phone scenes: messages arrive in sequence once per showing
  - primary button glow fades up once (0.9s)
  - stat dots light up one after another, once, when scrolled into view
  - report rows rise in and the string of lights comes on, once, on scroll
  - UI transitions 150ms
  All behind `prefers-reduced-motion` (those visitors see the finished state at once).

## Usage rules: quick reference

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
- `public/og-v3.png`: the share image, one for every page (1200 x 630), redrawn
  2026-10-05: ink, the Open Ring lockup large and centered, the tagline "Pamphlets fade.
  Practice sticks." in amber, and the hero's warm light coming in softly from the right
  edge (its center sits just off the image, so there is no focal spot). No rings, no
  headline. `public/og.png` and `public/og-v2.png` are the same picture, kept for links
  shared before the rename.
  Made from `brand/share-image/share-image.html`; how to change it, and how each page's
  share title pairs with it, is in `brand/share-image/README.md`. A new version gets a
  new file name, because link previews are cached under the old one.

Logo rules: the ring is ink on light and paper (`#f8f7f4`) on ink; the center is always
amber. Never put the ink ring on amber or honey without checking it at small size. Minimum
size 16px. Clear space: one ring-stroke width on every side. Do not rotate the gap, close
the ring, or animate it. The radar-dial mark is retired; it lives in git history.
- `brand/lamplight-exploration/`: archived October 2026 exploration, not in use
