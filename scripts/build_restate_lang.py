#!/usr/bin/env python3
"""Build the language pages of restate.deals and the A/B test pages.

real-estate-developers/index.html stays the only source. This script copies it and only swaps
the <head> tags (lang, title, description, canonical, Open Graph, Twitter, A/B variant):
  /en/ /es/ /ru/                       variant B: no prices (the main page)
  /price/ /en/price/ /es/price/ /ru/price/   variant A: with prices, noindex (same content, ads only)
The page picks its language from the path and its variant from <html data-variant>.

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
        desc="Sell Panama apartments to crypto and US buyers with $500k+ for the Investor Visa. AI outreach, ads, PR and VIP tours. USDT payments, no hidden margin.",
        og_title="Restate Deals: sell Panama apartments to crypto &amp; US buyers in 45 days",
        og_desc="Buyers targeted at $500k+ for the Panama Investor Visa. USDT payment to bank. A guaranteed number of started WhatsApp chats in 45 days, measured in Ads Manager.",
        og_desc_b="Buyers targeted at $500k+ for the Panama Investor Visa. USDT payment to bank. Guaranteed WhatsApp chats in 45 days.",
        tw_desc="Buyers targeted at $500k+ for the Panama Investor Visa. USDT payment to bank. No hidden margin.",
    ),
    "es": dict(
        locale="es_PA", image="og-es.jpg",
        title="Restate Deals | Venda apartamentos en Panamá a compradores crypto y de EE.UU.",
        desc="Venda apartamentos en Panamá a compradores del mundo crypto y de EE.UU. con $500k+ para la Visa de Inversionista. Outreach con IA, anuncios, PR y tours VIP. Pagos en USDT, sin márgenes ocultos.",
        og_title="Restate Deals: venda apartamentos en Panamá a compradores crypto y de EE.UU. en 45 días",
        og_desc="Compradores objetivo con $500k+ para la Visa de Inversionista de Panamá. Pago en USDT a su banco. Una cantidad garantizada de chats iniciados en WhatsApp en 45 días, medidos en Ads Manager.",
        og_desc_b="Compradores objetivo con $500k+ para la Visa de Inversionista de Panamá. Pago en USDT a su banco. Chats de WhatsApp garantizados en 45 días.",
        tw_desc="Compradores objetivo con $500k+ para la Visa de Inversionista de Panamá. Pago en USDT a su banco. Sin márgenes ocultos.",
    ),
    "ru": dict(
        locale="ru_RU", image="og-ru.jpg",
        title="Restate Deals | Продажа квартир в Панаме крипто-покупателям и клиентам из США",
        desc="Продаём квартиры застройщиков Панамы покупателям из крипты и США с $500k+ под инвесторскую визу. AI-аутрич, реклама, PR и VIP-туры. Оплата в USDT, без скрытой маржи.",
        og_title="Restate Deals: продаём квартиры в Панаме крипто-покупателям и клиентам из США за 45 дней",
        og_desc="Покупатели с целевым бюджетом $500k+ под инвесторскую визу Панамы. Оплата в USDT на банковский счёт. Гарантированное число начатых чатов в WhatsApp за 45 дней по данным Ads Manager.",
        og_desc_b="Покупатели с целевым бюджетом $500k+ под инвесторскую визу Панамы. Оплата в USDT на банковский счёт. Гарантированные чаты в WhatsApp за 45 дней.",
        tw_desc="Покупатели с целевым бюджетом $500k+ под инвесторскую визу Панамы. Оплата в USDT на банковский счёт. Без скрытой маржи.",
    ),
}


def sub1(pattern, repl, s):
    out, n = re.subn(pattern, lambda m: repl, s, count=1)
    if n != 1:
        sys.exit(f"pattern not found: {pattern}")
    return out


def build(src, lang, variant="b", path=None):
    m = META[lang]
    url = f"{SITE}/{path if path is not None else lang + '/'}"
    og_desc = m["og_desc"] if variant == "a" else m["og_desc_b"]
    s = src
    s = sub1(r'<html lang="[a-z]+" data-variant="[ab]">', f'<html lang="{lang}" data-variant="{variant}">', s)
    if variant == "a":
        s = sub1(r'<meta name="robots" content="[^"]*">', '<meta name="robots" content="noindex, follow">', s)
    s = sub1(r"<title>.*?</title>", f"<title>{m['title']}</title>", s)
    s = sub1(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{m["desc"]}">', s)
    s = sub1(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', s)
    s = sub1(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', s)
    s = sub1(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{m["og_title"]}">', s)
    s = sub1(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{og_desc}">', s)
    s = sub1(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{SITE}/{m["image"]}">', s)
    s = sub1(r'<meta name="twitter:image" content="[^"]*">', f'<meta name="twitter:image" content="{SITE}/{m["image"]}">', s)
    s = sub1(r'<meta property="og:image:alt" content="[^"]*">', f'<meta property="og:image:alt" content="{m["og_title"]}">', s)
    s = sub1(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{m["og_title"]}">', s)
    s = sub1(r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{m["tw_desc"]}">', s)
    # Open Graph locale: this language first, the other two as alternates
    others = [META[o]["locale"] for o in META if o != lang]
    s = sub1(r'<meta property="og:locale" content="[^"]*">\s*<meta property="og:locale:alternate" content="[^"]*">\s*<meta property="og:locale:alternate" content="[^"]*">',
             f'<meta property="og:locale" content="{m["locale"]}">\n<meta property="og:locale:alternate" content="{others[0]}">\n<meta property="og:locale:alternate" content="{others[1]}">', s)
    s = s.replace("<!doctype html>", "<!doctype html>\n<!-- Generated by scripts/build_restate_lang.py from real-estate-developers/index.html. Do not edit. -->", 1)
    return s


def write(rel, html):
    f = ROOT / rel / "index.html"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(html)
    print("built", f)


src = (ROOT / "index.html").read_text()
for lang in META:
    write(lang, build(src, lang))                                   # B: /en/ /es/ /ru/
    write(f"{lang}/price", build(src, lang, "a", f"{lang}/price/"))  # A: /en/price/ ...
write("price", build(src, "en", "a", "price/"))                     # A: /price/ (language picked in the browser)
