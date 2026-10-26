// WhaleHome Telegram bot: Cloudflare Worker (one file, no dependencies).
//
// Settings in Cloudflare (Worker -> Settings -> Variables and secrets). Never put them in this file:
//   BOT_TOKEN   secret  token from @BotFather
//   SETUP_KEY   secret  random string (letters, digits, - and _). Protects /setup, /admin and the webhook.
//   LEADS_URL   text    Apps Script web app URL of the WhaleHome CRM (optional; without it leads only go to Telegram)
//   STATE       KV namespace binding: user language, interest, budget and the admin chat
//
// Custom domain: bot.whalehome.io (the site sends quiz leads to /lead; "/" redirects to t.me/<bot>).
// After deploy open https://bot.whalehome.io/setup?key=<SETUP_KEY> once. If Artem pressed Start before that,
// his chat becomes the admin chat by itself; otherwise send "/admin <SETUP_KEY>" from his account.
// Leads arrive in that chat; reply to a lead message to answer the user.

const SITE = "https://whalehome.io";
const CALENDLY = "https://calendly.com/voinov-agency/real-estate-deals-ceo";
const WHATSAPP = "50764566336";
const LANGS = ["en", "es", "ru"];

/* ---------- texts ---------- */
const TX = {
  start: {
    en: "<b>WhaleHome</b> · homes in Panama for crypto people.\n\nI'm Artem Voinov. I help you buy a home in Panama and pay in USDT, USDC, BTC, ETH or SOL.\n\n<b>What I do</b>\n• Pick homes for your budget, from $150k to $7M\n• Panama residency with a home from $300k\n• Online consultation · $1,000\n• VIP tour of Panama, 3 days · $10,000\n• The whole deal: lawyer, escrow, residency papers\n\nPick what you need below.",
    es: "<b>WhaleHome</b> · propiedades en Panamá para la gente crypto.\n\nSoy Artem Voinov. Te ayudo a comprar una propiedad en Panamá y pagar en USDT, USDC, BTC, ETH o SOL.\n\n<b>Qué hago</b>\n• Elijo propiedades para tu presupuesto, de $150k a $7M\n• Residencia en Panamá con una propiedad desde $300k\n• Consulta online · $1,000\n• Tour VIP por Panamá, 3 días · $10,000\n• Todo el trato: abogado, escrow, papeles de residencia\n\nElige lo que necesitas abajo.",
    ru: "<b>WhaleHome</b> · недвижимость в Панаме для людей из крипты.\n\nЯ Артём Войнов. Помогаю купить недвижимость в Панаме и заплатить в USDT, USDC, BTC, ETH или SOL.\n\n<b>Что я делаю</b>\n• Подбираю объекты под ваш бюджет, от $150k до $7M\n• ВНЖ Панамы при покупке от $300k\n• Онлайн-консультация · $1,000\n• VIP-тур по Панаме, 3 дня · $10,000\n• Веду всю сделку: юрист, эскроу, документы на ВНЖ\n\nВыберите, что вам нужно.",
  },
  bHomes: { en: "🏠 Pick a home", es: "🏠 Elegir propiedad", ru: "🏠 Подобрать объект" },
  bRoi: { en: "📈 Calculate ROI", es: "📈 Calcular ROI", ru: "📈 Рассчитать доход" },
  bConsult: { en: "📞 Consultation · $1,000", es: "📞 Consulta · $1,000", ru: "📞 Консультация · $1,000" },
  bTour: { en: "🚁 VIP tour · $10,000", es: "🚁 Tour VIP · $10,000", ru: "🚁 VIP-тур · $10,000" },
  bContact: { en: "✍️ Leave my contact", es: "✍️ Dejar mi contacto", ru: "✍️ Оставить контакт" },
  bSite: { en: "🌐 Website", es: "🌐 Sitio web", ru: "🌐 Сайт" },
  bMenu: { en: "← Menu", es: "← Menú", ru: "← Меню" },
  bCall: { en: "📞 Discuss on a call", es: "📞 Hablar en una llamada", ru: "📞 Обсудить на звонке" },
  bDetails: { en: "Details on the site", es: "Detalles en el sitio", ru: "Подробнее на сайте" },
  bBookCall: { en: "📅 Pick a time for the call", es: "📅 Elegir hora de la llamada", ru: "📅 Выбрать время звонка" },
  bBookTour: { en: "✍️ Book the tour", es: "✍️ Reservar el tour", ru: "✍️ Забронировать тур" },
  bRoiSite: { en: "Change the numbers on the site", es: "Cambiar los números en el sitio", ru: "Изменить цифры на сайте" },
  budgetQ: { en: "What is your budget?", es: "¿Cuál es tu presupuesto?", ru: "Какой у вас бюджет?" },
  budgets: [
    { id: "b0", min: 0, max: 299999, crm: "Under $300k", l: { en: "Under $300k", es: "Menos de $300k", ru: "До $300k" } },
    { id: "b1", min: 300000, max: 500000, crm: "$300k–$500k", l: { en: "$300k–$500k", es: "$300k–$500k", ru: "$300k–$500k" } },
    { id: "b2", min: 500001, max: 1000000, crm: "$500k–$1M", l: { en: "$500k–$1M", es: "$500k–$1M", ru: "$500k–$1M" } },
    { id: "b3", min: 1000001, max: 1e12, crm: "$1M–$3M", l: { en: "$1M and more", es: "$1M o más", ru: "От $1M" } },
  ],
  homesFound: { en: "Homes for this budget:", es: "Propiedades para este presupuesto:", ru: "Объекты под этот бюджет:" },
  homesNone: { en: "No listed homes in this range right now. I can find one for you: leave your contact.", es: "Ahora no hay propiedades publicadas en este rango. Puedo buscar una para ti: deja tu contacto.", ru: "Сейчас нет объектов в этом диапазоне на сайте. Могу подобрать: оставьте контакт." },
  homesAfter: { en: "Want me to make a personal shortlist? Leave your contact and I'll send it here.", es: "¿Quieres una selección personal? Deja tu contacto y te la envío aquí.", ru: "Сделать персональную подборку? Оставьте контакт, и я пришлю её сюда." },
  residency: { en: "Residency", es: "Residencia", ru: "ВНЖ" },
  from: { en: "from", es: "desde", ru: "от" },
  roiQ: { en: "What price of home are you looking at?", es: "¿Qué precio de propiedad te interesa?", ru: "Какая цена объекта вас интересует?" },
  roiRes: {
    en: (p, mo, yr, total) => `<b>Home for ${p}</b>\n\nRent: about <b>${mo}</b> a month, <b>${yr}</b> a year.\nIn 5 years, with rent and price growth: about <b>+${total}</b>.\n\n<i>Estimate: 8% rent a year and 4% price growth a year, as in the calculator on the site.</i>`,
    es: (p, mo, yr, total) => `<b>Propiedad de ${p}</b>\n\nAlquiler: unos <b>${mo}</b> al mes, <b>${yr}</b> al año.\nEn 5 años, con alquiler y subida de precio: unos <b>+${total}</b>.\n\n<i>Estimación: 8% de alquiler al año y 4% de subida de precio al año, como en la calculadora del sitio.</i>`,
    ru: (p, mo, yr, total) => `<b>Объект за ${p}</b>\n\nАренда: около <b>${mo}</b> в месяц, <b>${yr}</b> в год.\nЗа 5 лет с арендой и ростом цены: около <b>+${total}</b>.\n\n<i>Оценка: аренда 8% в год и рост цены 4% в год, как в калькуляторе на сайте.</i>`,
  },
  consult: {
    en: "<b>Online consultation · $1,000</b>\n\n• 2-hour video call with me\n• Shortlist of 10 homes for your budget\n• Call with a Panama lawyer\n• Residency and tax plan\n• How to pay with your coins\n\n100% credited if you book the VIP tour.",
    es: "<b>Consulta online · $1,000</b>\n\n• Videollamada de 2 horas conmigo\n• 10 propiedades para tu presupuesto\n• Llamada con un abogado panameño\n• Plan de residencia e impuestos\n• Cómo pagar con tus monedas\n\n100% se descuenta si reservas el tour VIP.",
    ru: "<b>Онлайн-консультация · $1,000</b>\n\n• 2 часа видеозвонка со мной\n• Подборка из 10 объектов под ваш бюджет\n• Созвон с юристом из Панамы\n• План по ВНЖ и налогам\n• Как заплатить вашей криптой\n\n100% засчитывается в VIP-тур.",
  },
  tour: {
    en: "<b>VIP Panama tour · $10,000</b>\n3 days. See it, feel it, choose.\n\n• Helicopter flight over the city and islands\n• VIP transfers with a private driver\n• 5-star hotel, best restaurants, yacht day\n• Private viewings of 8–10 homes\n• Meetings with a lawyer and a bank\n• Dinner with the Panama crypto community\n\n100% credited to your purchase.",
    es: "<b>Tour VIP Panamá · $10,000</b>\n3 días. Velo, siéntelo, elige.\n\n• Vuelo en helicóptero sobre la ciudad e islas\n• Traslados VIP con chofer privado\n• Hotel 5 estrellas, mejores restaurantes, día en yate\n• Visitas privadas a 8–10 propiedades\n• Reuniones con abogado y banco\n• Cena con la comunidad crypto de Panamá\n\n100% se descuenta de tu compra.",
    ru: "<b>VIP-тур по Панаме · $10,000</b>\n3 дня. Увидеть, почувствовать, выбрать.\n\n• Полёт на вертолёте над городом и островами\n• VIP-трансферы с личным водителем\n• Отель 5*, лучшие рестораны, день на яхте\n• Частные показы 8–10 объектов\n• Встречи с юристом и банком\n• Ужин с крипто-комьюнити Панамы\n\n100% засчитывается в покупку.",
  },
  askContact: {
    en: "Send your phone with the button below, or just type your WhatsApp, email or a question.",
    es: "Envía tu teléfono con el botón de abajo o escribe tu WhatsApp, email o una pregunta.",
    ru: "Отправьте телефон кнопкой ниже или просто напишите WhatsApp, email или вопрос.",
  },
  sharePhone: { en: "📱 Send my phone", es: "📱 Enviar mi teléfono", ru: "📱 Отправить телефон" },
  thanks: {
    en: "Thank you. I'll write to you here within one business day.",
    es: "Gracias. Te escribiré aquí en un día hábil.",
    ru: "Спасибо. Я напишу вам здесь в течение рабочего дня.",
  },
  got: { en: "Got it. I'll reply here soon.", es: "Recibido. Te responderé aquí pronto.", ru: "Получил. Скоро отвечу здесь." },
  langQ: { en: "Choose the language", es: "Elige el idioma", ru: "Выберите язык" },
};
const t = (k, l) => (TX[k][l] !== undefined ? TX[k][l] : TX[k].en);

const INTEREST = { homes: "Buy a home", roi: "ROI calculation", consult: "Consultation", tour: "VIP tour" };
const ROI_PRICES = [300000, 500000, 1000000, 2000000];
const usd = n => "$" + Math.round(n).toLocaleString("en-US");
const short = n => (n >= 1e6 ? "$" + n / 1e6 + "M" : "$" + n / 1e3 + "k");
const esc = s => String(s || "").replace(/[<&>]/g, c => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" }[c]));

const siteUrl = (l, hash = "", camp = "bot") => `${SITE}/${l}/?utm_source=telegram&utm_medium=bot&utm_campaign=${camp}${hash}`;
const calUrl = (camp, note) => `${CALENDLY}?utm_source=telegram&utm_medium=bot&utm_campaign=${camp}&a1=${encodeURIComponent(note)}`;
const waUrl = l => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent({
  en: "Hi Artem. I am interested in buying property in Panama with crypto.",
  es: "Hola Artem. Me interesa comprar una propiedad en Panamá con crypto.",
  ru: "Здравствуйте, Артём. Интересует покупка недвижимости в Панаме за крипту.",
}[l])}`;

/* ---------- keyboards ---------- */
const kbMenu = l => ({
  inline_keyboard: [
    [{ text: t("bHomes", l), callback_data: "homes" }, { text: t("bRoi", l), callback_data: "roi" }],
    [{ text: t("bConsult", l), callback_data: "consult" }],
    [{ text: t("bTour", l), callback_data: "tour" }],
    [{ text: t("bContact", l), callback_data: "contact" }],
    [{ text: t("bSite", l), url: siteUrl(l) }, { text: "💬 WhatsApp", url: waUrl(l) }],
    LANGS.map(x => ({ text: (x === l ? "• " : "") + x.toUpperCase(), callback_data: "lang:" + x })),
  ],
});
const kbBack = (l, extra = []) => ({ inline_keyboard: [...extra, [{ text: t("bMenu", l), callback_data: "menu" }]] });

/* ---------- Telegram API ---------- */
async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  return r.json();
}
const send = (env, chat_id, text, reply_markup) =>
  tg(env, "sendMessage", { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup });

/* ---------- state (KV) ---------- */
async function getUser(env, id) {
  try { return JSON.parse((await env.STATE.get("u:" + id)) || "{}"); } catch { return {}; }
}
const putUser = (env, id, u) => env.STATE.put("u:" + id, JSON.stringify(u));
async function adminId(env) { return env.ADMIN_CHAT_ID || (await env.STATE.get("admin")); }

/* ---------- homes ---------- */
async function homes() {
  const r = await fetch(SITE + "/homes.json", { cf: { cacheTtl: 600 } });
  return r.ok ? r.json() : [];
}

/* ---------- leads ---------- */
async function saveLead(env, from, u, contact, note) {
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ");
  const tgName = from.username ? "@" + from.username : "tg id " + from.id;
  const interest = INTEREST[u.interest] || "";
  if (env.LEADS_URL && !u.lead) {
    const body = new URLSearchParams({
      source: "Telegram bot", name, contact: [contact, tgName].filter(Boolean).join(" · "),
      interest, budget: u.budget || "", lang: (u.lang || "en").toUpperCase(), notes: note || "",
    });
    try { await fetch(env.LEADS_URL, { method: "POST", body }); } catch {}
  }
  const admin = await adminId(env);
  if (admin) {
    await send(env, admin,
      `🐋 <b>${u.lead ? "Message" : "New lead"}</b> · Telegram bot\n` +
      `${esc(name)} · ${esc(tgName)}\n` +
      (contact ? `Contact: ${esc(contact)}\n` : "") +
      (interest ? `Interest: ${interest}\n` : "") +
      (u.budget ? `Budget: ${u.budget}\n` : "") +
      `Language: ${(u.lang || "en").toUpperCase()}\n` +
      (note ? `\n${esc(note)}\n` : "") +
      `\n<i>Reply to this message to answer. #u${from.id}</i>`);
  }
  u.lead = 1;
}

/* ---------- leads from the whalehome.io quiz: to the CRM and to Artem ---------- */
async function siteLead(req, env, ctx) {
  const cors = { "access-control-allow-origin": "*" };
  let p;
  try { p = Object.fromEntries(new URLSearchParams(await req.text())); } catch { return new Response("bad", { status: 400, headers: cors }); }
  if (p.hp || (!p.name && !p.whatsapp)) return new Response("ok", { headers: cors });
  const f = k => String(p[k] || "").slice(0, 300);
  ctx.waitUntil((async () => {
    if (env.LEADS_URL) {
      const body = new URLSearchParams({ source: "Website quiz", name: f("name"), whatsapp: f("whatsapp"), interest: "Buy a home",
        lang: f("lang"), notes: f("notes"), src: f("src"), page: f("page") });
      try { await fetch(env.LEADS_URL, { method: "POST", body }); } catch {}
    }
    const admin = await adminId(env);
    if (admin) await send(env, admin, `🐋 <b>New lead</b> · whalehome.io quiz\n${esc(f("name"))} · ${esc(f("whatsapp"))}\nLanguage: ${esc(f("lang").toUpperCase())}` +
      (p.notes ? `\n\n${esc(f("notes"))}` : "") + (p.src ? `\nSource: ${esc(f("src"))}` : ""));
  })());
  return new Response("ok", { headers: cors });
}

/* ---------- screens ---------- */
async function showMenu(env, chat, l) {
  const photo = `${SITE}/${l === "en" ? "og.jpg" : "og-" + l + ".jpg"}`;
  const r = await tg(env, "sendPhoto", { chat_id: chat, photo, caption: t("start", l), parse_mode: "HTML", reply_markup: kbMenu(l) });
  if (!r.ok) await send(env, chat, t("start", l), kbMenu(l));
}

async function showHomes(env, chat, l, b) {
  const all = await homes();
  const list = all.filter(h => h.p >= b.min && h.p <= b.max).slice(0, 4);
  if (!list.length) return send(env, chat, t("homesNone", l), kbBack(l, [[{ text: t("bContact", l), callback_data: "contact" }]]));
  await send(env, chat, t("homesFound", l));
  for (const h of list) {
    const caption = `<b>${esc(h.t[l] || h.t.en)}</b>\n${esc(h.a)} · ${esc((h.s[l] || h.s.en).join(" · "))}\n` +
      `${h.from ? t("from", l) + " " : ""}<b>${usd(h.p)}</b>${h.p >= 300000 ? " · " + t("residency", l) + " ✓" : ""}`;
    const kb = { inline_keyboard: [[
      { text: t("bDetails", l), url: siteUrl(l, "#homes", "home_" + h.k) },
      { text: t("bCall", l), url: calUrl("home_" + h.k, `Home: ${h.t.en} (${h.a})`) },
    ]] };
    const r = await tg(env, "sendPhoto", { chat_id: chat, photo: `${SITE}/img/bot/${h.k}.jpg`, caption, parse_mode: "HTML", reply_markup: kb });
    if (!r.ok) await send(env, chat, caption, kb);
  }
  await send(env, chat, t("homesAfter", l), kbBack(l, [[{ text: t("bContact", l), callback_data: "contact" }]]));
}

function showRoi(env, chat, l, p) {
  const yr = p * 0.08, mo = yr / 12, total = yr * 5 + (p * Math.pow(1.04, 5) - p);
  return send(env, chat, TX.roiRes[l](usd(p), usd(mo), usd(yr), usd(total)), kbBack(l, [
    [{ text: t("bRoiSite", l), url: siteUrl(l, "#calc", "roi") }],
    [{ text: t("bCall", l), url: calUrl("roi", `ROI: home ${usd(p)}`) }],
  ]));
}

function askContact(env, chat, l) {
  return send(env, chat, t("askContact", l), {
    keyboard: [[{ text: t("sharePhone", l), request_contact: true }]],
    resize_keyboard: true, one_time_keyboard: true,
  });
}

/* ---------- update handler ---------- */
async function onCallback(env, q) {
  const chat = q.message.chat.id, from = q.from, data = q.data || "";
  const u = await getUser(env, from.id);
  const l = u.lang || pickLang(from.language_code);
  u.lang = l;
  if (q.id) await tg(env, "answerCallbackQuery", { callback_query_id: q.id });

  if (data.startsWith("lang:")) { u.lang = LANGS.includes(data.slice(5)) ? data.slice(5) : "en"; await putUser(env, from.id, u); return showMenu(env, chat, u.lang); }
  if (data === "menu") { await putUser(env, from.id, u); return showMenu(env, chat, l); }
  if (data === "homes") {
    u.interest = "homes"; await putUser(env, from.id, u);
    return send(env, chat, t("budgetQ", l), kbBack(l, TX.budgets.map(b => [{ text: b.l[l], callback_data: "budget:" + b.id }])));
  }
  if (data.startsWith("budget:")) {
    const b = TX.budgets.find(x => x.id === data.slice(7)) || TX.budgets[1];
    u.budget = b.crm; await putUser(env, from.id, u);
    return showHomes(env, chat, l, b);
  }
  if (data === "roi") {
    u.interest = u.interest || "roi"; await putUser(env, from.id, u);
    return send(env, chat, t("roiQ", l), kbBack(l, [ROI_PRICES.map(p => ({ text: short(p), callback_data: "roi:" + p }))]));
  }
  if (data.startsWith("roi:")) return showRoi(env, chat, l, +data.slice(4) || 500000);
  if (data === "consult") {
    u.interest = "consult"; await putUser(env, from.id, u);
    return send(env, chat, t("consult", l), kbBack(l, [
      [{ text: t("bBookCall", l), url: calUrl("consult", "Consultation $1,000 (Telegram bot)") }],
      [{ text: t("bContact", l), callback_data: "contact" }],
    ]));
  }
  if (data === "tour") {
    u.interest = "tour"; await putUser(env, from.id, u);
    return send(env, chat, t("tour", l), kbBack(l, [
      [{ text: t("bBookTour", l), callback_data: "contact" }],
      [{ text: "💬 WhatsApp", url: waUrl(l) }],
    ]));
  }
  if (data === "contact") { u.await = "contact"; await putUser(env, from.id, u); return askContact(env, chat, l); }
}

async function onMessage(env, m) {
  const chat = m.chat.id, from = m.from, text = (m.text || "").trim();
  if (m.chat.type !== "private") return;
  const admin = await adminId(env);

  // admin: register, and reply to a lead by replying to its message
  if (text.startsWith("/admin")) {
    if (env.SETUP_KEY && text.split(/\s+/)[1] === env.SETUP_KEY) {
      await env.STATE.put("admin", String(chat));
      return send(env, chat, "✅ This chat now gets WhaleHome leads. Reply to a lead message to answer the user.");
    }
    return;
  }
  if (admin && String(chat) === String(admin) && m.reply_to_message) {
    const tag = ((m.reply_to_message.text || m.reply_to_message.caption || "").match(/#u(\d+)/) || [])[1];
    if (tag && text) {
      const r = await tg(env, "sendMessage", { chat_id: tag, text });
      return send(env, chat, r.ok ? "✓ Sent" : "Not sent: " + esc(r.description || ""));
    }
  }

  const u = await getUser(env, from.id);
  const l = u.lang || pickLang(from.language_code);
  u.lang = l;

  if (text.startsWith("/start")) {
    const p = text.split(/\s+/)[1] || "";               // deep link: t.me/<bot>?start=es or ?start=homes
    if (LANGS.includes(p)) u.lang = p;
    await putUser(env, from.id, u);
    if (["homes", "roi", "consult", "tour", "contact"].includes(p)) return onCallback(env, { id: "", from, data: p, message: m });
    return showMenu(env, chat, u.lang);
  }
  const cmd = { "/homes": "homes", "/roi": "roi", "/consult": "consult", "/tour": "tour", "/contact": "contact" }[text.split(/[\s@]/)[0]];
  if (cmd) return onCallback(env, { id: "", from, data: cmd, message: m });
  if (text.startsWith("/lang")) return send(env, chat, t("langQ", l), { inline_keyboard: [LANGS.map(x => ({ text: x.toUpperCase(), callback_data: "lang:" + x }))] });
  if (text.startsWith("/")) return showMenu(env, chat, l);

  // a contact or any other message: goes to Artem (and to the CRM the first time)
  const contact = m.contact ? "+" + String(m.contact.phone_number).replace(/^\+/, "") : u.await === "contact" ? text : "";
  const note = m.contact ? "" : text;
  if (!contact && !note) return;
  await saveLead(env, from, u, contact, note);
  u.await = "";
  await putUser(env, from.id, u);
  return send(env, chat, contact ? t("thanks", l) : t("got", l), { remove_keyboard: true });
}

const pickLang = c => (c === "es" || c === "ru" ? c : (c || "").startsWith("es") ? "es" : (c || "").startsWith("ru") || ["uk", "be", "kk"].includes(c) ? "ru" : "en");

/* ---------- setup: webhook, commands, name and description ---------- */
async function setup(env, origin) {
  const out = {};
  // Before the webhook exists, Telegram keeps the messages people sent the bot.
  // If exactly one person pressed Start (the owner), that chat becomes the admin chat.
  if (!(await adminId(env))) {
    await tg(env, "deleteWebhook", {});
    const ups = (await tg(env, "getUpdates", { limit: 100 })).result || [];
    const ids = [...new Set(ups.map(u => u.message).filter(m => m && m.chat.type === "private" && /^\/start/.test(m.text || "")).map(m => String(m.chat.id)))];
    if (ids.length === 1) {
      await env.STATE.put("admin", ids[0]);
      await send(env, ids[0], "✅ This chat now gets WhaleHome leads. Reply to a lead message to answer the client.");
    }
    out.admin = ids.length === 1 ? "set to chat " + ids[0] : `not set (${ids.length} chats pressed Start; send /admin <SETUP_KEY> from Artem's account)`;
  } else out.admin = "already set";
  out.webhook = await tg(env, "setWebhook", {
    url: origin + "/tg", secret_token: env.SETUP_KEY, allowed_updates: ["message", "callback_query"], drop_pending_updates: true,
  });
  const CMD = {
    en: [["start", "Menu"], ["homes", "Pick a home"], ["roi", "Calculate ROI"], ["consult", "Consultation · $1,000"], ["tour", "VIP tour · $10,000"], ["contact", "Leave my contact"], ["lang", "Language"]],
    es: [["start", "Menú"], ["homes", "Elegir propiedad"], ["roi", "Calcular ROI"], ["consult", "Consulta · $1,000"], ["tour", "Tour VIP · $10,000"], ["contact", "Dejar mi contacto"], ["lang", "Idioma"]],
    ru: [["start", "Меню"], ["homes", "Подобрать объект"], ["roi", "Рассчитать доход"], ["consult", "Консультация · $1,000"], ["tour", "VIP-тур · $10,000"], ["contact", "Оставить контакт"], ["lang", "Язык"]],
  };
  const DESC = {
    en: ["Homes in Panama for crypto people. Pay in USDT, USDC, BTC, ETH or SOL. Residency from $300k. I pick homes, calculate the return, book a consultation or a VIP tour. Press Start.", "Panama homes for crypto people · whalehome.io"],
    es: ["Propiedades en Panamá para la gente crypto. Paga en USDT, USDC, BTC, ETH o SOL. Residencia desde $300k. Elijo propiedades, calculo la rentabilidad, reservo consulta o tour VIP. Pulsa Iniciar.", "Propiedades en Panamá para gente crypto · whalehome.io"],
    ru: ["Недвижимость в Панаме для людей из крипты. Оплата в USDT, USDC, BTC, ETH или SOL. ВНЖ от $300k. Подберу объект, посчитаю доход, запишу на консультацию или VIP-тур. Нажмите Старт.", "Недвижимость в Панаме за крипту · whalehome.io"],
  };
  for (const l of LANGS) {
    const lc = l === "en" ? {} : { language_code: l };
    out["commands_" + l] = (await tg(env, "setMyCommands", { commands: CMD[l].map(([command, description]) => ({ command, description })), ...lc })).ok;
    out["desc_" + l] = (await tg(env, "setMyDescription", { description: DESC[l][0], ...lc })).ok;
    out["short_" + l] = (await tg(env, "setMyShortDescription", { short_description: DESC[l][1], ...lc })).ok;
  }
  out.name = (await tg(env, "setMyName", { name: "WhaleHome · Panama homes for crypto" })).ok;
  out.me = (await tg(env, "getMe", {})).result;
  return out;
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === "/setup") {
      if (!env.SETUP_KEY || url.searchParams.get("key") !== env.SETUP_KEY) return new Response("Forbidden", { status: 403 });
      return Response.json(await setup(env, url.origin));
    }
    if (url.pathname === "/tg" && req.method === "POST") {
      if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.SETUP_KEY) return new Response("Forbidden", { status: 403 });
      const upd = await req.json();
      ctx.waitUntil((async () => {
        try {
          if (upd.callback_query) await onCallback(env, upd.callback_query);
          else if (upd.message) await onMessage(env, upd.message);
        } catch (e) { console.log("update error", e && e.stack); }
      })());
      return new Response("ok");
    }
    if (url.pathname === "/lead" && req.method === "POST") return siteLead(req, env, ctx);
    if (url.pathname === "/") {                          // bot.whalehome.io -> t.me/<bot>, keeps ?start=
      let user = await env.STATE.get("me");
      if (!user) { user = ((await tg(env, "getMe", {})).result || {}).username; if (user) await env.STATE.put("me", user); }
      const start = (url.searchParams.get("start") || "").replace(/[^\w-]/g, "").slice(0, 60);
      if (user) return Response.redirect(`https://t.me/${user}${start ? "?start=" + start : ""}`, 302);
    }
    return Response.redirect(SITE, 302);
  },
};
