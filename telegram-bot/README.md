# WhaleHome Telegram bot

One Cloudflare Worker (`worker.js`, no dependencies). It answers in EN/ES/RU, picks homes from
`https://whalehome.io/homes.json`, calculates rental income, sells the $1,000 consultation and the
$10,000 VIP tour, writes leads to the WhaleHome CRM and sends them to Artem in Telegram.

The bot token is a secret. Never put it in this repository (it is public).

## Setup (Cloudflare dashboard, about 10 minutes)

1. **CRM web app.** Open the WhaleHome CRM sheet → Extensions → Apps Script. Paste
   `crm/whalehome-leads-apps-script.gs`, save. Deploy → New deployment → Web app,
   Execute as: Me, Who has access: Anyone → Deploy → allow access → copy the `/exec` URL.
2. **KV.** Workers & Pages → KV → Create namespace `whalehome-bot`.
3. **Worker.** Workers & Pages → Create → Worker → name `whalehome-bot` → Deploy.
   Edit code → replace everything with `worker.js` → Deploy.
4. **Settings → Bindings:** add KV namespace, variable name `STATE`, namespace `whalehome-bot`.
5. **Settings → Variables and secrets:**
   - `BOT_TOKEN`, type Secret: the token from @BotFather
   - `SETUP_KEY`, type Secret: a random string of 24+ letters and digits (keep it, it is needed in steps 6 and 7)
   - `LEADS_URL`, type Text: the `/exec` URL from step 1
6. Open `https://whalehome-bot.<your-subdomain>.workers.dev/setup?key=<SETUP_KEY>`.
   The answer must show `"webhook":{"ok":true,...}` and `true` for commands and descriptions.
7. From Artem's Telegram account send the bot: `/admin <SETUP_KEY>`. The bot answers
   "This chat now gets WhaleHome leads".
8. **Avatar:** @BotFather → /setuserpic → choose the bot → send `avatar.png`.
9. Test: send `/start`, go through "Pick a home", "Leave my contact", share a phone.
   A lead must appear in Telegram (Artem's chat) and in the CRM "Leads" tab.
10. After everything works, @BotFather → /revoke → get a new token and update `BOT_TOKEN`
    (the first token was shared in a chat), then open the `/setup` link again.

## How Artem works with it

- Each new lead comes as a message with name, @username, phone, interest, budget and language.
- To answer, reply to that message in Telegram: the bot sends your text to the client.
- Deep links for ads: `t.me/<bot>?start=es` (Spanish), `?start=homes`, `?start=tour`, `?start=consult`.

## Updating

- Homes and photos come from the site: edit `HOMES` in `panama-crypto-homes/index.html`, run
  `python3 scripts/build_whalehome_lang.py` (it also builds `homes.json` and `img/bot/*.jpg`), deploy the site.
- Texts and buttons: edit `TX` in `worker.js`, paste it into the Worker again, Deploy.
