// Creatives for the owners offer (restate.deals/owners): minimalist, one idea per image.
// Run: node creatives/owners-offer/build.mjs "<output folder>"
// Needs playwright-core and a Chromium (cached by Playwright) and ffmpeg (from ~/icoda_video).
import { chromium } from '/Users/voinov/icoda_video/node_modules/playwright-core/index.mjs';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';

const OUT = process.argv[2] || path.join(os.homedir(), 'Desktop', 'Restate Deals - Owners offer');
const CHROMIUM = path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const FFMPEG = path.join(os.homedir(), 'icoda_video/ffmpeg');
const PHONE = '+507 6718 5938';

// ---------------------------------------------------------------- copy
const L = {
  es: {
    dir: '01_Creativos_ES', kicker: 'PROPIETARIOS EN PANAMÁ',
    house: 'Casa', land: 'Terreno', prop: 'Propiedad',
    h1: 'Compradores en tu WhatsApp', big: '45 días',
    guar: 'Garantía: chats iniciados en WhatsApp, medidos en Ads Manager',
    cta: 'Postular mi propiedad', foot: 'Sin comisión · Sin exclusividad · Cupos limitados',
    cmpTitle: 'Vender con agencia o con nosotros', agency: 'Agencia', us: 'Restate Deals',
    agencyItems: ['7–8 meses en promedio', '−6% bajo el precio publicado', '5% de comisión + 7% de ITBMS', 'Atención dividida entre muchas propiedades'],
    usItems: ['45 días por sprint', 'Precio fijo desde $900, sin comisión', 'Chats de compradores en tu WhatsApp', 'Foco en UNA propiedad: la tuya'],
    cmpNote: 'Corredor: ACOBIR MLS, 1.er semestre 2026. Garantizamos chats iniciados, no ventas.',
    c1: '¿Vendes tu casa, terreno o propiedad en Panamá?', swipe: 'Desliza',
    c2t: 'El camino de siempre', c2b: '7–8 meses', c2s: 'en promedio para vender con corredor',
    c3t: 'Y además cuesta', c3a: '−6%', c3as: 'bajo el precio publicado al cerrar', c3b: '5% + 7%', c3bs: 'comisión + ITBMS sobre la comisión',
    c3ex: 'Casa de $400,000', c3exv: '$21,400 en comisión',
    c4t: 'Otra forma: sprints de 45 días', steps: ['Nos envías fotos y datos', 'Lanzamos Meta Ads y Google Ads', 'Los chats llegan a tu WhatsApp'],
    c5t: 'Precio fijo, chats garantizados', plans: [['Small', 'hasta $250k', '$900', '$900', '80'], ['Mid', '$250–600k', '$1,500', '$1,800', '150'], ['Premium', 'desde $600k', '$2,500', '$3,000', '200']],
    work: 'trabajo', ads: 'publicidad', chats: 'chats iniciados', c5n: 'La publicidad la pagas tú directo a Meta y Google.',
    c6t: 'Cupos limitados cada mes', c6s: 'Primero vemos si encajamos. Luego confirmamos tu lugar.',
    r1: '¿Vendes una casa, un terreno o una propiedad?', r2: 'Agencia', r3: 'Nosotros', r4: 'Garantía', r5: 'Si no llegamos al número, la publicidad sigue gratis hasta alcanzarlo.',
    agencyShort: ['7–8 meses', '−6% del precio', '5% + 7% ITBMS'], usShort: ['45 días', 'Sin comisión', 'Chats en tu WhatsApp'],
    reelsTop: 'Chats iniciados garantizados', limited: 'Cupos limitados cada mes',
  },
  en: {
    dir: '02_Creatives_EN', kicker: 'OWNERS IN PANAMA',
    house: 'House', land: 'Land', prop: 'Property',
    h1: 'Buyer chats in your WhatsApp', big: '45 days',
    guar: 'Guarantee: started WhatsApp chats, measured in Ads Manager',
    cta: 'Apply with my property', foot: 'No commission · No exclusivity · Limited spots',
    cmpTitle: 'Selling with an agency or with us', agency: 'Agency', us: 'Restate Deals',
    agencyItems: ['7–8 months on average', '−6% below the listing price', '5% commission + 7% ITBMS', 'Attention split across many properties'],
    usItems: ['45 days per sprint', 'Fixed fee from $900, no commission', 'Buyer chats in your WhatsApp', 'Focus on ONE property: yours'],
    cmpNote: 'Broker data: ACOBIR MLS, first half of 2026. We guarantee started chats, not sales.',
    c1: 'Selling your house, land or property in Panama?', swipe: 'Swipe',
    c2t: 'The usual way', c2b: '7–8 months', c2s: 'on average to sell with a broker',
    c3t: 'And it costs more', c3a: '−6%', c3as: 'below the listing price at closing', c3b: '5% + 7%', c3bs: 'commission + ITBMS on the commission',
    c3ex: '$400,000 house', c3exv: '$21,400 in commission',
    c4t: 'Another way: 45-day sprints', steps: ['You send photos and details', 'We launch Meta Ads and Google Ads', 'Chats land in your WhatsApp'],
    c5t: 'Fixed price, guaranteed chats', plans: [['Small', 'up to $250k', '$900', '$900', '80'], ['Mid', '$250–600k', '$1,500', '$1,800', '150'], ['Premium', 'from $600k', '$2,500', '$3,000', '200']],
    work: 'work', ads: 'ads', chats: 'started chats', c5n: 'You pay the ads directly to Meta and Google.',
    c6t: 'Limited spots every month', c6s: 'First we check if we fit. Then we confirm your spot.',
    r1: 'Selling a house, land or property?', r2: 'Agency', r3: 'Us', r4: 'Guarantee', r5: 'If we miss the number, the ads keep running for free until we reach it.',
    agencyShort: ['7–8 months', '−6% off the price', '5% + 7% ITBMS'], usShort: ['45 days', 'No commission', 'Chats in your WhatsApp'],
    reelsTop: 'Guaranteed started chats', limited: 'Limited spots every month',
  },
};

// ---------------------------------------------------------------- icons (gold line style)
const G = '#D6B073', GR = '#7FD8A6', RD = '#F08A8A';
const svg = (inner, w = 120, stroke = G, sw = 4) => `<svg viewBox="0 0 100 100" width="${w}" height="${w}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const ICON = {
  house: (w, c) => svg('<path d="M10 52 50 18 90 52"/><path d="M20 46v40h60V46"/><path d="M42 86V62h16v24"/>', w, c),
  land: (w, c) => svg('<path d="M10 74 50 58 90 74 50 90Z"/><path d="M50 58V22l20 8-20 8"/><path d="M26 66v-8M74 66v-8"/>', w, c),
  prop: (w, c) => svg('<path d="M26 90V16h48v74Z"/><path d="M36 30h8M56 30h8M36 46h8M56 46h8M36 62h8M56 62h8"/><path d="M44 90V76h12v14"/>', w, c),
  chat: (w, c) => svg('<path d="M50 12a36 36 0 1 1-18 67L12 88l8-19A36 36 0 0 1 50 12Z"/><path d="M36 38c0 14 12 26 26 26l6-6-8-5-5 4c-5-2-9-6-11-11l4-5-5-8Z"/>', w, c),
  clock: (w, c) => svg('<circle cx="50" cy="50" r="36"/><path d="M50 28v24l16 10"/>', w, c),
  check: (w, c) => svg('<path d="M20 52 42 74 80 28"/>', w, c || GR, 9),
  cross: (w, c) => svg('<path d="M24 24 76 76M76 24 24 76"/>', w, c || RD, 9),
  arrow: (w, c) => svg('<path d="M14 50h66M56 26l24 24-24 24"/>', w, c, 7),
};

// ---------------------------------------------------------------- shared css
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
:root{--bg:#0A0B0D;--surface:#13161A;--surface2:#1A1D22;--text:#F3EFE7;--muted:#A29D93;--gold:#D6B073;--gold2:#B8864B;--green:#7FD8A6;--red:#F08A8A;--line:rgba(255,255,255,.1)}
*{box-sizing:border-box;margin:0}
html,body{background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.d{font-family:'Plus Jakarta Sans',Inter,sans-serif}
.cv{position:relative;overflow:hidden;background:radial-gradient(90% 55% at 50% 0%,rgba(214,176,115,.16),transparent 70%),var(--bg);display:flex;flex-direction:column}
.gold{color:var(--gold)}.green{color:var(--green)}.red{color:var(--red)}.mut{color:var(--muted)}
.kick{font:700 26px/1 'Plus Jakarta Sans';letter-spacing:.2em;color:var(--gold)}
.btn{display:inline-flex;align-items:center;gap:16px;padding:30px 52px;border-radius:26px;background:linear-gradient(135deg,#E6C58F,#B8864B);color:#1a1307;font:800 38px/1 'Plus Jakarta Sans'}
.btn.wa{background:#4be37f;color:#06240f}
.row{display:flex}.col{display:flex;flex-direction:column}.c{align-items:center;text-align:center}
.pill{display:inline-flex;align-items:center;gap:14px;padding:16px 26px;border:1.5px solid rgba(214,176,115,.4);border-radius:999px;font:700 28px/1 'Plus Jakarta Sans';color:var(--gold)}
.brand{font:800 30px/1 'Plus Jakarta Sans';letter-spacing:-.01em}.brand i{font-style:normal;color:var(--gold2);font-weight:600}
.card{background:var(--surface);border:1.5px solid var(--line);border-radius:36px}
`;

const page = (w, h, body, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${extra}body{width:${w}px;height:${h}px}</style></head><body>${body}</body></html>`;
const brand = '<div class="brand">Restate<i> Deals</i></div>';

// ---------------------------------------------------------------- static creatives
function offer(t, w, h) {
  const story = h > 1500;
  return page(w, h, `<div class="cv c" style="width:${w}px;height:${h}px;padding:${story ? '150px 80px 130px' : '90px 80px 80px'};justify-content:space-between">
    <div class="col c" style="gap:30px">${brand}<div class="kick" style="margin-top:${story ? 20 : 0}px">${t.kicker}</div></div>
    <div class="row" style="gap:${story ? 70 : 54}px;justify-content:center">
      ${[['house', t.house], ['land', t.land], ['prop', t.prop]].map(([k, n]) => `<div class="col c" style="gap:22px">${ICON[k](story ? 190 : 170)}<div class="d" style="font-size:38px;font-weight:700">${n}</div></div>`).join('')}
    </div>
    <div class="col c" style="gap:${story ? 34 : 24}px">
      <h1 class="d" style="font-size:${story ? 108 : 94}px;line-height:1.04;font-weight:800;letter-spacing:-.025em">${t.h1}</h1>
      <div class="row c" style="gap:26px;align-items:center">${ICON.clock(96)}<div class="d gold" style="font-size:${story ? 150 : 128}px;font-weight:800;line-height:1">${t.big}</div></div>
      <div class="mut" style="font-size:34px;line-height:1.35;max-width:860px">${t.guar}</div>
    </div>
    <div class="col c" style="gap:30px"><div class="btn">${t.cta}${ICON.arrow(44, '#1a1307')}</div><div class="mut" style="font-size:28px">${t.foot}</div></div>
  </div>`);
}

function compare(t, w, h) {
  const col = (name, items, ok) => `<div class="card col" style="flex:1;padding:42px 34px;gap:26px;border-color:${ok ? 'rgba(127,216,166,.5)' : 'rgba(240,138,138,.35)'};${ok ? 'background:linear-gradient(160deg,#10231b,#13161A)' : ''}">
      <div class="d" style="font-size:46px;font-weight:800;color:${ok ? GR : '#d7d2c8'}">${name}</div>
      ${items.map(i => `<div class="row" style="gap:18px;align-items:flex-start"><div style="flex:none;margin-top:2px">${ok ? ICON.check(46) : ICON.cross(46)}</div><div style="font-size:34px;line-height:1.28;font-weight:${ok ? 600 : 500};color:${ok ? 'var(--text)' : '#cfc9bd'}">${i}</div></div>`).join('')}
    </div>`;
  return page(w, h, `<div class="cv" style="width:${w}px;height:${h}px;padding:80px 60px 70px;justify-content:space-between">
    <div class="col c" style="gap:26px">${brand}<h1 class="d" style="font-size:68px;line-height:1.08;font-weight:800;letter-spacing:-.02em">${t.cmpTitle}</h1></div>
    <div class="row" style="gap:26px;align-items:stretch">${col(t.agency, t.agencyItems, false)}${col(t.us, t.usItems, true)}</div>
    <div class="col c" style="gap:26px"><div class="btn">${t.cta}${ICON.arrow(44, '#1a1307')}</div><div class="mut" style="font-size:24px;max-width:900px;line-height:1.35">${t.cmpNote}</div></div>
  </div>`);
}

function slide(t, n, w, h) {
  const frame = (inner, justify = 'center') => page(w, h, `<div class="cv c" style="width:${w}px;height:${h}px;padding:90px 80px 80px;justify-content:space-between">
    <div class="row" style="width:100%;justify-content:space-between;align-items:center">${brand}<div class="d mut" style="font-size:28px;font-weight:700">${n}/6</div></div>
    <div class="col c" style="gap:34px;width:100%;justify-content:${justify}">${inner}</div>
    <div class="d mut" style="font-size:28px;font-weight:600;height:36px">${n < 6 ? t.swipe + ' →' : ''}</div></div>`);
  if (n === 1) return frame(`<div class="row" style="gap:50px">${['house', 'land', 'prop'].map(k => ICON[k](190)).join('')}</div><h1 class="d" style="font-size:104px;line-height:1.05;font-weight:800;letter-spacing:-.025em">${t.c1}</h1>`);
  if (n === 2) return frame(`<div class="d mut" style="font-size:44px;font-weight:700">${t.c2t}</div>${ICON.clock(170, RD)}<div class="d red" style="font-size:190px;font-weight:800;line-height:1;letter-spacing:-.03em">${t.c2b}</div><div style="font-size:46px;color:var(--muted);max-width:820px;line-height:1.3">${t.c2s}</div>`);
  if (n === 3) return frame(`<div class="d mut" style="font-size:44px;font-weight:700">${t.c3t}</div>
    <div class="row" style="gap:28px;width:100%"><div class="card col c" style="flex:1;padding:50px 20px;gap:12px"><div class="d red" style="font-size:120px;font-weight:800;line-height:1">${t.c3a}</div><div class="mut" style="font-size:32px;line-height:1.3">${t.c3as}</div></div>
    <div class="card col c" style="flex:1;padding:50px 20px;gap:12px"><div class="d red" style="font-size:96px;font-weight:800;line-height:1.1">${t.c3b}</div><div class="mut" style="font-size:32px;line-height:1.3">${t.c3bs}</div></div></div>
    <div class="card col c" style="width:100%;padding:36px;gap:8px"><div class="mut" style="font-size:34px">${t.c3ex}</div><div class="d" style="font-size:64px;font-weight:800">${t.c3exv}</div></div>`);
  if (n === 4) return frame(`<h2 class="d" style="font-size:78px;line-height:1.06;font-weight:800;letter-spacing:-.02em">${t.c4t}</h2>
    <div class="col" style="gap:22px;width:100%">${t.steps.map((s, i) => `<div class="card row" style="align-items:center;gap:28px;padding:34px 38px;text-align:left"><div class="d gold" style="font-size:80px;font-weight:800;width:70px">${i + 1}</div><div style="font-size:42px;font-weight:600;line-height:1.2">${s}</div></div>`).join('')}</div>`);
  if (n === 5) return frame(`<h2 class="d" style="font-size:74px;line-height:1.06;font-weight:800;letter-spacing:-.02em">${t.c5t}</h2>
    <div class="col" style="gap:20px;width:100%">${t.plans.map(p => `<div class="card row" style="align-items:center;justify-content:space-between;padding:30px 36px;text-align:left"><div><div class="d" style="font-size:44px;font-weight:800">${p[0]}</div><div class="mut" style="font-size:26px">${p[1]}</div><div style="font-size:28px;margin-top:6px">${p[2]} ${t.work} + ${p[3]} ${t.ads}</div></div><div class="col" style="align-items:flex-end"><div class="d green" style="font-size:92px;font-weight:800;line-height:1">${p[4]}</div><div class="mut" style="font-size:24px">${t.chats}</div></div></div>`).join('')}</div>
    <div class="mut" style="font-size:28px">${t.c5n}</div>`);
  return frame(`<div class="pill">${t.c6t}</div><h2 class="d" style="font-size:84px;line-height:1.06;font-weight:800;letter-spacing:-.02em">${t.c6s}</h2>
    <div class="btn">${t.cta}${ICON.arrow(44, '#1a1307')}</div>
    <div class="row c" style="gap:16px;align-items:center">${ICON.chat(64, '#4be37f')}<div class="d" style="font-size:44px;font-weight:700">${PHONE}</div></div>
    <div class="mut" style="font-size:28px">${t.foot}</div>`);
}

// ---------------------------------------------------------------- reel (timeline, frame by frame)
function reel(t) {
  const sc = (a, b, inner, cls = '') => `<div class="sc ${cls}" data-in="${a}" data-out="${b}">${inner}</div>`;
  const it = (d, html) => `<div class="a" data-d="${d}">${html}</div>`;
  const list = (items, ok, d0) => items.map((x, i) => it(d0 + i * 0.45, `<div class="row" style="gap:24px;align-items:center;text-align:left">${ok ? ICON.check(70) : ICON.cross(70)}<div class="d" style="font-size:62px;font-weight:${ok ? 800 : 700};line-height:1.1;color:${ok ? GR : '#e7b5b5'}">${x}</div></div>`)).join('');
  const body = `<div class="cv" style="width:1080px;height:1920px">
    <div style="position:absolute;top:120px;left:0;right:0;display:flex;justify-content:center">${brand}</div>
    ${sc(0, 3, `${it(0, `<div class="row" style="gap:44px">${['house', 'land', 'prop'].map(k => ICON[k](210)).join('')}</div>`)}${it(0.5, `<h1 class="d" style="font-size:112px;line-height:1.05;font-weight:800;letter-spacing:-.025em">${t.r1}</h1>`)}`)}
    ${sc(3, 6.2, `${it(0, `<div class="pill" style="border-color:rgba(240,138,138,.5);color:${RD};font-size:40px">${t.r2}</div>`)}${list(t.agencyShort, false, 0.4)}`)}
    ${sc(6.2, 9.4, `${it(0, `<div class="pill" style="border-color:rgba(127,216,166,.5);color:${GR};font-size:40px">${t.r3}</div>`)}${list(t.usShort, true, 0.4)}`)}
    ${sc(9.4, 12, `${it(0, ICON.chat(200, '#4be37f'))}${it(0.3, `<div class="pill" style="font-size:40px">${t.r4}</div>`)}${it(0.6, `<div class="d" style="font-size:112px;font-weight:800;line-height:1;white-space:nowrap"><span class="green">80</span> · <span class="green">150</span> · <span class="green">200</span></div>`)}${it(0.9, `<div class="mut" style="font-size:44px;line-height:1.3;max-width:860px">${t.chats} · ${t.r5}</div>`)}`)}
    ${sc(12, 15.5, `${it(0, `<div class="pill" style="font-size:36px">${t.limited}</div>`)}${it(0.3, `<h2 class="d" style="font-size:96px;line-height:1.06;font-weight:800;letter-spacing:-.02em">${t.h1}<br><span class="gold">${t.big}</span></h2>`)}${it(0.7, `<div class="btn" style="font-size:50px;padding:40px 64px">${t.cta}${ICON.arrow(54, '#1a1307')}</div>`)}${it(1.0, `<div class="row c" style="gap:16px;align-items:center">${ICON.chat(70, '#4be37f')}<div class="d" style="font-size:52px;font-weight:700">${PHONE}</div></div>`)}`)}
  </div>`;
  const extra = `.sc{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:44px;padding:0 70px}.a{opacity:0}`;
  const js = `<script>
  const ease=x=>1-Math.pow(1-x,3);
  window.setT=t=>{document.querySelectorAll('.sc').forEach(s=>{const a=+s.dataset.in,b=+s.dataset.out,on=t>=a&&t<b;s.style.display=on?'flex':'none';if(!on)return;
    s.querySelectorAll('.a').forEach(e=>{const p=Math.min(1,Math.max(0,(t-a-(+e.dataset.d))/0.45)),q=Math.min(1,Math.max(0,(b-t)/0.25));e.style.opacity=ease(p)*q;e.style.transform='translateY('+((1-ease(p))*50)+'px)';});});};
  </script>`;
  return page(1080, 1920, body + js, extra);
}

// ---------------------------------------------------------------- run
async function main() {
  rmSync(OUT, { recursive: true, force: true });
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const shot = async (html, file, w, h) => {
    await pg.setViewportSize({ width: w, height: h });
    await pg.setContent(html, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    mkdirSync(path.dirname(file), { recursive: true });
    await pg.screenshot({ path: file, type: 'png' });
    console.log('png', path.relative(OUT, file));
  };
  for (const [lang, t] of Object.entries(L)) {
    const dir = path.join(OUT, t.dir);
    await shot(offer(t, 1080, 1350), path.join(dir, `01_oferta_feed_4x5_${lang}.png`), 1080, 1350);
    await shot(offer(t, 1080, 1920), path.join(dir, `02_oferta_story_9x16_${lang}.png`), 1080, 1920);
    await shot(compare(t, 1080, 1350), path.join(dir, `03_comparacion_4x5_${lang}.png`), 1080, 1350);
    for (let n = 1; n <= 6; n++) await shot(slide(t, n, 1080, 1350), path.join(dir, `04_carrusel_${lang}`, `slide_${n}.png`), 1080, 1350);
  }
  // reels: frame by frame -> mp4
  for (const [lang, t] of Object.entries(L)) {
    await pg.setViewportSize({ width: 1080, height: 1920 });
    await pg.setContent(reel(t), { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    const tmp = path.join(os.tmpdir(), `reel_${lang}`);
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const FPS = 30, DUR = 15.5, N = Math.round(FPS * DUR);
    for (let i = 0; i < N; i++) {
      await pg.evaluate(x => window.setT(x), i / FPS);
      await pg.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
    }
    const mp4 = path.join(OUT, '03_Reels', `reel_${lang === 'es' ? 'ES' : 'EN'}.mp4`);
    mkdirSync(path.dirname(mp4), { recursive: true });
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-r', String(FPS), mp4]);
    rmSync(tmp, { recursive: true, force: true });
    console.log('mp4', path.relative(OUT, mp4));
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
