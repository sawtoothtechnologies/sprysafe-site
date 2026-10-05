import pathlib, sys
from playwright.sync_api import sync_playwright

# Usage (from the repo root): python3 brand/share-image/render.py public og-v3.png
here = pathlib.Path(__file__).parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else here
name = sys.argv[2] if len(sys.argv) > 2 else "og-v3.png"

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    pg.goto((here / "share-image.html").as_uri())
    pg.evaluate("document.fonts.ready")
    pg.wait_for_timeout(300)
    pg.screenshot(path=str(out / name))
    print("wrote", out / name)
    b.close()
