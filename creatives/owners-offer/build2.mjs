// Owners offer creatives, v2: plain words, one idea per image, a real illustration in each.
// Run: node creatives/owners-offer/build2.mjs "<output folder>"
import { chromium } from '/Users/voinov/icoda_video/node_modules/playwright-core/index.mjs';
import { mkdirSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';

const OUT = process.argv[2] || path.join(os.homedir(), 'Desktop', 'Restate Deals - Owners offer');
const ONLY = process.argv[3] || 'all'; // all | static | reels
const CHROMIUM = path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const FFMPEG = path.join(os.homedir(), 'icoda_video/ffmpeg');
const PHONE = '+507 6718 5938';
const C = { bg: '#0A0B0D', surf: '#13161A', surf2: '#1A1D22', text: '#F3EFE7', muted: '#A29D93', gold: '#D6B073', gold2: '#B8864B', green: '#7FD8A6', green2: '#2F8F5F', red: '#F08A8A', wa: '#25D366' };

// ------------------------------------------------------------------ words (plain, no jargon)
const T = {
  es: {
    dir: '01_Creativos_ES', excl: 'EXCLUSIVIDAD', cta: 'Escríbeme por WhatsApp', brandLine: 'Restate Deals · Panamá',
    agency: 'Agencia', us: 'Nosotros', commission: 'comisión', house400: 'Casa de $400,000',
    a1: ['Vende tu casa', 'sin pagar comisión'], a1s: 'Ni 5% a un agente. Ni impuestos sobre la comisión. El dinero de la venta es tuyo.',
    a2: ['Casa de $400,000:', '¿cuánto pierdes con agencia?'], a2agency: '−$21,400', a2agencyS: '5% de comisión + impuesto', a2us: '$3,300', a2usS: 'precio fijo, sin comisión', a2s: 'Te quedan $18,100 más en tu bolsillo.',
    a3: ['Gente que quiere comprar', 'te escribe directo'], a3s: 'Ponemos tu casa en Facebook, Instagram y Google. Los interesados te escriben por WhatsApp.',
    msgs: ['Hola, ¿la casa sigue disponible?', '¿Puedo ir a verla el sábado?', '¿Cuál es el precio final?', '¿Tiene título de propiedad?'], waName: 'Comprador interesado',
    a4: ['Con agencia esperas', '7 a 8 meses'], a4agency: '7–8 meses', a4us: '2–3 meses', a4s: 'Con agencia la venta tarda 224 días en promedio. Nosotros anunciamos tu casa desde la primera semana.',
    a5: ['¿Tienes un terreno?', 'Véndelo sin comisión'], a5s: 'Lotes en la playa, la montaña o la ciudad. Desde $900, sin agente.', sign: 'SE VENDE',
    a6: ['La agencia se lleva', 'una parte de tu casa'], a6s: 'Con nosotros pagas un precio fijo desde $900. Nada sale del precio de tu casa.', a6slice: '5% + impuesto',
    a7: ['Sin contratos', 'de exclusividad'], a7s: 'Sigue con tu agente si quieres. Nosotros solo te traemos más compradores.',
    a8: ['¿Pocos mensajes?', 'Seguimos gratis'], a8s: 'Te garantizamos 80, 150 o 200 personas que te escriben por WhatsApp, según tu plan. Si no llegamos, seguimos anunciando sin costo.', a8n: 'personas te escriben',
    a9: ['Cuando vendas,', 'el dinero llega completo'], a9s: 'Sin comisión de agente. Pagas solo un precio fijo por los anuncios.', bank: 'Banco · ahora', bankT: 'Depósito recibido', bankV: '+$400,000',
    a10: ['Gratis: 15 pasos para', 'vender tu casa más rápido'], a10s: 'Precio, fotos, documentos y cómo atender a los compradores. Escríbenos y te lo enviamos.', doc: 'Checklist', docItems: ['Precio realista', 'Fotos con luz natural', 'Documentos listos', 'Responde rápido'],
    car: [
      ['¿Vendes tu casa, apartamento o terreno en Panamá?', ''],
      ['Con agencia esperas 7 a 8 meses', 'y pagas 5% de comisión + impuesto'],
      ['En una casa de $400,000 son $21,400', 'que salen de tu bolsillo'],
      ['Nosotros ponemos tu casa en Facebook, Instagram y Google', ''],
      ['La gente interesada te escribe directo por WhatsApp', ''],
      ['Precio fijo desde $900', 'Sin comisión. Si te escriben menos, seguimos gratis.'],
      ['¿Quieres vender?', 'Escríbeme el precio y la zona'],
    ],
    swipe: 'Desliza →', reelQ: '¿Vendes tu casa?', reelGone: 'se va a la agencia', reelPay: 'Con nosotros pagas', reelKeep: 'Te quedan $18,100 más', reelAds: 'Tu casa en Facebook, Instagram y Google', reelWrite: 'Los compradores te escriben a ti', reelNo: 'Sin comisión · Sin exclusividad',
  },
  en: {
    dir: '02_Creatives_EN', excl: 'EXCLUSIVE', cta: 'Message me on WhatsApp', brandLine: 'Restate Deals · Panama',
    agency: 'Agency', us: 'Us', commission: 'commission', house400: '$400,000 house',
    a1: ['Sell your house', 'without paying commission'], a1s: 'No 5% to an agent. No tax on top of a commission. The money from the sale is yours.',
    a2: ['$400,000 house:', 'how much does an agency take?'], a2agency: '−$21,400', a2agencyS: '5% commission + tax', a2us: '$3,300', a2usS: 'fixed price, no commission', a2s: 'You keep $18,100 more in your pocket.',
    a3: ['People who want to buy', 'message you directly'], a3s: 'We put your house on Facebook, Instagram and Google. Interested buyers message you on WhatsApp.',
    msgs: ['Hi, is the house still available?', 'Can I come see it on Saturday?', "What's your best price?", 'Is the title in order?'], waName: 'Interested buyer',
    a4: ['With an agency you wait', '7 to 8 months'], a4agency: '7–8 months', a4us: '2–3 months', a4s: 'With an agency a sale takes 224 days on average. We advertise your house from the first week.',
    a5: ['Own a plot of land?', 'Sell it without commission'], a5s: 'Lots by the beach, in the mountains or in the city. From $900, no agent.', sign: 'FOR SALE',
    a6: ['The agency takes', 'a piece of your house'], a6s: 'With us you pay a fixed price from $900. Nothing comes out of your sale price.', a6slice: '5% + tax',
    a7: ['No exclusive', 'contracts'], a7s: 'Keep your agent if you want. We just bring you more buyers.',
    a8: ['Too few messages?', 'We keep going for free'], a8s: "We guarantee 80, 150 or 200 people messaging you on WhatsApp, depending on your plan. If we fall short, we keep advertising at no cost.", a8n: 'people message you',
    a9: ['When you sell,', 'you get all the money'], a9s: 'No agent commission. You only pay a fixed price for the ads.', bank: 'Bank · now', bankT: 'Deposit received', bankV: '+$400,000',
    a10: ['Free: 15 steps to', 'sell your house faster'], a10s: 'Price, photos, papers and how to handle buyers. Message us and we send it to you.', doc: 'Checklist', docItems: ['Realistic price', 'Photos in daylight', 'Papers ready', 'Reply fast'],
    car: [
      ['Selling your house, apartment or land in Panama?', ''],
      ['With an agency you wait 7 to 8 months', 'and pay 5% commission + tax'],
      ['On a $400,000 house that is $21,400', 'out of your pocket'],
      ['We put your house on Facebook, Instagram and Google', ''],
      ['Interested people message you directly on WhatsApp', ''],
      ['Fixed price from $900', 'No commission. Too few messages? We keep going free.'],
      ['Want to sell?', 'Send me the price and the area'],
    ],
    swipe: 'Swipe →', reelQ: 'Selling your house?', reelGone: 'goes to the agency', reelPay: 'With us you pay', reelKeep: 'You keep $18,100 more', reelAds: 'Your house on Facebook, Instagram and Google', reelWrite: 'Buyers message you', reelNo: 'No commission · No exclusivity',
  },
};

// ------------------------------------------------------------------ illustrations (inline SVG scenes)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const F = "font-family=\"'Plus Jakarta Sans',Inter,sans-serif\"";
const house = (x, y, s = 1, lit = true) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-110 0 L0 -96 L110 0" fill="none" stroke="${C.gold}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M-88 -12 L0 -84 L88 -12 V112 H-88Z" fill="#1d2025" stroke="${C.gold}" stroke-width="6"/>
  <rect x="-62" y="10" width="44" height="40" rx="6" fill="${lit ? '#f6d38f' : '#2a2e35'}"/><rect x="18" y="10" width="44" height="40" rx="6" fill="${lit ? '#f6d38f' : '#2a2e35'}"/>
  <rect x="-20" y="58" width="40" height="54" rx="6" fill="${C.gold2}"/><circle cx="12" cy="88" r="3" fill="#1d2025"/>
  <rect x="40" y="-86" width="22" height="40" fill="#1d2025" stroke="${C.gold}" stroke-width="5"/></g>`;
const bill = (x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><rect x="-70" y="-36" width="140" height="72" rx="10" fill="${C.green2}" stroke="${C.green}" stroke-width="4"/><circle cx="0" cy="0" r="22" fill="none" stroke="${C.green}" stroke-width="4"/><text x="0" y="12" text-anchor="middle" font-size="34" font-weight="800" fill="${C.green}" ${F}>$</text></g>`;
const stack = (x, y, n = 5, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${Array.from({ length: n }, (_, i) => `<g transform="translate(0 ${-i * 16})">${bill(0, 0)}</g>`).join('')}</g>`;
const coin = (x, y, r = 26) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${C.gold}"/><circle r="${r - 7}" fill="none" stroke="#8a5f2b" stroke-width="3"/><text y="${r * 0.38}" text-anchor="middle" font-size="${r * 1.05}" font-weight="800" fill="#5c3d17" ${F}>$</text></g>`;
const check = (x, y, s = 1, col = C.green) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="34" fill="${col}"/><path d="M-15 0 L-4 12 L16 -12" fill="none" stroke="#0b2417" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const cross = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="34" fill="${C.red}"/><path d="M-13 -13 L13 13 M13 -13 L-13 13" stroke="#3a1010" stroke-width="8" stroke-linecap="round"/></g>`;
const waIcon = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="30" fill="${C.wa}"/><path d="M-12 -4c0 10 8 18 18 18l4-4-6-4-3 3c-4-1-7-4-8-8l3-3-4-6Z" fill="#fff"/><path d="M-20 18l3-10a22 22 0 1 1 8 8Z" fill="none" stroke="#fff" stroke-width="3"/></g>`;

function phone(x, y, msgs, name, show = msgs.length, s = 1) {
  const bub = msgs.slice(0, show).map((m, i) => `<g transform="translate(24 ${150 + i * 104})"><rect x="0" y="0" width="${Math.min(330, 40 + m.length * 13.2)}" height="78" rx="20" fill="#242a31"/><text x="22" y="48" font-size="25" fill="${C.text}" font-family="Inter,sans-serif">${esc(m)}</text></g>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="0" y="0" width="400" height="640" rx="54" fill="#0f1215" stroke="#3a3f47" stroke-width="8"/>
    <rect x="16" y="16" width="368" height="608" rx="40" fill="#0b141a"/>
    <rect x="16" y="16" width="368" height="104" rx="40" fill="#1f2c33"/><rect x="16" y="80" width="368" height="40" fill="#1f2c33"/>
    <circle cx="70" cy="70" r="26" fill="${C.gold}"/><text x="70" y="80" text-anchor="middle" font-size="26" font-weight="800" fill="#1a1307" ${F}>?</text>
    <text x="110" y="64" font-size="24" font-weight="700" fill="${C.text}" ${F}>${esc(name)}</text><text x="110" y="94" font-size="19" fill="${C.green}" font-family="Inter">WhatsApp</text>
    ${bub}<rect x="150" y="600" width="100" height="8" rx="4" fill="#3a3f47"/></g>`;
}
const calendar = (x, y, label, months, col, w = 380) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="300" rx="28" fill="#1d2025" stroke="${col}" stroke-width="5"/><rect width="${w}" height="74" rx="28" fill="${col}"/><rect y="46" width="${w}" height="28" fill="${col}"/>
  <text x="${w / 2}" y="50" text-anchor="middle" font-size="30" font-weight="800" fill="#16120a" ${F}>${esc(label)}</text>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${26 + (i % 4) * ((w - 52) / 4)}" y="${100 + Math.floor(i / 4) * 62}" width="${(w - 52) / 4 - 14}" height="48" rx="10" fill="${i < months ? col : '#2a2e35'}" opacity="${i < months ? 0.9 : 1}"/>`).join('')}</g>`;
const sign = (x, y, word) => `<g transform="translate(${x} ${y})"><rect x="-8" y="0" width="16" height="230" fill="#8a5f2b"/><rect x="-150" y="20" width="300" height="110" rx="16" fill="${C.gold}"/><text x="0" y="94" text-anchor="middle" font-size="54" font-weight="800" fill="#1a1307" ${F}>${esc(word)}</text></g>`;
const land = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-330 60 Q-100 -10 330 40 L330 150 L-330 150Z" fill="#14301f"/><path d="M-330 60 Q-100 -10 330 40" fill="none" stroke="${C.green}" stroke-width="6"/>
  <path d="M-250 70 L120 40 L280 110 L-120 140Z" fill="none" stroke="${C.gold}" stroke-width="5" stroke-dasharray="16 12"/>
  ${[[-250, 70], [120, 40], [280, 110], [-120, 140]].map(([a, b]) => `<rect x="${a - 5}" y="${b - 34}" width="10" height="36" fill="${C.gold}"/>`).join('')}
  <g transform="translate(220 -40)"><rect x="-8" y="0" width="16" height="70" fill="#5b3c1d"/><circle cy="-20" r="56" fill="#2f8f5f"/><circle cx="-40" cy="10" r="38" fill="#3aa36d"/></g></g>`;
const pie = (x, y, r, slice) => {
  const a = 0.6; // radians for the slice
  const p = (ang, rr = r) => `${(Math.cos(ang) * rr).toFixed(1)} ${(Math.sin(ang) * rr).toFixed(1)}`;
  return `<g transform="translate(${x} ${y})"><path d="M0 0 L${p(a)} A${r} ${r} 0 1 1 ${p(0)} Z" fill="${C.gold}" stroke="${C.bg}" stroke-width="6"/>
  <g transform="translate(46 22)"><path d="M0 0 L${p(0)} A${r} ${r} 0 0 1 ${p(a)} Z" fill="${C.red}" stroke="${C.bg}" stroke-width="6"/></g>
  <g transform="translate(-10 -40) scale(.55)">${house(0, 0, 1, true)}</g>
  <text x="${r + 70}" y="${r * 0.45}" font-size="34" font-weight="800" fill="${C.red}" ${F}>${esc(slice)}</text></g>`;
};
const receipt = (x, y, title, val, sub, col, ok) => `<g transform="translate(${x} ${y})"><path d="M0 0 H360 V300 l-24 20 -24-20 -24 20 -24-20 -24 20 -24-20 -24 20 -24-20 -24 20 -24-20 -24 20 -24-20 -24 20 -24-20 -24 20 -24-20Z" fill="#1d2025" stroke="${col}" stroke-width="5"/>
  <text x="180" y="62" text-anchor="middle" font-size="34" font-weight="800" fill="${C.text}" ${F}>${esc(title)}</text>
  <text x="180" y="160" text-anchor="middle" font-size="62" font-weight="800" fill="${col}" ${F}>${esc(val)}</text>
  <text x="180" y="226" text-anchor="middle" font-size="24" fill="${C.muted}" font-family="Inter">${esc(sub)}</text>${ok ? check(310, 18, .8) : cross(310, 18, .8)}</g>`;
const bankCard = (x, y, t) => `<g transform="translate(${x} ${y})"><rect width="640" height="200" rx="36" fill="#1d2025" stroke="#3a3f47" stroke-width="3"/><rect x="32" y="38" width="94" height="94" rx="24" fill="${C.green2}"/><text x="79" y="102" text-anchor="middle" font-size="54" font-weight="800" fill="#fff" ${F}>$</text>
  <text x="154" y="66" font-size="24" fill="${C.muted}" font-family="Inter">${esc(t.bank)}</text><text x="154" y="106" font-size="32" font-weight="700" fill="${C.text}" ${F}>${esc(t.bankT)}</text><text x="154" y="164" font-size="52" font-weight="800" fill="${C.green}" ${F}>${esc(t.bankV)}</text></g>`;
const shield = (x, y, n, label) => `<g transform="translate(${x} ${y}) scale(1.25)"><path d="M0 -150 L130 -100 V0 C130 90 70 150 0 180 C-70 150 -130 90 -130 0 V-100Z" fill="#14301f" stroke="${C.green}" stroke-width="7"/>
  <text x="0" y="24" text-anchor="middle" font-size="${String(n).length > 3 ? 72 : 96}" font-weight="800" fill="${C.green}" ${F}>${n}</text>${label ? `<text x="0" y="66" text-anchor="middle" font-size="19" fill="${C.text}" font-family="Inter">${esc(label)}</text>` : ''}</g>`;
const docSheet = (x, y, t) => `<g transform="translate(${x} ${y})"><rect width="420" height="520" rx="28" fill="#f5efe3"/><rect width="420" height="96" rx="28" fill="${C.gold}"/><rect y="60" width="420" height="36" fill="${C.gold}"/>
  <text x="210" y="62" text-anchor="middle" font-size="36" font-weight="800" fill="#1a1307" ${F}>${esc(t.doc)}</text>
  ${t.docItems.map((it, i) => `<g transform="translate(40 ${150 + i * 88})"><rect width="44" height="44" rx="10" fill="#fff" stroke="#b8864b" stroke-width="3"/><path d="M10 22 L19 31 L35 13" fill="none" stroke="#2f8f5f" stroke-width="6" stroke-linecap="round"/><text x="66" y="32" font-size="28" fill="#1d2025" font-family="Inter" font-weight="600">${esc(it)}</text></g>`).join('')}</g>`;
const people = (x, y, ok) => `<g transform="translate(${x} ${y})"><circle cx="0" cy="-40" r="34" fill="${ok ? C.gold : '#8a8f98'}"/><path d="M-56 70 C-56 0 56 0 56 70Z" fill="${ok ? C.gold : '#8a8f98'}"/></g>`;

// ------------------------------------------------------------------ page shell
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
*{box-sizing:border-box;margin:0}html,body{background:${C.bg};color:${C.text};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.cv{position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;text-align:center;background:radial-gradient(90% 50% at 50% 0%,rgba(214,176,115,.15),transparent 70%),${C.bg}}
h1{font-family:'Plus Jakarta Sans';font-weight:800;letter-spacing:-.025em;line-height:1.02}
.l2{color:${C.gold}}
.sub{color:#cfc9bd;line-height:1.35}
.cta{display:inline-flex;align-items:center;gap:18px;padding:26px 46px;border-radius:999px;background:${C.wa};color:#05240f;font:800 36px/1 'Plus Jakarta Sans'}
.brand{font:700 26px/1 'Plus Jakarta Sans';color:${C.muted};letter-spacing:.02em}.brand b{color:${C.text}}
.ill{display:block}`;
const waSvg = '<svg width="40" height="40" viewBox="-32 -32 64 64"><circle r="30" fill="#05240f"/><path d="M-12 -4c0 10 8 18 18 18l4-4-6-4-3 3c-4-1-7-4-8-8l3-3-4-6Z" fill="#25D366"/></svg>';
function card(t, h1, sub, ill, { W = 1080, H = 1350, illH = 640 } = {}) {
  const story = H > 1500;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}body{width:${W}px;height:${H}px}</style></head><body>
  <div class="cv" style="width:${W}px;height:${H}px;padding:${story ? '170px 70px 150px' : '84px 70px 70px'};justify-content:space-between">
    <h1 style="font-size:${story ? 104 : 92}px">${esc(h1[0])}<br><span class="l2">${esc(h1[1])}</span></h1>
    <svg class="ill" viewBox="-540 -360 1080 ${illH + 80}" width="${W}" height="${(illH + 80) * (story ? 1.15 : 1)}" style="margin:0 -70px">${ill}</svg>
    <div style="display:flex;flex-direction:column;align-items:center;gap:${story ? 34 : 26}px">
      ${sub ? `<p class="sub" style="font-size:${story ? 38 : 34}px;max-width:900px">${esc(sub)}</p>` : ''}
      <div class="cta">${waSvg}${esc(t.cta)}</div>
      <div class="brand"><b>Restate</b> Deals · ${PHONE}</div>
    </div></div></body></html>`;
}

// ------------------------------------------------------------------ the 10 concepts
const concepts = {
  '01_sin_comision': t => card(t, t.a1, t.a1s, `${house(-150, -40, 1.25)}${stack(210, 160, 6, 1.1)}${coin(110, 210, 30)}${coin(330, 200, 24)}<g transform="translate(260 -160)">${cross(0, 0, 1.2)}<text x="0" y="90" text-anchor="middle" font-size="34" font-weight="800" fill="${C.red}" ${F}>5% ${esc(t.commission)}</text></g>`),
  '02_cuanto_pierdes': t => card(t, t.a2, t.a2s, `${receipt(-420, -290, t.agency, t.a2agency, t.a2agencyS, C.red, false)}${receipt(60, -290, t.us, t.a2us, t.a2usS, C.green, true)}${stack(-240, 160, 3, .8)}${stack(240, 160, 6, .8)}`),
  '03_te_escriben': t => card(t, t.a3, t.a3s, `${phone(-200, -330, t.msgs, t.waName, 4, 1.04)}${house(-380, 120, .7)}<path d="M-300 40 C-280 -60 -240 -120 -215 -140" fill="none" stroke="${C.gold}" stroke-width="6" stroke-dasharray="14 10"/>${waIcon(310, -250, 1.6)}`, { illH: 700 }),
  '04_meses': t => card(t, t.a4, t.a4s, `${calendar(-430, -280, t.agency, 8, C.red)}${calendar(50, -280, t.us, 3, C.green)}<text x="-240" y="80" text-anchor="middle" font-size="56" font-weight="800" fill="${C.red}" ${F}>${esc(t.a4agency)}</text><text x="240" y="80" text-anchor="middle" font-size="56" font-weight="800" fill="${C.green}" ${F}>${esc(t.a4us)}</text>`),
  '05_terreno': t => card(t, t.a5, t.a5s, `${land(0, 60)}${sign(-160, -270, t.sign)}${coin(250, -230, 32)}${coin(320, -170, 24)}`),
  '06_tajada': t => card(t, t.a6, t.a6s, `${pie(-120, -40, 230, t.a6slice)}`),
  '07_sin_exclusividad': t => card(t, t.a7, t.a7s, `<g transform="translate(-250 -120)"><rect x="-150" y="-130" width="300" height="380" rx="20" fill="#f5efe3"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="-110" y="${-80 + i * 46}" width="${i % 2 ? 160 : 220}" height="14" rx="7" fill="#c9c1b2"/>`).join('')}<path d="M-170 270 L170 -150" stroke="${C.red}" stroke-width="22" stroke-linecap="round"/><text x="0" y="300" text-anchor="middle" font-size="30" font-weight="800" fill="${C.red}" ${F}>${esc(t.excl)}</text></g>${people(170, -120, true)}${people(320, -80, false)}${house(240, 170, .7)}`),
  '08_garantia': t => card(t, t.a8, t.a8s, `${shield(-160, -80, '80+', t.a8n)}${waIcon(170, -230, 1.3)}${phone(110, -170, t.msgs.slice(0, 2), t.waName, 2, .62)}`),
  '09_dinero_completo': t => card(t, t.a9, t.a9s, `${house(-260, -60, .9)}<path d="M-120 -60 H40" stroke="${C.gold}" stroke-width="8" stroke-dasharray="18 12"/><path d="M30 -84 L64 -60 L30 -36" fill="none" stroke="${C.gold}" stroke-width="8" stroke-linecap="round"/>${stack(220, 20, 7, 1)}${bankCard(-320, 150, t)}`),
  '10_checklist': t => card(t, t.a10, t.a10s, `${docSheet(-330, -320, t)}${house(250, -20, .9)}${check(330, -220, 1.4)}`, { illH: 640 }),
};

// ------------------------------------------------------------------ carousel (7 slides, illustration on each)
function slide(t, i) {
  const [a, b] = t.car[i];
  const ills = [
    `${house(-260, -20, .9)}${land(160, 60)}<g transform="translate(250 -160) scale(.6)">${house(0, 0, 1, false)}</g>`,
    `${calendar(-200, -280, t.agency, 8, C.red, 400)}${cross(250, -200, 1.3)}`,
    `${receipt(-180, -290, t.agency, '−$21,400', t.a2agencyS, C.red, false)}${stack(0, 170, 4, .8)}`,
    `${house(-260, -40, .9)}<g transform="translate(80 -220)"><rect width="320" height="90" rx="20" fill="#1877F2"/><text x="160" y="58" text-anchor="middle" font-size="36" font-weight="800" fill="#fff" ${F}>Facebook</text></g><g transform="translate(80 -110)"><rect width="320" height="90" rx="20" fill="#C13584"/><text x="160" y="58" text-anchor="middle" font-size="36" font-weight="800" fill="#fff" ${F}>Instagram</text></g><g transform="translate(80 0)"><rect width="320" height="90" rx="20" fill="#fff"/><text x="160" y="58" text-anchor="middle" font-size="36" font-weight="800" fill="#4285F4" ${F}>Google</text></g>`,
    `${phone(-200, -330, t.msgs, t.waName, 4, 1.02)}`,
    `${shield(-180, -80, '$900', '')}${stack(200, 120, 6, .9)}${check(300, -220, 1.3)}`,
    `${waIcon(0, -120, 3.4)}<text x="0" y="130" text-anchor="middle" font-size="64" font-weight="800" fill="${C.text}" ${F}>${PHONE}</text>`,
  ];
  const n = i + 1, last = n === t.car.length;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}body{width:1080px;height:1350px}</style></head><body>
  <div class="cv" style="width:1080px;height:1350px;padding:80px 70px 70px;justify-content:space-between">
    <div style="width:100%;display:flex;justify-content:space-between" class="brand"><span><b>Restate</b> Deals</span><span>${n}/${t.car.length}</span></div>
    <h1 style="font-size:${a.length > 40 ? 78 : 92}px">${esc(a)}${b ? `<br><span class="l2" style="font-size:.78em">${esc(b)}</span>` : ''}</h1>
    <svg viewBox="-540 -360 1080 720" width="1080" height="720" style="margin:0 -70px">${ills[i]}</svg>
    ${last ? `<div class="cta">${waSvg}${esc(t.cta)}</div>` : `<div class="brand" style="font-size:30px">${esc(t.swipe)}</div>`}
  </div></body></html>`;
}

// ------------------------------------------------------------------ reels (frame by frame)
function reel(t, kind) {
  const sc = (a, b, inner) => `<div class="sc" data-in="${a}" data-out="${b}">${inner}</div>`;
  const it = (d, html, extra = '') => `<div class="a" data-d="${d}" ${extra}>${html}</div>`;
  const big = (s, col = C.text, size = 100) => `<h1 style="font-size:${size}px;color:${col}">${esc(s)}</h1>`;
  const svgBox = (inner, h = 760) => `<svg viewBox="-540 ${-h / 2} 1080 ${h}" width="1080" height="${h}">${inner}</svg>`;
  let body;
  if (kind === 'dinero') {
    body = sc(0, 3, it(0, svgBox(house(0, 40, 1.6))) + it(0.4, big(t.reelQ)))
      + sc(3, 6.5, it(0, big(t.house400, C.gold, 92)) + it(0.3, svgBox(`${stack(-200, 120, 7, 1.1)}<g class="fly">${bill(200, 40, -12, 1.2)}${bill(240, 110, 8, 1.2)}</g>`, 520)) + it(0.8, big('−$21,400', C.red, 130)) + it(1.1, `<p class="sub" style="font-size:44px">${esc(t.reelGone)}</p>`))
      + sc(6.5, 10, it(0, big(t.reelPay, C.text, 84)) + it(0.3, big('$3,300', C.green, 170)) + it(0.8, svgBox(`${stack(0, 110, 8, 1.2)}`, 420)) + it(1.2, big(t.reelKeep, C.gold, 76)))
      + sc(10, 15, it(0, svgBox(`${waIcon(0, 0, 3)}`, 300)) + it(0.3, big(t.reelNo, C.text, 72)) + it(0.7, `<div class="cta" style="font-size:46px;padding:34px 56px">${waSvg}${esc(t.cta)}</div>`) + it(1.0, `<div class="brand" style="font-size:40px"><b>${PHONE}</b></div>`));
  } else {
    body = sc(0, 3, it(0, svgBox(house(0, 40, 1.6))) + it(0.4, big(t.reelQ)))
      + sc(3, 6, it(0, big(t.reelAds, C.text, 80)) + it(0.4, svgBox(`<g transform="translate(-200 -200)"><rect width="400" height="100" rx="24" fill="#1877F2"/><text x="200" y="64" text-anchor="middle" font-size="40" font-weight="800" fill="#fff" ${F}>Facebook</text></g><g transform="translate(-200 -60)"><rect width="400" height="100" rx="24" fill="#C13584"/><text x="200" y="64" text-anchor="middle" font-size="40" font-weight="800" fill="#fff" ${F}>Instagram</text></g><g transform="translate(-200 80)"><rect width="400" height="100" rx="24" fill="#fff"/><text x="200" y="64" text-anchor="middle" font-size="40" font-weight="800" fill="#4285F4" ${F}>Google</text></g>`, 560)))
      + sc(6, 11, it(0, big(t.reelWrite, C.gold, 86)) + [1, 2, 3, 4].map(k => it(0.4 + k * 0.7, svgBox(phone(-210, -340, t.msgs, t.waName, k, 1.05), 760), `data-out="${0.4 + (k + 1) * 0.7}"`)).join(''))
      + sc(11, 15, it(0, svgBox(`${waIcon(0, 0, 3)}`, 300)) + it(0.3, big(t.reelNo, C.text, 72)) + it(0.7, `<div class="cta" style="font-size:46px;padding:34px 56px">${waSvg}${esc(t.cta)}</div>`) + it(1.0, `<div class="brand" style="font-size:40px"><b>${PHONE}</b></div>`));
  }
  const extra = `.sc{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:40px;padding:0 70px}.a{opacity:0}`;
  const js = `<script>const ease=x=>1-Math.pow(1-x,3);
  window.setT=t=>{document.querySelectorAll('.sc').forEach(s=>{const a=+s.dataset.in,b=+s.dataset.out,on=t>=a&&t<b;s.style.display=on?'flex':'none';if(!on)return;
   s.querySelectorAll(':scope > .a').forEach(e=>{const st=a+(+e.dataset.d),p=Math.min(1,Math.max(0,(t-st)/0.45)),q=Math.min(1,Math.max(0,(b-t)/0.25));
     const end=e.dataset.out?a+(+e.dataset.out):null;const gone=end!==null&&t>=end;e.style.display=(end!==null&&(t<st||gone))?'none':'';
     e.style.opacity=ease(p)*q;e.style.transform='translateY('+((1-ease(p))*50)+'px)';});
   s.querySelectorAll('.fly').forEach(f=>{const p=Math.min(1,Math.max(0,(t-a-0.9)/1.2));f.style.transform='translate('+(p*420)+'px,'+(-p*260)+'px) rotate('+(p*25)+'deg)';f.style.opacity=1-p*0.9;});});};</script>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${extra}body{width:1080px;height:1920px}</style></head><body><div class="cv" style="width:1080px;height:1920px"><div class="brand" style="position:absolute;top:110px"><b>Restate</b> Deals</div>${body}</div>${js}</body></html>`;
}

// ------------------------------------------------------------------ run
async function main() {
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const pg = await (await browser.newContext({ viewport: { width: 1080, height: 1350 } })).newPage();
  const shot = async (html, file, w, h) => {
    await pg.setViewportSize({ width: w, height: h });
    await pg.setContent(html, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    mkdirSync(path.dirname(file), { recursive: true });
    await pg.screenshot({ path: file, type: 'png' });
    console.log('png', path.relative(OUT, file));
  };
  if (ONLY !== 'reels') {
    for (const [lang, t] of Object.entries(T)) {
      const dir = path.join(OUT, t.dir);
      rmSync(dir, { recursive: true, force: true });
      for (const [name, fn] of Object.entries(concepts)) await shot(fn(t), path.join(dir, 'Feed_4x5', `${name}_${lang}.png`), 1080, 1350);
      // stories for the three strongest ideas
      for (const name of ['01_sin_comision', '02_cuanto_pierdes', '03_te_escriben']) {
        const html = concepts[name](t).replace(/height:1350px/g, 'height:1920px').replace('padding:84px 70px 70px', 'padding:170px 70px 150px');
        await shot(html, path.join(dir, 'Stories_9x16', `${name}_${lang}.png`), 1080, 1920);
      }
      for (let i = 0; i < t.car.length; i++) await shot(slide(t, i), path.join(dir, 'Carrusel', `slide_${i + 1}_${lang}.png`), 1080, 1350);
    }
  }
  if (ONLY !== 'static') {
    rmSync(path.join(OUT, '03_Reels'), { recursive: true, force: true });
    for (const [lang, t] of Object.entries(T)) for (const kind of ['dinero', 'mensajes']) {
      await pg.setViewportSize({ width: 1080, height: 1920 });
      await pg.setContent(reel(t, kind), { waitUntil: 'networkidle' });
      await pg.evaluate(() => document.fonts.ready);
      const tmp = path.join(os.tmpdir(), `reel_${lang}_${kind}`);
      rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
      const FPS = 30, N = FPS * 15;
      for (let i = 0; i < N; i++) { await pg.evaluate(x => window.setT(x), i / FPS); await pg.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 }); }
      const mp4 = path.join(OUT, '03_Reels', `reel_${kind}_${lang.toUpperCase()}.mp4`);
      mkdirSync(path.dirname(mp4), { recursive: true });
      execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', mp4]);
      rmSync(tmp, { recursive: true, force: true });
      console.log('mp4', path.relative(OUT, mp4));
    }
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
