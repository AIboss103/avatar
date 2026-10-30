#!/usr/bin/env python3
"""Build the language pages of restate.deals: /en/, /es/, /ru/.

real-estate-developers/index.html stays the only source. This script copies it to
real-estate-developers/{en,es,ru}/index.html and only swaps the <head> tags
(lang, title, description, canonical, Open Graph, Twitter). The page picks its
language from the path, so the copies need no other changes.

Run after every edit of real-estate-developers/index.html:
    python3 scripts/build_restate_lang.py
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "real-estate-developers"
SITE = "https://restate.deals"

META = {
    "en": dict(
        locale="en_US", image="og.jpg",
        title="Restate Deals | Sell Panama Apartments to Crypto &amp; US Buyers",
        desc="Sell Panama apartments to verified crypto and US buyers with $300k+ for the Investor Visa. AI outreach, ads, PR and VIP tours. USDT payments, no hidden margin.",
        og_title="Restate Deals: sell Panama apartments to crypto &amp; US buyers in 90 days",
        og_desc="Verified $300k+ buyers for the Panama Investor Visa. USDT payment to bank. 10+ qualified buyers a month or +1 month free.",
        tw_desc="Verified $300k+ buyers for the Panama Investor Visa. USDT payment to bank. No hidden margin.",
    ),
    "es": dict(
        locale="es_PA", image="og-es.jpg",
        title="Restate Deals | Venda apartamentos en Panamá a compradores crypto y de EE.UU.",
        desc="Venda apartamentos en Panamá a compradores verificados del mundo crypto y de EE.UU. con $300k+ para la Visa de Inversionista. Outreach con IA, anuncios, PR y tours VIP. Pagos en USDT, sin márgenes ocultos.",
        og_title="Restate Deals: venda apartamentos en Panamá a compradores crypto y de EE.UU. en 90 días",
        og_desc="Compradores verificados con $300k+ para la Visa de Inversionista de Panamá. Pago en USDT a su banco. 10+ compradores calificados al mes o +1 mes gratis.",
        tw_desc="Compradores verificados con $300k+ para la Visa de Inversionista de Panamá. Pago en USDT a su banco. Sin márgenes ocultos.",
    ),
    "ru": dict(
        locale="ru_RU", image="og-ru.jpg",
        title="Restate Deals | Продажа квартир в Панаме крипто-покупателям и клиентам из США",
        desc="Продаём квартиры застройщиков Панамы проверенным покупателям из крипты и США с $300k+ под инвесторскую визу. AI-аутрич, реклама, PR и VIP-туры. Оплата в USDT, без скрытой маржи.",
        og_title="Restate Deals: продаём квартиры в Панаме крипто-покупателям и клиентам из США за 90 дней",
        og_desc="Проверенные покупатели с $300k+ под инвесторскую визу Панамы. Оплата в USDT на банковский счёт. 10+ квалифицированных покупателей в месяц или +1 месяц бесплатно.",
        tw_desc="Проверенные покупатели с $300k+ под инвесторскую визу Панамы. Оплата в USDT на банковский счёт. Без скрытой маржи.",
    ),
}


def sub1(pattern, repl, s):
    out, n = re.subn(pattern, lambda m: repl, s, count=1)
    if n != 1:
        sys.exit(f"pattern not found: {pattern}")
    return out


def build(src, lang):
    m, url = META[lang], f"{SITE}/{lang}/"
    s = src
    s = sub1(r'<html lang="[a-z]+">', f'<html lang="{lang}">', s)
    s = sub1(r"<title>.*?</title>", f"<title>{m['title']}</title>", s)
    s = sub1(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{m["desc"]}">', s)
    s = sub1(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', s)
    s = sub1(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', s)
    s = sub1(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{m["og_title"]}">', s)
    s = sub1(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{m["og_desc"]}">', s)
    s = sub1(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{SITE}/{m["image"]}">', s)
    s = sub1(r'<meta name="twitter:image" content="[^"]*">', f'<meta name="twitter:image" content="{SITE}/{m["image"]}">', s)
    s = sub1(r'<meta property="og:image:alt" content="[^"]*">', f'<meta property="og:image:alt" content="{m["og_title"]}">', s)
    s = sub1(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{m["og_title"]}">', s)
    s = sub1(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{m["tw_desc"]}">', s)
    # Open Graph locale: this language first, the other two as alternates
    others = [META[o]["locale"] for o in META if o != lang]
    s = sub1(r'<meta property="og:locale" content="[^"]*">\s*<meta property="og:locale:alternate" content="[^"]*">\s*<meta property="og:locale:alternate" content="[^"]*">',
             f'<meta property="og:locale" content="{m["locale"]}">\n<meta property="og:locale:alternate" content="{others[0]}">\n<meta property="og:locale:alternate" content="{others[1]}">', s)
    s = s.replace("<!doctype html>", "<!doctype html>\n<!-- Generated by scripts/build_restate_lang.py from ../index.html. Do not edit. -->", 1)
    return s


src = (ROOT / "index.html").read_text()
for lang in META:
    d = ROOT / lang
    d.mkdir(exist_ok=True)
    (d / "index.html").write_text(build(src, lang))
    print("built", d / "index.html")
