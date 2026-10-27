# Restate Deals + WhaleHome: как всё устроено и как перенести на другой аккаунт

Секретов (токен бота, ключи) здесь нет: репозиторий публичный. Они лежат в Google Doc
«Restate Deals & WhaleHome — handover» на Google Drive владельца.

## 1. Что есть

| Что | Адрес | Где живёт |
|---|---|---|
| Сайт для застройщиков | https://restate.deals (+ /en/ /es/ /ru/, /partners/, /legal/) | Cloudflare Pages, проект `restate-deals`, ветка `restate-site` |
| Сайт для покупателей WhaleHome | https://whalehome.io (+ /en/ /es/ /ru/, /properties/) | Cloudflare Pages, проект `cryptohome-demo`, ветка `demo-site` |
| Старый адрес демо | demo.restate.deals → редирект 301 на whalehome.io | Cloudflare, зона restate.deals → Rules → Redirect Rules |
| Telegram-бот | https://t.me/whale_home_estate_bot | Cloudflare Worker `whalehome-bot` + KV `whalehome-bot` |
| CRM застройщиков | Google Sheet «Restate Deals CRM» (av@icoda.io, доступ ceo@restate.deals) | Google Drive |
| CRM покупателей | Google Sheet «WhaleHome CRM» (av@icoda.io, доступ ceo@restate.deals) | Google Drive, Apps Script принимает лиды |
| Весь код | https://github.com/aiboss103/avatar | GitHub |

## 2. Скачать весь код одним архивом

- Исходники всего (оба сайта, бот, CRM, скрипты): https://github.com/aiboss103/avatar/archive/refs/heads/dental-clinics-site.zip
- Готовый сайт restate.deals (как на сервере): https://github.com/aiboss103/avatar/archive/refs/heads/restate-site.zip
- Готовый сайт whalehome.io (как на сервере): https://github.com/aiboss103/avatar/archive/refs/heads/demo-site.zip

## 3. Папки в исходниках (ветка `dental-clinics-site`)

| Папка | Что внутри |
|---|---|
| `real-estate-developers/` | restate.deals: `index.html` (весь сайт, тексты EN/ES/RU в `I18N`, цены в `CONFIG.pricing`), `partners/`, `legal/`, `img/`, `vendor/three.min.js`, `_headers`, `_redirects` |
| `panama-crypto-homes/` | whalehome.io: `index.html` (тексты в `S`, объекты в `HOMES`, настройки в `CONFIG`), `properties/` (каталог), `properties.json`, `homes.json`, `img/` |
| `telegram-bot/` | `worker.js` (весь бот), `README.md` (установка), `avatar.png`, `description.png` |
| `crm/` | Apps Script для CRM: `whalehome-leads-apps-script.gs`, `leads-apps-script.gs` (Restate, не подключён) |
| `scripts/` | сборка языковых страниц, `homes.json`, каталога из выгрузки CPanama |
| `.github/workflows/import-cpanama.yml` (ветка `cpanama-import-run`) | GitHub Action: качает объекты CPanama из Google Drive и собирает каталог |
| `CLAUDE.md` | правила проекта для Claude |

## 4. Настройки внутри сайтов (что менять при переезде)

**restate.deals** — `real-estate-developers/index.html`, объект `CONFIG`:
- `pricing` — планы и цены (только здесь), `capacity` — «берём 3 проекта, 2 занято»
- `calendly` — `https://calendly.com/voinov-agency/real-estate-deals-ceo`
- `whatsapp` — `50764566336`
- `leadsUrl` — пусто (форма открывает WhatsApp); можно вставить URL Apps Script из `crm/leads-apps-script.gs`
- Аналитика: Plausible, домен `restate.deals` (скрипт в `<head>`)

**whalehome.io** — `panama-crypto-homes/index.html`, объект `CONFIG`:
- `calendly` — `https://calendly.com/voinov-agency/real-estate-deals-ceo` (запасная: `.../whalehome-ceo-meeting`)
- `whatsapp` — `50764566336`, `telegram` — `https://t.me/whale_home_estate_bot`
- `leadsUrl` — `https://bot.whalehome.io/lead` (квиз → бот → CRM и Telegram Артёма)
- `rates` — курсы монет для пересчёта цен
- Каталог `/properties/`: те же ссылки в `panama-crypto-homes/properties/index.html` (`CONFIG`)

После правки `index.html` любого сайта запустить:
```
python3 scripts/build_restate_lang.py      # restate.deals → en/ es/ ru/
python3 scripts/build_whalehome_lang.py    # whalehome.io → en/ es/ ru/ + homes.json для бота
```

## 5. Как выкладываются изменения

Cloudflare Pages сам публикует сайт при пуше в ветку:
- содержимое `real-estate-developers/` → корень ветки `restate-site` → restate.deals
- содержимое `panama-crypto-homes/` → корень ветки `demo-site` → whalehome.io

Ветку `restate-site` никогда не перезаписывать через force-push.

## 6. Перенос на другой аккаунт, по шагам

1. **GitHub.** Новый аккаунт → Import repository (https://github.com/new/import) → `https://github.com/aiboss103/avatar`. Переносятся все ветки.
2. **Cloudflare Pages, restate.deals.** Workers & Pages → Create → Pages → Connect to Git → репозиторий → Production branch `restate-site`, Framework: None, Build command: пусто, Output directory: `/` → Deploy. Custom domains → `restate.deals`.
3. **Cloudflare Pages, whalehome.io.** То же, Production branch `demo-site`. Custom domains → `whalehome.io` и `www.whalehome.io`.
4. **Домены.** whalehome.io куплен в Hostinger, NS указывают на Cloudflare (`clyde.ns.cloudflare.com`, `rita.ns.cloudflare.com`). В новом аккаунте Cloudflare добавить зону и поменять NS в Hostinger на новые. Redirect Rules: `www.whalehome.io` → `https://whalehome.io` (301, путь и query сохраняются); `demo.restate.deals` → `https://whalehome.io` (301).
5. **CRM.** Открыть каждую таблицу → Файл → Создать копию. В копии WhaleHome CRM: Extensions → Apps Script → вставить `crm/whalehome-leads-apps-script.gs` → Deploy → Web app (Execute as: Me, Access: Anyone) → скопировать `/exec` URL.
6. **Бот.** По `telegram-bot/README.md`: KV `whalehome-bot`, Worker `whalehome-bot` с кодом `worker.js`, binding `STATE`, секреты `BOT_TOKEN` и `SETUP_KEY`, переменная `LEADS_URL` (URL из шага 5), домен `bot.whalehome.io`, затем открыть `https://bot.whalehome.io/setup?key=<SETUP_KEY>`. Аватар и картинка описания — через @BotFather.
7. **Calendly / WhatsApp / Plausible.** Если меняются, поправить `CONFIG` (раздел 4), пересобрать языковые страницы и выложить.

## 7. Каталог CPanama

Объекты лежат в Google Drive (папка «CPanama_all_50_listings»). Обновить каталог:
GitHub → Actions → «Import CPanama catalog» → Run workflow (ветка `cpanama-import-run`). Результат появляется в ветке `cpanama-import`
(`panama-crypto-homes/properties.json` + `img/props/`); его переносят в исходники и в `demo-site`.
Аренда и офисы отбрасываются, цены округляются до $10,000.

## 8. Контакты в текстах

- CEO: Artem Voinov · Telegram-канал @artofwar · личный @avicoda
- Почта: ceo@restate.deals
- WhatsApp: +507 6456 6336
