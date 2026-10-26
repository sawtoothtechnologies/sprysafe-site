import pathlib, sys, urllib.parse
from playwright.sync_api import sync_playwright

# Usage (from the repo root):
#   python3 brand/share-image/render-guide.py "Geek Squad scam emails" envelope public/share/geek-squad-scam-email.png [font-size]
# Renders guide-share-image.html at 1200 x 630 with the title and icon filled in.
here = pathlib.Path(__file__).parent
title, icon, out = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
size = sys.argv[4] if len(sys.argv) > 4 else ''
out.parent.mkdir(parents=True, exist_ok=True)
qs = urllib.parse.urlencode({'title': title, 'icon': icon, 'size': size})
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
    pg.goto((here / 'guide-share-image.html').as_uri() + '?' + qs)
    pg.evaluate('document.fonts.ready')
    pg.wait_for_timeout(300)
    pg.screenshot(path=str(out))
    print('wrote', out)
    b.close()
