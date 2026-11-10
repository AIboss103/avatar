#!/usr/bin/env python3
"""Build the EN and RU copies of restate.deals/owners.

real-estate-developers/owners/index.html (Spanish) stays the only source. This script writes
  real-estate-developers/owners/en/index.html  (English)
  real-estate-developers/owners/ru/index.html  (Russian)
with their own <html lang>, title, description, canonical, Open Graph / Twitter tags and link-preview image,
and with the page text already translated in the HTML (taken from the page's I18N dictionary), so the
right language shows before any JavaScript runs and search engines index each language.

Run after every edit of real-estate-developers/owners/index.html:
    python3 scripts/build_owners_lang.py
"""
import json, pathlib, re, sys, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent / "real-estate-developers"
SITE = "https://restate.deals"
SRC = ROOT / "owners" / "index.html"

META = {
    "en": dict(
        url=f"{SITE}/owners/en/", locale="en_US", image=f"{SITE}/img/og-owners-en.jpg",
        title="Sell your property in Panama without paying a 5% commission | Restate Deals",
        desc="45-day marketing sprints for ONE property in Panama: Meta Ads, Google Ads, creatives and a landing page. From $900 per sprint, no commission, qualified buyers guaranteed.",
        og_title="Sell your property in Panama without paying a 5% commission",
        og_desc="Meta Ads + Google Ads for ONE property. From $900 per sprint, no commission. Qualified buyers guaranteed.",
    ),
    "ru": dict(
        url=f"{SITE}/owners/ru/", locale="ru_RU", image=f"{SITE}/img/og-owners-ru.jpg",
        title="Продайте недвижимость в Панаме без комиссии 5% | Restate Deals",
        desc="Спринты по 45 дней маркетинга для ОДНОГО объекта в Панаме: Meta Ads, Google Ads, креативы и лендинг. От $900 за спринт, без комиссии, квалифицированные покупатели с гарантией.",
        og_title="Продайте недвижимость в Панаме без комиссии 5%",
        og_desc="Meta Ads + Google Ads для ОДНОГО объекта. От $900 за спринт, без комиссии. Квалифицированные покупатели с гарантией.",
    ),
}


def sub1(pattern, repl, s, flags=0):
    out, n = re.subn(pattern, lambda m: repl, s, count=1, flags=flags)
    if n != 1:
        sys.exit(f"pattern not found: {pattern}")
    return out


def dictionary(src, lang):
    """The {key: text} object for one language from `const I18N={ es:{...}, en:{...}, ru:{...} }`."""
    start = src.index(f"\n{lang}:{{") + len(f"\n{lang}:")
    end = src.index("}", src.index('"lname"', start)) + 1
    return json.loads(src[start:end])


def translate(s, D):
    # plain-text elements: data-i="key"
    def plain(m):
        k = m.group(3)
        return m.group(1) + (esc(D[k]) if k in D else m.group(4)) + m.group(5)
    s = re.sub(r'(<(\w+)\b[^>]*\bdata-i="([^"]+)"[^>]*>)([^<]*)(</\2>)', plain, s)
    # elements with markup inside: data-ih="key"
    def rich(m):
        k = m.group(3)
        return m.group(1) + (D[k] if k in D else m.group(4)) + m.group(5)
    s = re.sub(r'(<(\w+)\b[^>]*\bdata-ih="([^"]+)"[^>]*>)(.*?)(</\2>)', rich, s, flags=re.S)
    # aria-labels: data-ia="key"
    def aria(m):
        tag = m.group(0); k = m.group(1)
        if k in D:
            tag = re.sub(r'aria-label="[^"]*"', f'aria-label="{esc(D[k])}"', tag)
        return tag
    s = re.sub(r'<[^>]*\bdata-ia="([^"]+)"[^>]*>', aria, s)
    return s


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build(src, lang):
    m, D, es = META[lang], dictionary(src, lang), dictionary(src, "es")
    s = src
    s = sub1(r'<html lang="es" data-lang="es">', f'<html lang="{lang}" data-lang="{lang}">', s)
    s = sub1(r"<title>.*?</title>", f"<title>{m['title']}</title>", s)
    s = sub1(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{m["desc"]}">', s)
    s = sub1(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{m["url"]}">', s)
    s = sub1(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{m["url"]}">', s)
    s = sub1(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{m["og_title"]}">', s)
    s = sub1(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{m["og_desc"]}">', s)
    s = sub1(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{m["image"]}">', s)
    s = sub1(r'<meta property="og:locale" content="[^"]*">', f'<meta property="og:locale" content="{m["locale"]}">', s)
    s = sub1(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{m["og_title"]}">', s)
    s = sub1(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{m["og_desc"]}">', s)
    s = sub1(r'<meta name="twitter:image" content="[^"]*">', f'<meta name="twitter:image" content="{m["image"]}">', s)
    # language switch: the current page is marked
    s = s.replace('data-l="es" aria-current="page"', 'data-l="es"', 1)
    s = s.replace(f'data-l="{lang}">', f'data-l="{lang}" aria-current="page">', 1)
    # WhatsApp links in the HTML carry this language's message (the script sets the same on load)
    s = s.replace(urllib.parse.quote(es["wa"], safe=""), urllib.parse.quote(D["wa"], safe=""))
    if "ck.wa" in D:
        s = s.replace(urllib.parse.quote(es["ck.wa"], safe=""), urllib.parse.quote(D["ck.wa"], safe=""))
    # privacy link: Spanish policy only on the Spanish page
    s = s.replace('<a id="priv" href="/es/privacidad/"', '<a id="priv" href="/privacy/"', 1)
    s = translate(s, D)
    # static discount line (the script rewrites it on load): same text in this language
    s = s.replace(es["c.disc"].replace("{x}", "$15,000"), D["c.disc"].replace("{x}", "$15,000"), 1)
    s = s.replace("<!doctype html>", "<!doctype html>\n<!-- Generated by scripts/build_owners_lang.py from real-estate-developers/owners/index.html. Do not edit. -->", 1)
    return s


src = SRC.read_text()
for lang in META:
    out = ROOT / "owners" / lang / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(build(src, lang))
    print("built", out)
