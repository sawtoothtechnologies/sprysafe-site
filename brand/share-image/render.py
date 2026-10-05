import pathlib, sys
from playwright.sync_api import sync_playwright

here = pathlib.Path(__file__).parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else here
targets = {"family": "og-v2.png", "advisors": "og-advisors.png"}

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    for v, name in targets.items():
        pg.goto((here / "share-image.html").as_uri() + f"?v={v}")
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(out / name))
        print("wrote", out / name)
    b.close()
