# ScamPrep brand: "Lamplight" v2.0

Adopted 2026-10-04. Replaces "Signal Amber" v1.0 (ink surfaces, radar, ping, trace).
Implemented in `src/styles/global.css`; this file is the human-readable source of truth.
The full visual guide (logo, icons, illustration, applications) is
`brand/scamprep-brand-guide.html`. Open it in a browser.
**If you change a token, change it in both places.**

## The idea

Amber is the light left on at home. The same paper, type, and amber as before, now steady
and warm instead of sweeping and watchful. No radar, no dark surfaces, no surveillance tone.

Three hard rules:

1. **No dark surfaces.** Walnut ink is for text and thin lines only. Never a background,
   not even the footer.
2. **Nothing loops.** A light that blinks is an alarm. Motion settles once and holds still.
3. **No people or faces** in illustration. Draw objects from a home: a lamp, a table, a mug,
   a phone. Three objects per scene at most.

Three motifs, none of which looks at anyone:

| Motif | Means | Where |
| --- | --- | --- |
| **Steady light** | ongoing status | a small amber dot that is simply on (`.blip`) |
| **Lit button** | the one primary action | the amber button with a soft, still glow (`.btn--primary`) |
| **String of lights** | progress data | rows of dots: lit means spotted, an open ring means coached |

## Color

| Name | Token | Value | Use |
| --- | --- | --- | --- |
| Paper | `--color-bg` | `#F8F7F4` | page background |
| White | `--color-surface` | `#FFFFFF` | cards and inputs |
| Honey | `--color-band` | `#F9E3AE` | the one deeper band (use once per page) |
| Oat | `--color-band-alt` | `#F4ECD9` | alternate band, tags, footer |
| Glow | `--color-tint` | `#FBEFD3` | soft fills, strong badge, active states, closing band |
| Walnut ink | `--color-text` | `#332B23` | text and thin lines, never a surface |
| Pencil | `--color-text-muted` | `#675B4C` | muted text, labels |
| Amber | `--color-primary` | `#F0A11C` | primary button fill, lights |
| Deep amber | `--color-link` | `#6E4A0A` | links, amber-toned text, strong state text, focus ring |
| Dusk | `--color-coach-text` | `#2F4A73` | coaching state text |
| Dusk tint | `--color-coach-bg` | `#E8EEF6` | coaching state fill |
| Line | `--color-border` | `#E3E0D9` | borders, dividers |
| Control line | `--color-control-border` | `#8A857C` | input borders, unlit lights |

Rules: amber never carries text on a light surface; amber text is always deep amber.
Coaching uses dusk blue, so amber never means "careful." Every text pair above passes
WCAG AA on every surface above (pencil on honey is the tightest at 5.2:1).

Not in the guide, kept on purpose: `--alert` `#B3362E` for **form errors only**. The guide
has no error color, and a form still needs one. It must never be used for coached moments.

## Type: Manrope, one family

Loaded from Google Fonts at 400/500/600/700 in `Base.astro`. Nothing heavier than 700.

- display: 700 / 36 to 52px / 1.08 / -0.03em
- h2: 700 / 32px / 1.15 / -0.02em
- h3: 700 / 22px / 1.25 / -0.01em
- body: 400 / 17px / 1.65
- small: 400 / 16px / 1.55
- label: 600 / 15px / 1.3, **sentence case** (this replaced the uppercase eyebrow; `.kicker`)

No uppercase, no letter-spaced caps, anywhere.

## Shape, spacing, motion

- Radius: **6** tags · **10** buttons, inputs, rows · **16** cards. No pills except toggle switches.
- Cards use a 1px line and no shadow. The only shadow in the system is the amber glow under
  the primary button (`--shadow-primary`).
- Spacing: 4px base (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64). Sections 56 or 88px. Content max 1120px.
- Tap targets 44px at minimum. Buttons and inputs are 48px tall.
- Motion: the primary button's glow fades up over 900ms on load and holds. Lights in a row
  come on one at a time, 80ms apart, once, when scrolled into view. Hover and focus changes
  take 150ms ease-out. With reduced motion on, everything appears in its final state.

## Usage rules: quick reference

- One amber button per view: the primary button. Every other button is outlined (white,
  walnut line).
- Active or selected states are lit, not inverted: glow fill with an amber line.
- Coached items are dusk blue (open ring, dusk text, dusk tint fill). Never red, never amber.
- Minimum body size 16px (the audience skews older).
- Every simulated artifact is labeled ("Illustrative report", "Simulated").
- Logo: never on a dark surface, never recolored, never outlined, no glow or shadow. Below
  24px tall, use the symbol alone. Clear space equals the width of the light.

## How the site keeps Lamplight from going flat (added 2026-10-05)

A straight token swap left every surface in one narrow, pale value range. These six moves
put the contrast back without a single dark surface. Keep them when adding pages.

1. **One pool of light in the hero.** A large, soft elliptical gradient sits behind the
   homepage drill card: warm amber at the centre, honey around it, gone before the edges
   (`.hero__light` in `index.astro`). It spreads and fades up once when the page opens,
   then holds. There is deliberately no lamp drawing: the light itself is the motif.
2. **Product artifacts are drawn, not boxed.** The drill card, the Resilience Report, the
   phone, pricing cards and the simulated mock cards carry a 1.5 to 2.5px walnut outline,
   the same line as the illustrations. Ordinary content cards keep the 1px line.
3. **Tinted sections are panels, not stripes.** `.section--paper` (oat) and
   `.section--band` (honey) are rounded panels set into the paper, 32px radius. A page is
   mostly paper and white, with one honey panel at most.
4. **Icons yes, sticker illustrations no.** The brand icon set marks the steps and drill
   examples on How it works and the consent promise on the homepage. The guide's
   home-object illustrations were tried at thumbnail size (a lamp on the hero card, a door,
   a letter) and removed on 2026-10-05: small, they read as clip art. Use them only where
   one can be large enough to carry a section, or off-site (share image, email, print).
5. **String of lights for counts.** The Resilience Report shows one light per drill
   (`.lights`; 12 lit, 3 open dusk rings). Stat pictographs use the same lights.
6. **One saturated moment per page: the closing band.** `CtaBand` is full amber with an
   arched top edge and walnut text (6.5:1). **This knowingly bends the guide's "the button
   is the only amber fill" rule**, once per page, and its button turns white with a walnut
   line. Do not add a second amber surface to a page.

## Implementation notes: read before editing `global.css`

**Legacy names are aliases.** `global.css` keeps the Signal Amber variable names
(`--ink`, `--gray-700`, `--amber-tint`, `--sand`, ...) and the older Evergreen names
(`--pine-deep`, `--ink-soft`, ...) pointing at Lamplight values, so existing components
restyle in place. New work should use the `--color-*` names. Three aliases changed
**meaning**, not just value:

- `--ink` was a surface color. It is now text and thin lines only. Never write
  `background: var(--ink)` on anything bigger than a glyph.
- `--gray-400` was "text on ink." It is now simply muted text (same as `--gray-500`).
- `--alert` was "errors and coached moments." It is now form errors only.

**Legacy class names survive too.** `.section--ink` is now the honey band (prefer
`.section--band`), `.section--paper` is the oat band, `.btn--ink` is an outlined button,
`.blip--alert` is the open dusk ring for a coached item, and `ReportCard`'s
`tone="dark"` prop no longer changes anything visible.

**The radar and ping markup is gone.** It was removed from every template on 2026-10-05.

## Layout rhythm

- Two plain paper sections in a row share one gap (the second drops its top padding).
- The footer is paper with a hairline, so the amber closing band is the last color on a page.
- Body text is walnut everywhere. Pencil is for labels and fine print only.

## Still open

- Coaching panels still carry the logo symbol; the guide's lightbulb "coaching tip" icon is
  an option.
- Interior page heroes (About, Pricing, Advisors) are plain paper with no light.
- Copy items to review, not changed: "trend line" on the pricing page (the report shows
  lights and a status, not a line), and the two USPS examples on the homepage quote
  different fees ($1.95 in the hero card, $1.99 in the phone demo).

## Assets

- `brand/logo-horizontal.svg`, `brand/logo-stacked.svg`, `brand/logo-one-color.svg`:
  lockups with the wordmark outlined to paths, so they render without the font
- `brand/symbol.svg`: the roof with the light on
- `brand/favicon.svg` and `public/favicon.svg`: symbol on an amber rounded square, white light
- `public/apple-touch-icon.png`: 180×180, same mark on a full-bleed amber square
- `public/og.png`: 1200×630 share card (regenerate if its headline changes)
- `brand/scamprep-brand-guide.html`: the full guide

The site header and footer inline the symbol next to live "ScamPrep" text in Manrope 700.
