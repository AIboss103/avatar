// Owners offer creatives, v3: one fixed layout for every image, real platform logos, brand colours only.
// Layout: audience badge (who it is for) → headline → illustration in a framed panel → one line + WhatsApp button.
// Run: node creatives/owners-offer/build3.mjs "<output folder>" [all|static|reels]
import { chromium } from '/Users/voinov/icoda_video/node_modules/playwright-core/index.mjs';
import { mkdirSync, rmSync, readFileSync } from 'fs';
import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || path.join(os.homedir(), 'Desktop', 'Restate Deals - Owners offer');
const ONLY = process.argv[3] || 'all';
const CHROMIUM = path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const FFMPEG = path.join(os.homedir(), 'icoda_video/ffmpeg');
const PHONE = '+507 6718 5938';
const C = { bg: '#0A0B0D', surf: '#13161A', surf2: '#1A1D22', line: 'rgba(255,255,255,.09)', text: '#F3EFE7', muted: '#A29D93', gold: '#D6B073', gold2: '#B8864B', green: '#7FD8A6', green2: '#2F8F5F', red: '#F08A8A', wa: '#25D366' };
const ICON = Object.fromEntries(['whatsapp', 'facebook', 'instagram', 'google'].map(n => [n, readFileSync(path.join(HERE, 'icons', n + '.svg'), 'utf8').match(/ d="([^"]+)"/)[1]]));
const logo = (n, size, fill, x = 0, y = 0) => `<g transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})"><path d="${ICON[n]}" fill="${fill}"/></g>`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const F = "font-family=\"'Plus Jakarta Sans',Inter,sans-serif\"";

// ------------------------------------------------------------------ words
const T = {
  es: {
    dir: '01_Creativos_ES', badge: 'Para quien vende casa, apartamento o terreno', cta: 'Escríbeme por WhatsApp', swipe: 'Desliza →',
    agency: 'Agencia', us: 'Nosotros', sale: 'Venta', yours: '100% para ti', agentCut: '5% al agente', commTax: '5% comisión + impuesto', fixed: 'precio fijo, sin comisión',
    yourMoney: 'Tu dinero', toAgency: 'Para la agencia', months: 'meses', excl: 'EXCLUSIVIDAD', keepAgent: 'Sigue con tu agente si quieres', people: 'personas te escriben',
    buyer: 'Comprador interesado', msgs: ['Hola, ¿la casa sigue disponible?', '¿Puedo ir a verla el sábado?', '¿Cuál es el precio final?', '¿Tiene título de propiedad?'],
    bank: 'Banco · ahora', bankT: 'Depósito recibido', bankV: '+$400,000', doc: 'Checklist gratis', docItems: ['Precio realista', 'Fotos con luz natural', 'Documentos listos', 'Responde rápido'],
    house: 'Casa', apt: 'Apartamento', land: 'Terreno', sign: 'SE VENDE', priceFrom: 'desde', noComm: 'Sin comisión', keepGoing: 'Si te escriben menos, seguimos gratis',
    c: {
      '01_sin_comision': [['Vende tu casa', 'sin pagar comisión'], 'El dinero de la venta llega completo a ti. Pagas un precio fijo desde $900.'],
      '02_cuanto_pierdes': [['Casa de $400,000:', '¿cuánto pierdes?'], 'Con agencia pagas $21,400. Con nosotros $3,300. Te quedan $18,100 más.'],
      '03_te_escriben': [['Los compradores', 'te escriben a ti'], 'Anunciamos tu casa en Facebook, Instagram y Google. Los interesados te escriben por WhatsApp.'],
      '04_meses': [['No esperes', '7 u 8 meses'], 'Con agencia la venta tarda 224 días en promedio. Nosotros anunciamos desde la primera semana.'],
      '05_terreno': [['¿Vendes un terreno?', 'Sin pagar comisión'], 'Lotes en la playa, la montaña o la ciudad. Desde $900, sin agente.'],
      '06_tajada': [['La agencia se lleva', 'una parte de tu casa'], 'Con nosotros pagas un precio fijo desde $900. Nada sale del precio de tu casa.'],
      '07_sin_exclusividad': [['Sin contrato', 'de exclusividad'], 'Sigue con tu agente si quieres. Nosotros te traemos más compradores.'],
      '08_garantia': [['¿Pocos mensajes?', 'Seguimos gratis'], 'Te garantizamos 80, 150 o 200 personas que te escriben, según tu plan.'],
      '09_dinero_completo': [['Vende tu casa', 'y cobra todo'], 'Sin comisión de agente. Pagas solo un precio fijo por los anuncios.'],
      '10_checklist': [['Gratis: 15 pasos', 'para vender más rápido'], 'Precio, fotos, documentos y cómo atender a los compradores. Escríbenos y te lo enviamos.'],
    },
    car: [
      [['¿Vendes tu casa', 'o terreno?'], 'Casa, apartamento o lote: todo sirve.'],
      [['Con agencia esperas', '7 u 8 meses'], ''],
      [['Y pagas $21,400', 'por una casa de $400k'], ''],
      [['Nosotros anunciamos', 'tu propiedad'], 'En Facebook, Instagram y Google.'],
      [['Los interesados', 'te escriben a ti'], 'Directo a tu WhatsApp.'],
      [['Precio fijo', 'desde $900'], 'Sin comisión. Si te escriben menos, seguimos gratis.'],
      [['¿Quieres vender?', 'Escríbeme'], 'Mándame el precio y la zona.'],
    ],
    reel: { q: '¿Vendes tu casa?', h400: 'Casa de $400,000', gone: 'se va a la agencia', pay: 'Con nosotros pagas', keep: 'Te quedan $18,100 más', ads: 'Anunciamos tu casa', write: 'Los compradores te escriben a ti', end: 'Sin comisión · Sin exclusividad' },
  },
  en: {
    dir: '02_Creatives_EN', badge: 'For owners selling a house, apartment or land', cta: 'Message me on WhatsApp', swipe: 'Swipe →',
    agency: 'Agency', us: 'Us', sale: 'Sale', yours: '100% yours', agentCut: '5% to the agent', commTax: '5% commission + tax', fixed: 'fixed price, no commission',
    yourMoney: 'Your money', toAgency: 'To the agency', months: 'months', excl: 'EXCLUSIVE', keepAgent: 'Keep your agent if you want', people: 'people message you',
    buyer: 'Interested buyer', msgs: ['Hi, is the house still available?', 'Can I come see it on Saturday?', "What's your best price?", 'Is the title in order?'],
    bank: 'Bank · now', bankT: 'Deposit received', bankV: '+$400,000', doc: 'Free checklist', docItems: ['Realistic price', 'Photos in daylight', 'Papers ready', 'Reply fast'],
    house: 'House', apt: 'Apartment', land: 'Land', sign: 'FOR SALE', priceFrom: 'from', noComm: 'No commission', keepGoing: 'Too few messages? We keep going free',
    c: {
      '01_sin_comision': [['Sell your house', 'without commission'], 'The money from the sale comes to you in full. You pay a fixed price from $900.'],
      '02_cuanto_pierdes': [['$400,000 house:', 'how much do you lose?'], 'With an agency you pay $21,400. With us $3,300. You keep $18,100 more.'],
      '03_te_escriben': [['Buyers', 'message you directly'], 'We advertise your house on Facebook, Instagram and Google. Interested people message you on WhatsApp.'],
      '04_meses': [["Don't wait", '7 or 8 months'], 'With an agency a sale takes 224 days on average. We start advertising in week one.'],
      '05_terreno': [['Selling land?', 'Without commission'], 'Lots by the beach, in the mountains or in the city. From $900, no agent.'],
      '06_tajada': [['The agency takes', 'a piece of your house'], 'With us you pay a fixed price from $900. Nothing comes out of your sale price.'],
      '07_sin_exclusividad': [['No exclusive', 'contract'], 'Keep your agent if you want. We bring you more buyers.'],
      '08_garantia': [['Too few messages?', 'We keep going free'], 'We guarantee 80, 150 or 200 people messaging you, depending on your plan.'],
      '09_dinero_completo': [['Sell your house', 'and keep it all'], 'No agent commission. You only pay a fixed price for the ads.'],
      '10_checklist': [['Free: 15 steps', 'to sell faster'], 'Price, photos, papers and how to handle buyers. Message us and we send it to you.'],
    },
    car: [
      [['Selling your house', 'or land?'], 'House, apartment or lot: all work.'],
      [['With an agency', 'you wait 7–8 months'], ''],
      [['And you pay $21,400', 'on a $400k house'], ''],
      [['We advertise', 'your property'], 'On Facebook, Instagram and Google.'],
      [['Interested people', 'message you'], 'Straight to your WhatsApp.'],
      [['Fixed price', 'from $900'], 'No commission. Too few messages? We keep going free.'],
      [['Want to sell?', 'Message me'], 'Send me the price and the area.'],
    ],
    reel: { q: 'Selling your house?', h400: '$400,000 house', gone: 'goes to the agency', pay: 'With us you pay', keep: 'You keep $18,100 more', ads: 'We advertise your house', write: 'Buyers message you', end: 'No commission · No exclusivity' },
  },
};

// ------------------------------------------------------------------ drawing kit (panel viewBox: 0 0 940 600)
const house = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-100 -4 L0 -92 L100 -4" fill="none" stroke="${C.gold}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M-78 -14 L0 -80 L78 -14 V96 H-78Z" fill="#20242a"/>
  <rect x="-52" y="8" width="38" height="34" rx="6" fill="#f2cf8a"/><rect x="14" y="8" width="38" height="34" rx="6" fill="#f2cf8a"/>
  <rect x="-18" y="52" width="36" height="44" rx="5" fill="${C.gold2}"/></g>`;
const building = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-60" y="-110" width="120" height="206" rx="8" fill="#20242a"/><rect x="-60" y="-110" width="120" height="14" rx="6" fill="${C.gold}"/>
  ${[0, 1, 2, 3].map(r => [0, 1].map(c => `<rect x="${-40 + c * 46}" y="${-80 + r * 40}" width="34" height="26" rx="4" fill="#f2cf8a"/>`).join('')).join('')}<rect x="-14" y="66" width="28" height="30" rx="4" fill="${C.gold2}"/></g>`;
const plot = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-110 30 L10 -10 L120 30 L0 74Z" fill="#163323" stroke="${C.green}" stroke-width="5"/><path d="M-110 30 L10 -10 L120 30 L0 74Z" fill="none" stroke="${C.gold}" stroke-width="4" stroke-dasharray="12 10" transform="scale(.82)"/>
  <rect x="-8" y="-90" width="8" height="80" fill="${C.gold}"/><path d="M0 -90 L46 -76 L0 -62Z" fill="${C.gold}"/></g>`;
const bills = (x, y, n = 6, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${Array.from({ length: n }, (_, i) => `<g transform="translate(0 ${-i * 14})"><rect x="-80" y="-34" width="160" height="68" rx="10" fill="${C.green2}" stroke="${C.green}" stroke-width="4"/><circle r="20" fill="none" stroke="${C.green}" stroke-width="4"/><text y="11" text-anchor="middle" font-size="30" font-weight="800" fill="${C.green}" ${F}>$</text></g>`).join('')}</g>`;
const arrow = (x1, x2, y, col = C.gold) => `<path d="M${x1} ${y} H${x2 - 6}" stroke="${col}" stroke-width="8" stroke-linecap="round"/><path d="M${x2 - 30} ${y - 22} L${x2} ${y} L${x2 - 30} ${y + 22}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
const pill = (x, y, label, col, w) => `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="-26" width="${w}" height="52" rx="26" fill="none" stroke="${col}" stroke-width="3"/><text y="10" text-anchor="middle" font-size="26" font-weight="700" fill="${col}" ${F}>${esc(label)}</text></g>`;
const mark = (x, y, ok, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="30" fill="${ok ? C.green : C.red}"/>${ok ? `<path d="M-13 0 L-3 11 L14 -11" fill="none" stroke="#0b2417" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` : `<path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#3a1010" stroke-width="7" stroke-linecap="round"/>`}</g>`;
const receipt = (x, y, title, val, sub, col, ok) => `<g transform="translate(${x} ${y})"><path d="M0 0 H360 V320 ${Array.from({ length: 9 }, (_, i) => `l-20 18 l-20 -18`).join(' ')}Z" fill="#20242a"/>
  <text x="180" y="62" text-anchor="middle" font-size="32" font-weight="800" fill="${C.muted}" ${F}>${esc(title)}</text>
  <text x="180" y="170" text-anchor="middle" font-size="68" font-weight="800" fill="${col}" ${F}>${esc(val)}</text>
  <text x="180" y="226" text-anchor="middle" font-size="24" fill="${C.muted}" font-family="Inter">${esc(sub)}</text>${mark(180, 276, ok, .9)}</g>`;
function phone(x, y, t, show = 4, s = 1) {
  // bubbles: width from the text, long lines wrap to two lines, never wider than the screen
  const MAXW = 326, CW = 11.2, PADX = 18;
  const lines = m => { const one = PADX * 2 + m.length * CW; if (one <= MAXW) return [m];
    const words = m.split(' '); let a = ''; const out = [];
    for (const w of words) { const tryA = a ? a + ' ' + w : w; if (PADX * 2 + tryA.length * CW > MAXW && a) { out.push(a); a = w; } else a = tryA; }
    out.push(a); return out; };
  let yy = 128;
  const bub = t.msgs.slice(0, show).map(m => { const L = lines(m), w = Math.min(MAXW, PADX * 2 + Math.max(...L.map(l => l.length)) * CW), h = 26 + L.length * 30;
    const g = `<g transform="translate(26 ${yy})"><rect width="${w}" height="${h}" rx="18" fill="#232a31"/>${L.map((l, i) => `<text x="${PADX}" y="${40 + i * 30}" font-size="21" fill="${C.text}" font-family="Inter">${esc(l)}</text>`).join('')}</g>`;
    yy += h + 16; return g; }).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect width="380" height="560" rx="50" fill="#0f1215" stroke="#343941" stroke-width="7"/><rect x="14" y="14" width="352" height="532" rx="38" fill="#0b141a"/>
    <path d="M14 52 a38 38 0 0 1 38 -38 H328 a38 38 0 0 1 38 38 V106 H14Z" fill="#1c2a31"/>
    <circle cx="64" cy="62" r="24" fill="${C.gold}"/>${house(64, 66, .17)}
    <text x="100" y="56" font-size="22" font-weight="700" fill="${C.text}" ${F}>${esc(t.buyer)}</text>
    ${logo('whatsapp', 22, C.wa, 112, 82)}<text x="128" y="89" font-size="18" fill="${C.wa}" font-family="Inter">WhatsApp</text>${bub}</g>`;
}
const calendar = (x, y, label, filled, col) => `<g transform="translate(${x} ${y})"><rect width="360" height="300" rx="26" fill="#20242a"/><path d="M0 26 a26 26 0 0 1 26 -26 H334 a26 26 0 0 1 26 26 V70 H0Z" fill="${col}"/>
  <text x="180" y="46" text-anchor="middle" font-size="28" font-weight="800" fill="#16120a" ${F}>${esc(label)}</text>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${24 + (i % 4) * 80}" y="${92 + Math.floor(i / 4) * 66}" width="68" height="52" rx="10" fill="${i < filled ? col : '#2c3138'}"/>`).join('')}</g>`;
const tile = (x, y, n, label, col) => `<g transform="translate(${x} ${y})"><rect width="250" height="220" rx="30" fill="#20242a" stroke="${col}" stroke-opacity=".5" stroke-width="3"/>${logo(n, 92, col, 125, 92)}<text x="125" y="186" text-anchor="middle" font-size="28" font-weight="700" fill="${C.text}" ${F}>${label}</text></g>`;
const platforms = (x, y) => `${tile(x, y, 'facebook', 'Facebook', C.gold)}${tile(x + 290, y, 'instagram', 'Instagram', C.gold)}${tile(x + 580, y, 'google', 'Google', C.green)}`;

// ------------------------------------------------------------------ illustrations per idea
const ILL = {
  '01_sin_comision': t => `${house(200, 300, 1.25)}${arrow(360, 580, 300)}<text x="470" y="270" text-anchor="middle" font-size="28" font-weight="700" fill="${C.gold}" ${F}>${esc(t.sale)}</text>
    <g><text x="470" y="360" text-anchor="middle" font-size="26" font-weight="700" fill="${C.red}" ${F}>${esc(t.agentCut)}</text><path d="M372 352 H568" stroke="${C.red}" stroke-width="5"/></g>
    ${bills(740, 340, 6, 1.1)}<text x="740" y="440" text-anchor="middle" font-size="32" font-weight="800" fill="${C.green}" ${F}>${esc(t.yours)}</text>`,
  '02_cuanto_pierdes': t => `${receipt(70, 110, t.agency, '−$21,400', t.commTax, C.red, false)}${receipt(510, 110, t.us, '$3,300', t.fixed, C.green, true)}`,
  '03_te_escriben': t => `${phone(280, 20, t, 4)}`,
  '04_meses': t => `${calendar(80, 120, t.agency, 8, C.red)}${calendar(500, 120, t.us, 3, C.green)}<text x="260" y="490" text-anchor="middle" font-size="46" font-weight="800" fill="${C.red}" ${F}>7–8 ${esc(t.months)}</text><text x="680" y="490" text-anchor="middle" font-size="46" font-weight="800" fill="${C.green}" ${F}>2–3 ${esc(t.months)}</text>`,
  '05_terreno': t => `${plot(470, 360, 2.2)}<g transform="translate(250 120)"><rect x="-6" y="0" width="12" height="190" fill="#7a5426"/><rect x="-120" y="16" width="240" height="88" rx="14" fill="${C.gold}"/><text y="74" text-anchor="middle" font-size="42" font-weight="800" fill="#1a1307" ${F}>${esc(t.sign)}</text></g>`,
  '06_tajada': t => { const r = 200, a = 0.62, p = (g) => `${(Math.cos(g) * r).toFixed(1)} ${(Math.sin(g) * r).toFixed(1)}`;
    return `<g transform="translate(300 300)"><path d="M0 0 L${p(a)} A${r} ${r} 0 1 1 ${p(0)} Z" fill="${C.gold}"/><g transform="translate(36 18)"><path d="M0 0 L${p(0)} A${r} ${r} 0 0 1 ${p(a)} Z" fill="${C.red}"/></g>${house(-40, 0, .6)}</g>
    <g transform="translate(600 230)"><rect width="40" height="40" rx="8" fill="${C.gold}"/><text x="60" y="30" font-size="30" font-weight="700" fill="${C.text}" ${F}>${esc(t.yourMoney)}</text><rect y="80" width="40" height="40" rx="8" fill="${C.red}"/><text x="60" y="110" font-size="30" font-weight="700" fill="${C.red}" ${F}>${esc(t.toAgency)}</text><text x="60" y="148" font-size="24" fill="${C.muted}" font-family="Inter">${esc(t.commTax)}</text></g>`; },
  '07_sin_exclusividad': t => `<g transform="translate(470 60)"><rect x="-170" y="0" width="340" height="440" rx="18" fill="#f2ebdd"/><rect x="-130" y="40" width="260" height="22" rx="6" fill="#1d2025"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="-130" y="${96 + i * 40}" width="${i % 3 === 2 ? 170 : 260}" height="12" rx="6" fill="#c9c1b2"/>`).join('')}
    <g transform="rotate(-14)"><rect x="-200" y="200" width="400" height="96" rx="14" fill="none" stroke="${C.red}" stroke-width="10"/><text y="266" text-anchor="middle" font-size="48" font-weight="800" fill="${C.red}" ${F}>${esc(t.excl)}</text></g>${mark(150, 20, false, 1.3)}</g>`,
  '08_garantia': t => `<g transform="translate(470 300)"><path d="M0 -230 L190 -160 V0 C190 130 100 210 0 250 C-100 210 -190 130 -190 0 V-160Z" fill="#14301f" stroke="${C.green}" stroke-width="8"/>
    <text y="10" text-anchor="middle" font-size="150" font-weight="800" fill="${C.green}" ${F}>80+</text><text y="80" text-anchor="middle" font-size="30" font-weight="600" fill="${C.text}" font-family="Inter">${esc(t.people)}</text>${logo('whatsapp', 64, C.wa, 0, -150)}</g>`,
  '09_dinero_completo': t => `${house(170, 300, 1.15)}${arrow(310, 420, 300)}<g transform="translate(450 205)"><rect width="440" height="190" rx="34" fill="#20242a"/><rect x="28" y="38" width="76" height="76" rx="20" fill="${C.green2}"/><text x="66" y="92" text-anchor="middle" font-size="46" font-weight="800" fill="#fff" ${F}>$</text>
    <text x="128" y="64" font-size="22" fill="${C.muted}" font-family="Inter">${esc(t.bank)}</text><text x="128" y="102" font-size="30" font-weight="700" fill="${C.text}" ${F}>${esc(t.bankT)}</text><text x="28" y="162" font-size="46" font-weight="800" fill="${C.green}" ${F}>${esc(t.bankV)}</text></g>`,
  '10_checklist': t => `<g transform="translate(270 40)"><rect width="400" height="520" rx="26" fill="#f2ebdd"/><path d="M0 26 a26 26 0 0 1 26 -26 H374 a26 26 0 0 1 26 26 V90 H0Z" fill="${C.gold}"/><text x="200" y="60" text-anchor="middle" font-size="32" font-weight="800" fill="#1a1307" ${F}>${esc(t.doc)}</text>
    ${t.docItems.map((it, i) => `<g transform="translate(36 ${136 + i * 92})"><rect width="46" height="46" rx="10" fill="#fff" stroke="${C.gold2}" stroke-width="3"/><path d="M11 24 L20 33 L36 14" fill="none" stroke="${C.green2}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><text x="70" y="33" font-size="28" font-weight="600" fill="#1d2025" font-family="Inter">${esc(it)}</text></g>`).join('')}</g>`,
};
const CAR_ILL = [
  t => `${house(180, 330, 1.05)}${building(470, 320, 1.15)}${plot(760, 360, 1.25)}<text x="180" y="490" text-anchor="middle" font-size="32" font-weight="700" fill="${C.text}" ${F}>${esc(t.house)}</text><text x="470" y="490" text-anchor="middle" font-size="32" font-weight="700" fill="${C.text}" ${F}>${esc(t.apt)}</text><text x="760" y="490" text-anchor="middle" font-size="32" font-weight="700" fill="${C.text}" ${F}>${esc(t.land)}</text>`,
  t => `${calendar(290, 110, t.agency, 8, C.red)}<text x="470" y="490" text-anchor="middle" font-size="48" font-weight="800" fill="${C.red}" ${F}>7–8 ${esc(t.months)}</text>`,
  t => `${receipt(290, 100, t.agency, '−$21,400', t.commTax, C.red, false)}`,
  t => `${platforms(65, 190)}`,
  t => `${phone(280, 20, t, 4)}`,
  t => `<g transform="translate(470 290)"><path d="M-230 -110 H170 L250 0 L170 110 H-230Z" fill="#20242a" stroke="${C.gold}" stroke-width="6"/><circle cx="170" cy="0" r="18" fill="${C.bg}"/><text x="-40" y="22" text-anchor="middle" font-size="104" font-weight="800" fill="${C.gold}" ${F}>$900</text><text x="-40" y="-60" text-anchor="middle" font-size="26" fill="${C.muted}" font-family="Inter">${esc(t.priceFrom)}</text></g>${mark(250, 500, true, .9)}<text x="300" y="510" font-size="30" font-weight="700" fill="${C.text}" ${F}>${esc(t.noComm)}</text>`,
  t => `<circle cx="470" cy="250" r="140" fill="${C.wa}"/>${logo('whatsapp', 170, '#fff', 470, 250)}<text x="470" y="490" text-anchor="middle" font-size="58" font-weight="800" fill="${C.text}" ${F}>${PHONE}</text>`,
];

// ------------------------------------------------------------------ the fixed layout
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
*{box-sizing:border-box;margin:0}html,body{background:${C.bg};color:${C.text};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.cv{position:relative;overflow:hidden;display:flex;flex-direction:column;background:radial-gradient(80% 40% at 50% 0%,rgba(214,176,115,.13),transparent 70%),${C.bg}}
.top{display:flex;justify-content:space-between;align-items:center;gap:20px}
.badge{display:inline-flex;align-items:center;gap:14px;padding:16px 26px 16px 18px;border-radius:999px;background:${C.gold};color:#1a1307;font:800 29px/1.15 'Plus Jakarta Sans'}
.brand{font:800 26px/1 'Plus Jakarta Sans';color:${C.text};white-space:nowrap}.brand i{font-style:normal;color:${C.gold2};font-weight:600}
h1{font-family:'Plus Jakarta Sans';font-weight:800;letter-spacing:-.03em;line-height:1.02}h1 span{color:${C.gold}}
.panel{border-radius:44px;background:${C.surf};border:2px solid ${C.line};overflow:hidden;display:flex;align-items:center;justify-content:center}
.sub{color:#d3cdc2;line-height:1.35}
.foot{display:flex;justify-content:space-between;align-items:center;gap:20px}
.cta{display:inline-flex;align-items:center;gap:16px;padding:24px 38px;border-radius:999px;background:${C.wa};color:#fff;font:800 32px/1 'Plus Jakarta Sans';white-space:nowrap}
.num{font:700 26px/1.3 'Plus Jakarta Sans';color:${C.muted};text-align:right}.num b{display:block;color:${C.text};font-size:30px}`;
const houseBadge = `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#1a1307" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>`;
const waBtn = s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="${ICON.whatsapp}" fill="#fff"/></svg>`;
function layout(t, h1, sub, ill, { H = 1350, foot = 'cta', page = '' } = {}) {
  const story = H > 1500, pad = story ? 70 : 60, panelH = story ? 860 : 600;
  const footer = foot === 'cta'
    ? `<div class="foot"><div class="cta">${waBtn(40)}${esc(t.cta)}</div><div class="num">Restate Deals<b>${PHONE}</b></div></div>`
    : `<div class="foot"><div class="brand">Restate<i> Deals</i></div><div class="num" style="font-size:30px;color:${C.gold}">${esc(foot)}</div></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}body{width:1080px;height:${H}px}</style></head><body>
  <div class="cv" style="width:1080px;height:${H}px;padding:${story ? '120px' : `${pad}px`} ${pad}px ${story ? '110px' : `${pad}px`};gap:${story ? 44 : 30}px">
    <div class="top"><div class="badge">${houseBadge}${esc(t.badge)}</div>${page ? `<div class="brand" style="color:${C.muted}">${page}</div>` : ''}</div>
    <h1 style="font-size:${story ? 104 : 88}px">${esc(h1[0])}<br><span>${esc(h1[1])}</span></h1>
    <div class="panel" style="height:${panelH}px;flex:none"><svg viewBox="0 0 940 600" width="${story ? 940 : 960}" height="${panelH}" preserveAspectRatio="xMidYMid meet">${ill}</svg></div>
    ${sub ? `<p class="sub" style="font-size:${story ? 36 : 31}px">${esc(sub)}</p>` : '<div style="flex:1"></div>'}
    <div style="margin-top:auto">${footer}</div>
  </div></body></html>`;
}

// ------------------------------------------------------------------ reels
function reel(t, kind) {
  const R = t.reel;
  const sc = (a, b, inner) => `<div class="sc" data-in="${a}" data-out="${b}">${inner}</div>`;
  const it = (d, html, extra = '') => `<div class="a" data-d="${d}" ${extra}>${html}</div>`;
  const big = (s, col = C.text, size = 100) => `<h1 style="font-size:${size}px;color:${col};text-align:center">${esc(s)}</h1>`;
  const box = (inner, h = 600) => `<div class="panel" style="width:940px;height:${h}px"><svg viewBox="0 0 940 600" width="940" height="${h}">${inner}</svg></div>`;
  const end = sc(11, 15, it(0, `<svg width="300" height="300" viewBox="0 0 300 300"><circle cx="150" cy="150" r="150" fill="${C.wa}"/>${logo('whatsapp', 180, '#fff', 150, 150)}</svg>`) + it(0.3, big(R.end, C.text, 66)) + it(0.6, `<div class="cta" style="font-size:44px;padding:32px 52px">${waBtn(52)}${esc(t.cta)}</div>`) + it(0.9, `<div class="num" style="text-align:center;font-size:44px;color:${C.text}">${PHONE}</div>`));
  let body;
  if (kind === 'dinero') {
    body = sc(0, 3, it(0, box(`${house(470, 330, 1.7)}`)) + it(0.4, big(R.q)))
      + sc(3, 7, it(0, big(R.h400, C.gold, 90)) + it(0.3, box(`${bills(300, 380, 7, 1.3)}<g class="fly">${bills(620, 330, 2, 1.3)}</g>`, 520)) + it(0.9, big('−$21,400', C.red, 130)) + it(1.2, `<p class="sub" style="font-size:44px;text-align:center">${esc(R.gone)}</p>`))
      + sc(7, 11, it(0, big(R.pay, C.text, 80)) + it(0.3, big('$3,300', C.green, 170)) + it(0.8, box(`${bills(470, 400, 8, 1.4)}`, 460)) + it(1.2, big(R.keep, C.gold, 74)))
      + end;
  } else {
    body = sc(0, 3, it(0, box(`${house(470, 330, 1.7)}`)) + it(0.4, big(R.q)))
      + sc(3, 6, it(0, big(R.ads, C.text, 88)) + it(0.4, box(platforms(65, 190), 600)))
      + sc(6, 11, it(0, big(R.write, C.gold, 84)) + [1, 2, 3, 4].map(k => it(0.4 + k * 0.7, box(phone(280, 20, t, k), 600), `data-out="${0.4 + (k + 1) * 0.7}"`)).join(''))
      + end;
  }
  const extra = `.sc{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:40px;padding:180px 70px 120px}.a{opacity:0}`;
  const js = `<script>const ease=x=>1-Math.pow(1-x,3);
  window.setT=t=>{document.querySelectorAll('.sc').forEach(s=>{const a=+s.dataset.in,b=+s.dataset.out,on=t>=a&&t<b;s.style.display=on?'flex':'none';if(!on)return;
   s.querySelectorAll(':scope > .a').forEach(e=>{const st=a+(+e.dataset.d),p=Math.min(1,Math.max(0,(t-st)/0.45)),q=Math.min(1,Math.max(0,(b-t)/0.25));
     const end=e.dataset.out?a+(+e.dataset.out):null;e.style.display=(end!==null&&(t<st||t>=end))?'none':'';
     e.style.opacity=ease(p)*q;e.style.transform='translateY('+((1-ease(p))*50)+'px)';});
   s.querySelectorAll('.fly').forEach(f=>{const p=Math.min(1,Math.max(0,(t-a-1.0)/1.3));f.setAttribute('transform','translate('+(p*360)+' '+(-p*300)+') rotate('+(p*20)+')');f.style.opacity=1-p*0.95;});});};</script>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${extra}body{width:1080px;height:1920px}</style></head><body><div class="cv" style="width:1080px;height:1920px">
    <div class="top" style="position:absolute;top:90px;left:70px;right:70px"><div class="badge">${houseBadge}${esc(t.badge)}</div></div>${body}</div>${js}</body></html>`;
}

// ------------------------------------------------------------------ run
async function main() {
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const pg = await (await browser.newContext({ viewport: { width: 1080, height: 1350 } })).newPage();
  const shot = async (html, file, h) => {
    await pg.setViewportSize({ width: 1080, height: h });
    await pg.setContent(html, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    mkdirSync(path.dirname(file), { recursive: true });
    await pg.screenshot({ path: file, type: 'png' });
    console.log('png', path.relative(OUT, file));
  };
  if (ONLY !== 'reels') for (const [lang, t] of Object.entries(T)) {
    const dir = path.join(OUT, t.dir);
    rmSync(dir, { recursive: true, force: true });
    for (const [name, [h1, sub]] of Object.entries(t.c)) await shot(layout(t, h1, sub, ILL[name](t)), path.join(dir, 'Feed_4x5', `${name}_${lang}.png`), 1350);
    for (const name of ['01_sin_comision', '02_cuanto_pierdes', '03_te_escriben']) { const [h1, sub] = t.c[name]; await shot(layout(t, h1, sub, ILL[name](t), { H: 1920 }), path.join(dir, 'Stories_9x16', `${name}_${lang}.png`), 1920); }
    for (let i = 0; i < t.car.length; i++) { const [h1, sub] = t.car[i], last = i === t.car.length - 1;
      await shot(layout(t, h1, sub, CAR_ILL[i](t), { foot: last ? 'cta' : t.swipe, page: `${i + 1}/${t.car.length}` }), path.join(dir, 'Carrusel', `slide_${i + 1}_${lang}.png`), 1350); }
  }
  if (ONLY !== 'static') {
    rmSync(path.join(OUT, '03_Reels'), { recursive: true, force: true });
    for (const [lang, t] of Object.entries(T)) for (const kind of ['dinero', 'mensajes']) {
      await pg.setViewportSize({ width: 1080, height: 1920 });
      await pg.setContent(reel(t, kind), { waitUntil: 'networkidle' });
      await pg.evaluate(() => document.fonts.ready);
      const tmp = path.join(os.tmpdir(), `reel3_${lang}_${kind}`);
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
