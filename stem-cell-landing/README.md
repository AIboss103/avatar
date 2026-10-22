# RegenScale — Landing page for Panama stem cell clinics

B2B landing page (EN / ES) for a marketing agency that serves stem cell & regenerative medicine clinics in Panama. Powered by Triton, Stive.ai, iCoda.io.

**Stack:** static HTML + CSS + vanilla JS. No build step, no framework, no raster images (the 3D DNA is drawn on a Canvas, icons are inline SVG), which keeps PageSpeed high.

## Structure

```
stem-cell-landing/
  index.html          all six blocks: Hero, Problem + chart, Packages, Calculator, Cases, Contact/Checkout
  thanks.html         fallback page after a form submit when JS is off
  assets/styles.css   design system (Inter + Plus Jakarta Sans, sans-serif only)
  assets/app.js       i18n, 3D DNA canvas, chart, calculator, checkout modal, form
  assets/i18n.js      Spanish strings (the English text lives in index.html)
  assets/config.js    payment / booking / brand links (edit this before launch)
```

## Before launch: `assets/config.js`

| Key | What to set |
| --- | --- |
| `bookingUrl` | Calendly / Cal.com link. If empty, "Book a Call" scrolls to the form. |
| `stripe.starter / standard / maximum` | Stripe **Payment Links** (turn on Apple Pay / Google Pay in Stripe). If empty, the user goes to the form. |
| `crypto.usdt / btc / eth` | Wallet addresses (USDT on TRC20, BTC, ETH on ERC20). If empty, the address box is hidden and the user is asked to request it. |
| `brands.triton` | Triton URL (Stive.ai and iCoda.io are already set). |
| `email` | Fallback email shown if the form fails to submit. |

The brand name "RegenScale" is a placeholder. Search and replace it in `index.html`, `thanks.html` and `assets/i18n.js`.

## Language

- An EN | ES toggle in the header. The choice is saved in `localStorage`.
- `?lang=es` (or `/es` on Netlify) opens the Spanish version directly. On a first visit the language follows the browser.

## Deploy to Netlify (CI/CD)

1. Netlify → **Add new site → Import an existing project → GitHub** → choose this repo.
2. Build settings come from `/netlify.toml` at the repo root: publish dir `stem-cell-landing`, no build command.
3. Every push to the production branch deploys automatically, and every PR gets a Deploy Preview.
4. **Domain management → Add custom domain.** Netlify issues the SSL certificate (Let's Encrypt) automatically.
5. **Forms:** the `strategy-call` form is picked up automatically (Netlify Forms). Turn on email notifications under Site → Forms → Notifications.

`netlify.toml` also sets security headers (HSTS, nosniff, frame-deny) and long cache lifetimes for `/assets/*`.

## Local preview

```
cd stem-cell-landing && python3 -m http.server 8080
```
Form submits only work on Netlify. Locally they show an error message, which is expected.
