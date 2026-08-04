# ScamPrep brand — "Signal · Amber" v1.0

Adopted 2026-08-04. Replaces "Evergreen Modern" (pine green / Plus Jakarta Sans / pill buttons).
Implemented in `src/styles/global.css`; this file is the human-readable source of truth.
**If you change a token, change it in both places.**

## The idea

One typeface, warm near-black, radar amber, signal red. Amber is a *signal*, not a theme.

Three motifs, one job each — **never two on the same surface**:

| Motif | Means | Where |
| --- | --- | --- |
| **Radar** | state — "always watching" | ink surfaces only: hero, report band, final CTA |
| **Ping** | event — "something happened" | the one primary CTA per page; confirmations |
| **Trace** | data — "the record" | charts, progress, stat graphics |

## Color

| Token | Value | Use |
| --- | --- | --- |
| ink | `#121110` | text, dark surfaces, standard primary buttons |
| amber | `#F0A11C` | THE accent — one amber moment per viewport; fills, blips, sweeps |
| amber-deep | `#6E4A0A` | amber-toned text on light backgrounds |
| amber-text | `#8A5D0A` | links on light |
| amber-tint | `#F9E9C9` | badge fills ("Mostly strong ↑") |
| amber-row | `#FDF4E1` | highlighted table row |
| alert | `#B3362E` | errors + "coached" moments ONLY — never decoration |
| paper | `#F8F7F4` | page background |
| sand | `#EFEDE8` | alternate section band |
| line | `#E7E5E0` | borders/dividers |
| gray-700 / 500 / 400 | `#55524C` / `#84817B` / `#A3A09A` | body / muted / on-dark text |
| on-dark line / muted | `#33302B` / `#4D4841` | borders + dimmed elements on ink |

Rules: amber never carries body text. On light surfaces amber text is always `#6E4A0A`.
One amber moment per viewport. Red only for coached moments and errors.

## Type — Manrope, one family

Loaded from Google Fonts at 400/500/600/700/800 in `Base.astro`.

- display: 800 / −0.04em / clamp(2.3–3.4rem)
- h2: 800 / −0.03em · h3: 800 / −0.02em
- body: 400 / 17px / 1.65
- UI: 600–700 / 15px
- eyebrow: 800 / 11–12px / 0.13em uppercase (amber-text on light, amber on dark)
- data numbers: 800 / −0.03em

## Shape, spacing, motion

- Radius: **6** chips/tags · **9** buttons/inputs/rows · **14** cards. Blips and gauges are circles.
  No pills except toggle switches.
- Spacing: 4px base (8 / 12 / 16 / 24 / 32 / 48). Sections 88px (stats band 64px). Content max 1120px.
- Motion: radar sweep 6–10s linear · ping 2.4–2.7s ease-out · trace draw 3.8s **once, on scroll**
  (the design reference loops it; production plays it once) · UI transitions 150ms.
- All motion sits behind `prefers-reduced-motion`. Count-ups are skipped entirely under it.

## Usage rules — quick reference

- One motif per surface: radar on dark heroes, ping on the primary action, trace on data. Never two.
- The amber fill is reserved for the one conversion action on a page; every other primary is ink.
- Blip dots replace icons for status. No emoji, no checkmark circles.
- Minimum body size 16px; hit targets 44px+ (the audience skews older).
- Every participant-facing simulation artifact is labeled "Illustrative report" / "Simulated".

## Known deviations from the design reference

Recorded deliberately so nobody "fixes" them back:

1. **Hero fine print is 0.8rem, not 0.75rem.** The reference sets 12px; the system's own
   legibility floor says otherwise for this audience. Split the difference and revisit.
2. **The how-it-works steps stay an interactive carousel.** The reference shows a static
   four-card stack — which is the carousel with step 1 active. The interaction (synced with the
   phone demo) is existing product behavior and was not in scope to remove.
3. **Source links are real URLs.** The reference replaced the live FTC / PNAS Nexus / AP-NORC /
   FBI links with `href="#"`. Live links were kept — unsourced statistics are a credibility risk
   for a fraud-prevention brand.
4. **Two pinging CTAs exist on the homepage** (hero + final band), per the reference. They are
   never in the viewport at the same time, which satisfies the "never two pings in view" rule.
5. **Keyframe names keep the `spry` prefix** (`spryRot`, `spryPing`, `spryDash`, `spryBlip`,
   `spryPingBtn`) to match the design handoff verbatim. Rename in a later pass if desired.

## Legacy aliases — read before deleting

`global.css` keeps the Evergreen variable names as aliases so unmigrated components restyle in
place. Two of them changed **meaning**, not just value:

- `--ok` was a green; it is now `--amber-deep` (a brown-gold **text** color).
- `--warn` was a gold; it is now `--alert` (red).

Any future component using them as a **fill** must be reviewed, not just recolored. As of v1.0
every in-repo usage is a text color.

## Assets

- `brand/logo-ink.svg` — radar-dial mark for light backgrounds
- `brand/logo-on-dark.svg` — same mark, near-white strokes, for ink backgrounds
- `public/favicon.svg` — on-dark variant on an ink rounded square
- `public/apple-touch-icon.png` — 180×180 raster of the same
- `public/og.png` — 1200×630 social share card (regenerate if the tagline changes)

Inline the mark rather than linking it where it needs to inherit color (header uses
`currentColor`). Drop the inner ring below ~20px.
