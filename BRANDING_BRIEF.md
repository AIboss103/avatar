# TASK FOR CLAUDE CODE: RESTATE DEALS BRAND IDENTITY

Goal: build a complete, consistent brand kit for **Restate Deals** and save every file in this repository under `brand/`. The live site (`real-estate-developers/index.html`) already uses the colors and fonts below. The brand kit must match it, then the site is updated to use the final logo files.

---

## 1. The brand in one paragraph

Restate Deals finds verified crypto and US buyers ($300k+) for luxury real estate developers in Panama and helps close the sale, with payment in USDT/USDC to the developer's bank. It is run on the ground in Panama City by Artem Voinov (CBDO at ICODA.io and STIVE.ai). Clients are owners, commercial directors and sales heads of developers in Costa del Este, Santa María, Ocean Reef, Punta Pacífica and Casco Viejo.

- **Domain:** restate.deals
- **Languages:** English (primary), Spanish, Russian
- **Promise:** sell apartments to crypto and US buyers in 90 days
- **Proof points:** 50+ specialists, only 3 developers per month, no hidden margin, guarantee (we hit the meeting goal or +1 month free), crypto-only payment

## 2. Personality and voice

| We are | We are not |
|---|---|
| Direct, short sentences, plain words | Corporate jargon ("inventory", "synergy", "leverage") |
| Confident, numbers first | Hype, exclamation marks, emoji in brand assets |
| Premium and calm, like a private bank | Flashy "crypto bro" style, neon, rockets |
| Transparent about money | Vague promises about ROI |

Taglines (use as written):

- EN: **Sell to crypto buyers. Close in 90 days.**
- ES: **Venda a compradores crypto. Cierre en 90 días.**
- RU: **Продавайте крипто-покупателям. Закрывайте сделки за 90 дней.**

Short descriptor under the logo: `Crypto & US buyers for Panama developers`

## 3. Logo

Create a wordmark plus a symbol.

**Symbol concept (pick the strongest, show all three in the guidelines page):**
1. **Skyline bars.** Three vertical bars of different heights on a baseline, like the current site icon (`real-estate-developers/favicon.svg`). Refine proportions and stroke.
2. **R + tower.** A geometric capital R whose stem is a tall tower with floor lines.
3. **Key + chain link.** A door key whose bit is a chain link, for "property + crypto".

**Wordmark:** "Restate" in Plus Jakarta Sans ExtraBold (800), "Deals" in Plus Jakarta Sans Medium (500) at about 60% of the size, muted color. Tight tracking (-0.02em). No other fonts in the logo.

**Rules:**
- Line weight of the symbol matches the stem weight of the wordmark.
- Minimum size: symbol 16 px, full logo 96 px wide.
- Clear space: the height of the "R" on every side.
- Never: gradients on the wordmark text, drop shadows, outlines, rotated or stretched logo, logo on busy photos without a dark overlay.

**Files to produce (SVG, outlined text, plus PNG at 1x/2x):**
```
brand/logo/restate-logo-horizontal-dark.svg   (gold symbol + light text, for dark backgrounds)
brand/logo/restate-logo-horizontal-light.svg  (dark text, for white backgrounds)
brand/logo/restate-logo-stacked-dark.svg
brand/logo/restate-symbol-gold.svg
brand/logo/restate-symbol-mono-black.svg
brand/logo/restate-symbol-mono-white.svg
brand/logo/png/...                            (all of the above as PNG, 1x and 2x)
```

## 4. Colors

Use exactly these tokens (they are already in the site CSS):

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0A0B0D` | Main background |
| `--bg2` | `#0E1013` | Alternate section background |
| `--surface` | `#13161A` | Cards |
| `--text` | `#F3EFE7` | Main text on dark |
| `--muted` | `#A29D93` | Secondary text |
| `--gold` | `#D6B073` | Brand accent, symbol, key numbers |
| `--gold2` | `#B8864B` | Darker bronze accent |
| Gold gradient | `#F1D9A8 → #D6B073 → #A8743D` | Only for one highlighted phrase or number per view |
| `--green` | `#7FD8A6` | Positive numbers, guarantee |
| `--red` | `#F08A8A` | Problems, negative numbers |
| WhatsApp | `#25D366` | Only for WhatsApp buttons |

Rule: dark backgrounds by default. Gold is an accent (about 10% of any layout), never a background for large areas.

## 5. Typography

- **Display / headings:** Plus Jakarta Sans 700–800, tracking -0.03em, `text-wrap: balance`.
- **Body / UI:** Inter 400–600.
- **Numbers:** Plus Jakarta Sans 800, tabular figures.
- No serif fonts anywhere.
- Scale: 56 / 40 / 28 / 20 / 16 / 13 px (desktop). On mobile, headings scale down with `clamp()`.

## 6. Graphic language

- **Hero object:** the live 3D gold-wireframe skyline (Three.js) from the site. Export three still renders at 2400×2400 for social and print: front, 3/4 view and top-down (`brand/renders/`).
- **Lines:** 1–1.6 px hairlines in gold at 35% opacity for frames, corners and dividers.
- **Icons:** Lucide line icons, stroke 1.6, gold or muted. No emoji, no filled icon sets, no 3D cartoon icons.
- **Photos:** real Panama City skyline at dusk or night, desaturated, with a 60% dark overlay and gold accents. Founder photo: square crop, white or neutral background.
- **Data chips:** small dark cards with a flag icon, a bold line and a muted line (as in the site hero), used to show deals ("Buyer · Miami, $650k apartment, Paid in USDT").

## 7. Deliverables

Create every item below as an editable source (HTML/SVG) and an exported PNG or PDF.

| # | Item | Size | Path |
|---|---|---|---|
| 1 | Logo set | see section 3 | `brand/logo/` |
| 2 | Favicon set (ico, svg, 16, 32, 180, 192, 512) + `site.webmanifest` | standard | `brand/favicon/` and copy into `real-estate-developers/` |
| 3 | OG image template, one per language | 1200×630 | `brand/social/og-en.jpg`, `og-es.jpg`, `og-ru.jpg` |
| 4 | Telegram / WhatsApp / X avatar | 1024×1024 | `brand/social/avatar.png` |
| 5 | LinkedIn / X cover | 1584×396 and 1500×500 | `brand/social/` |
| 6 | Instagram post template (case result: big number + project) | 1080×1350 | `brand/social/post-case.html` + PNG |
| 7 | Instagram story template ("1 spot left this month") | 1080×1920 | `brand/social/story-capacity.html` + PNG |
| 8 | Business card, front and back | 90×50 mm, PDF with 3 mm bleed | `brand/print/business-card.pdf` |
| 9 | Email signature (HTML, tested in Gmail) | 600 px wide | `brand/email/signature.html` |
| 10 | Pitch deck cover + one content slide | 1920×1080 | `brand/deck/` |
| 11 | One-page proposal (PDF) with the 3 plans | A4 | `brand/print/one-pager.pdf` |
| 12 | Brand guidelines page | responsive HTML | `brand/index.html` |

The brand guidelines page (`brand/index.html`) shows: logo variants with clear space, colors with hex values and copy buttons, type scale, icon style, do/don't examples, taglines in EN/ES/RU, and previews of every deliverable with download links.

## 8. Content for templates

- Founder: **Artem Voinov**, Founder & CEO, CBDO at ICODA.io and STIVE.ai. Telegram blog with 7,000+ professionals: t.me/artofwar. Site: voinov.io.
- WhatsApp: +507 6456 6336
- Calendly: https://calendly.com/voinov-agency/real-estate-deals-ceo
- Plans: Starter $3,000/mo (promo, was $5,000), Growth $6,500/mo, Enterprise $12,000/mo. Success fee 2% on sales + 30% of net profit from VIP tours. Goals 5+ / 10+ / 25+ verified buyer meetings per month. Guarantee: we hit it or +1 month free. Budgets for ads, services and freelancers are paid separately. Payment in crypto only (USDT / USDC).
- Capacity: only 3 developers per month.
- Partners line: STIVE.ai, ICODA.io (always uppercase brand names: ICODA, STIVE).

## 9. Acceptance checklist

- [ ] Every logo SVG has outlined text and opens correctly without fonts installed.
- [ ] The symbol is readable at 16×16 px (check the favicon in a browser tab).
- [ ] Contrast: body text vs background is at least 4.5:1; gold text on `#0A0B0D` is used only for 18 px+ or bold text.
- [ ] All three OG images are 1200×630, under 300 KB, and text stays inside a 1100×530 safe area.
- [ ] Templates exist in EN, ES and RU where they contain copy.
- [ ] No serif fonts, no emoji, no neon colors, no stock "bitcoin coin" imagery.
- [ ] The site (`real-estate-developers/index.html`) uses the new logo SVG in the header and footer and the new favicon set, and still passes the mobile layout check at 320–1920 px.
- [ ] `brand/index.html` links to every file.
