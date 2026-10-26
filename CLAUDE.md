# Project rules (restate.deals and related sites)

These come from the site owner (Artem Voinov) and apply to every page.

## Writing
- Use simple, plain words. Short sentences. Say concretely what the client gets.
- No jargon headlines ("distribution hub", "infrastructure") as the main message; if used, explain in plain words next to it.
- No exclamation marks. No made-up cases or numbers. Keep copy short: less text, more pictures.
- Owner-approved on restate.deals: Starter promo (struck $5,000 -> $3,000), "we take only 3 projects, 2 taken" block, the "+1 month free" guarantee, calculator showing net profit as 5% of extra sales in green.
- Speak in the first person ("I") on the personal funnel demo; restate.deals uses "we".
- Every text exists in EN, ES and RU through the I18N dictionaries.
- Booking: Calendly inline widget in the dark theme (contact section), loaded lazily.

## Design
- Illustrate as much as possible: every benefit card, step and section gets its own illustration (inline SVG, gold line style #d6b073 on the dark surface).
- One visual system everywhere, from the brand identity: bg #0A0B0D, surface #13161A, text #F3EFE7, muted #A29D93, gold #D6B073 / #B8864B, green #7FD8A6, red #F08A8A; Plus Jakarta Sans 700–800 for headings and numbers, Inter 400–600 for body; 24px card radius.
- Logo files: real-estate-developers/img/brand/ (horizontal dark/light, stacked, symbol).
- Check every change at 320–1920 px (no horizontal scroll, tap targets 44px+).

## Prices
- All prices live only in CONFIG.pricing in real-estate-developers/index.html.

## Deploy
- Site source: real-estate-developers/ on branch dental-clinics-site.
- Language pages /en/ /es/ /ru/ are copies of real-estate-developers/index.html with their own head tags. After every edit of index.html run `python3 scripts/build_restate_lang.py` and deploy the en/ es/ ru/ folders too. Never edit those copies by hand.
- WhaleHome (panama-crypto-homes/, branch demo-site, whalehome.io): same pattern, run `python3 scripts/build_whalehome_lang.py` after editing its index.html and deploy en/ es/ ru/.
- restate.deals deploys from branch restate-site (site files at the branch root) through Cloudflare Pages. Never force-push it.
