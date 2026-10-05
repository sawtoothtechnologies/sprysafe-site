# Share image

The picture that shows up when someone pastes a ScamPrep link into a text, email,
LinkedIn, Slack or X. One image for every page: `public/og-v2.png` (also copied to
`public/og.png` for links shared before the rename). It is made from
`share-image.html`, so the font and colors match the site.

## Design (Signal Amber v1.1)

- Ink background.
- The Open Ring lockup, large and centered (paper ring and wordmark, amber center).
- The tagline under it in amber: "Pamphlets fade. Practice sticks."
- The hero's warm light, softened: its center sits just past the right edge, so it
  comes in gently from the side instead of making a spot on the page. No rings.
- Nothing else. The page's share title and description sit under the picture in a
  link preview, so the picture carries the brand and the text carries the page.

## How it pairs with each page's text

A link preview shows: the image, then the share title, then the description, then
the domain. So:

- **Share title** (`shareTitle` in each page's `<Base>`): what this page is about, in
  plain words and sentence case. No "ScamPrep" (the image already says it) and never the tagline.
- **Title** (`title`): the browser tab and Google result. Title Case (the one
  exception to sentence case, chosen for search results), and keeps "| ScamPrep" so
  the brand shows where there is no image.
- **Description**: one or two short sentences that add something the share title
  doesn't say.

## Changing the image

1. Edit `share-image.html`.
2. Render at exactly 1200 x 630 under a **new file name**:
   `python3 brand/share-image/render.py public og-v3.png` (needs Python Playwright),
   or ask Claude to render it.
3. Point `image` in `src/layouts/Base.astro` at the new file. LinkedIn, iMessage and
   Slack cache the old picture for days or weeks under the old name.
4. After deploying, paste the link into https://www.linkedin.com/post-inspector/
   to refresh LinkedIn's copy.

Manrope (SIL Open Font License) is in `fonts/` so the template renders the same
everywhere, offline included.
