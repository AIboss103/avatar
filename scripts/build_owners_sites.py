#!/usr/bin/env python3
"""Standalone sites for the owners offer, one per language, each on its own subdomain.

    propietarios.restate.deals   Spanish   (Pages project owners-es)
    owners.restate.deals         English   (Pages project owners-en)

The page is the one from restate.deals/owners (built by build_owners_lang.py), served at the root of the
subdomain. Only the files the page needs are copied. Links to other pages of restate.deals become absolute.
Run after build_owners_lang.py and owners_checklist.py:

    python3 scripts/build_owners_sites.py        # writes dist/owners-es and dist/owners-en
    scripts/deploy_owners_sites.sh                # uploads both to Cloudflare Pages
"""
import pathlib, re, shutil, sys

REPO = pathlib.Path(__file__).resolve().parent.parent
ROOT = REPO / "real-estate-developers"
DIST = REPO / "dist"
MAIN = "https://restate.deals"
SITES = {
    "es": dict(host="propietarios.restate.deals", page=ROOT / "owners" / "index.html"),
    "en": dict(host="owners.restate.deals", page=ROOT / "owners" / "en" / "index.html"),
}
ASSETS = ["apple-touch-icon.png", "favicon.ico", "favicon.svg", "favicon-16.png", "favicon-32.png", "icon-192.png",
          "icon-512.png", "site.webmanifest", "rd-track.js", "img/artem.webp", "img/brand/logo-horizontal-dark.svg",
          "img/brand/symbol-gold.svg"]
OTHER_PAGES = ["privacy", "es", "en", "ru", "price", "partners", "legal"]


def must_sub(pattern, repl, s, count=1, flags=0):
    out, n = re.subn(pattern, lambda m: repl, s, count=count, flags=flags)
    if n < 1:
        sys.exit("pattern not found: " + pattern)
    return out


def build(lang):
    cfg = SITES[lang]
    host = cfg["host"]
    url = f"https://{host}/"
    s = cfg["page"].read_text()
    s = must_sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', s)
    s = must_sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', s)
    # hreflang alternates: the two subdomains
    s = re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?', "", s)
    alt = (f'<link rel="alternate" hreflang="es" href="https://{SITES["es"]["host"]}/">\n'
           f'<link rel="alternate" hreflang="en" href="https://{SITES["en"]["host"]}/">\n'
           f'<link rel="alternate" hreflang="x-default" href="https://{SITES["es"]["host"]}/">\n')
    s = must_sub(r'(<link rel="canonical" href="[^"]*">\n?)', "", s) if False else s
    s = s.replace(f'<link rel="canonical" href="{url}">', f'<link rel="canonical" href="{url}">\n' + alt.rstrip("\n"), 1)
    # language switch: the two subdomains (RU is paused)
    s = must_sub(r'<a href="/owners/"( hreflang="es")', f'<a href="https://{SITES["es"]["host"]}/"\\1', s) if False else s
    s = s.replace('<a href="/owners/" hreflang="es"', f'<a href="https://{SITES["es"]["host"]}/" hreflang="es"', 1)
    s = s.replace('<a href="/owners/en/" hreflang="en"', f'<a href="https://{SITES["en"]["host"]}/" hreflang="en"', 1)
    # links to other pages of restate.deals
    for old, new in [
        ("href=\"/es/privacidad/\"", f"href=\"{MAIN}/es/privacidad/\""),
        ("href=\"/privacy/\"", f"href=\"{MAIN}/privacy/\""),
        ("href=\"/es/\"", f"href=\"{MAIN}/es/\""),
        ("href=\"/en/\"", f"href=\"{MAIN}/en/\""),
        ("'/es/privacidad/'", f"'{MAIN}/es/privacidad/'"),
        ("'/privacy/'", f"'{MAIN}/privacy/'"),
        ("lang==='en'?'/en/':'/'+lang+'/'", f"lang==='en'?'{MAIN}/en/':'{MAIN}/'+lang+'/'"),
    ]:
        s = s.replace(old, new)
    out = DIST / f"owners-{lang}"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    (out / "index.html").write_text(s)
    for a in ASSETS:
        src = ROOT / a
        if src.exists():
            (out / a).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, out / a)
    pdf = ROOT / "owners" / f"checklist-{lang}.pdf"
    (out / "owners").mkdir(exist_ok=True)
    shutil.copy2(pdf, out / "owners" / pdf.name)
    shutil.copy2(ROOT / "_headers", out / "_headers")
    red = ["/owners/  /  301"] + [f"/{p}/*  {MAIN}/{p}/:splat  301" for p in OTHER_PAGES]
    (out / "_redirects").write_text("\n".join(red) + "\n")
    (out / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {url}sitemap.xml\n")
    (out / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.w3.org/1999/xhtml" '
        'xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n' if False else
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{url}</loc></url></urlset>\n')
    print("built", out, "->", url)


if __name__ == "__main__":
    for lang in SITES:
        build(lang)
