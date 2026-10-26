# WhaleHome Telegram bot

One Cloudflare Worker (`worker.js`, no dependencies). It answers in EN/ES/RU, picks homes from
`https://whalehome.io/homes.json`, calculates rental income, sells the $1,000 consultation and the
$10,000 VIP tour, writes leads to the WhaleHome CRM and sends them to Artem in Telegram.

The bot token is a secret. Never put it in this repository (it is public).

## Setup (Cloudflare dashboard, done by the browser assistant)

1. **CRM web app.** Open the WhaleHome CRM sheet → Extensions → Apps Script. Paste
   `crm/whalehome-leads-apps-script.gs`, save. Deploy → New deployment → Web app,
   Execute as: Me, Who has access: Anyone → Deploy → allow access → copy the `/exec` URL.
2. **KV.** Workers & Pages → KV → Create namespace `whalehome-bot`.
3. **Worker.** Workers & Pages → Create → Worker → name `whalehome-bot` → Deploy.
   Edit code → replace everything with `worker.js` → Deploy.
4. **Settings → Bindings:** KV namespace, variable name `STATE`, namespace `whalehome-bot`.
5. **Settings → Variables and secrets:**
   - `BOT_TOKEN`, type Secret: the token from @BotFather
   - `SETUP_KEY`, type Secret: a random string of 24+ letters and digits
   - `LEADS_URL`, type Text: the `/exec` URL from step 1
6. **Settings → Domains & Routes → Add → Custom domain:** `bot.whalehome.io`. The site already
   sends quiz leads to `https://bot.whalehome.io/lead`, and its Telegram button opens `https://bot.whalehome.io/`.
7. Open `https://bot.whalehome.io/setup?key=<SETUP_KEY>` once. Check the answer:
   `"webhook":{"ok":true,...}`, commands and descriptions `true`, and `"admin":"set to chat ..."`.
   The admin is set by itself from Artem's Start press. If it says "not set", Artem sends the bot `/admin <SETUP_KEY>`.
8. **Avatar:** web.telegram.org → @BotFather → /setuserpic → choose the bot → send `avatar.png`.
9. Test: `/start` → "Pick a home" → "Leave my contact" → share the phone. The lead must appear in
   Artem's Telegram chat with the bot and in the CRM "Leads" tab.

## How Artem works with it

- Each new lead comes as a message with name, @username, phone, interest, budget and language.
- To answer, reply to that message in Telegram: the bot sends your text to the client.
- Bot: https://t.me/whale_home_estate_bot
- Links for ads: `https://t.me/whale_home_estate_bot?start=en` / `?start=es` / `?start=ru` (language), `?start=homes`, `?start=tour`, `?start=consult` (opens that section).

## Updating

- Homes and photos come from the site: edit `HOMES` in `panama-crypto-homes/index.html`, run
  `python3 scripts/build_whalehome_lang.py` (it also builds `homes.json` and `img/bot/*.jpg`), deploy the site.
- Texts and buttons: edit `TX` in `worker.js`, paste it into the Worker again, Deploy.
