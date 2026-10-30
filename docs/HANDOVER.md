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

## 9. Текущие цены и условия (на 30.10.2026)

**restate.deals** (всё в `CONFIG.pricing` в `real-estate-developers/index.html`):

| План | Цена в месяц | Часы команды | Бюджет на рекламу и фрилансеров (платит клиент) | Цель продаж в месяц | За каждого квалифицированного покупателя | Гарантия |
|---|---|---|---|---|---|---|
| Starter | $3,000 (зачёркнуто $5,000) | 30 | около $5,000 | 1 | $250 | 5+ встреч с покупателями или +1 месяц бесплатно |
| Growth | $6,500 | 70 | около $10,000 | 2–3 | $200 | 10+ встреч или +1 месяц бесплатно |
| Enterprise | $12,000 | 140 | около $20,000 | 4+ | $150 | 25+ встреч или +1 месяц бесплатно |

- Оплаты за показы сейчас нет (убрана). Процента с прибыли нет.
- Блок «Берём только 3 проекта в месяц, 2 заняты» — `CONFIG.capacity`.
- Калькулятор: прибыль застройщика = 5% от цены каждой продажи (`CONFIG.roi.profit`), минус план, бюджет и оплата за квалифицированных покупателей. План ограничивает число продаж своей целью.
- Квалифицированный покупатель (значок ⓘ в карточках планов): 1) имя и рабочий контакт, отвечает в WhatsApp или по почте; 2) подтверждённый бюджет от $300k и понятно, откуда деньги; 3) готов купить в течение 6 месяцев; 4) всерьёз хочет жить в Панаме или переехать; 5) согласился на звонок или показ с отделом продаж девелопера и не был у девелопера в базе.

**whalehome.io**:
- Онлайн-консультация $1,000: гарантия 100% (не устроило — возврат всех $1,000 в течение 7 дней), включает финансовый расчёт и примерный ROI по каждому объекту, засчитывается в VIP-тур.
- VIP-тур $10,000, 3 дня: засчитывается в покупку, бесплатный при покупке от $1M (плашка «VIP Tour Included»).
- Прямая покупка от $300k. Плашка «Residency» у объектов от $300k. Цены объектов округлены до $10,000, в крипте считаются по `CONFIG.rates`.
- Обещания «0% комиссии для покупателя» на сайте нет (убрано).

## 10. Как выложить изменения (команды)

```
git clone https://github.com/aiboss103/avatar.git && cd avatar
git checkout dental-clinics-site
# правки в real-estate-developers/ или panama-crypto-homes/, затем:
python3 scripts/build_restate_lang.py
python3 scripts/build_whalehome_lang.py
git commit -am "..." && git push origin dental-clinics-site

# restate.deals
git worktree add ../site restate-site
cp -r real-estate-developers/* ../site/ && cd ../site && git add -A && git commit -m "..." && git push origin restate-site && cd -

# whalehome.io
git worktree add ../demo demo-site
cp -r panama-crypto-homes/* ../demo/ && cd ../demo && git add -A && git commit -m "..." && git push origin demo-site && cd -
```

Через 1–2 минуты Cloudflare Pages публикует сайт. Статус: GitHub → коммит → галочка «Cloudflare Pages».

## 11. Аккаунты: что где и чьё

| Сервис | Что там | Владелец / как найти |
|---|---|---|
| GitHub | репозиторий `aiboss103/avatar` (публичный) | аккаунт AIboss103 |
| Cloudflare | зоны restate.deals и whalehome.io, Pages `restate-deals` и `cryptohome-demo`, Worker и KV `whalehome-bot`, Redirect Rules | аккаунт, где сейчас эти зоны; почту проверить в Cloudflare → профиль |
| Hostinger | регистратор whalehome.io | аккаунт Артёма |
| Регистратор restate.deals | домен restate.deals | проверить в Cloudflare → Registrar или по WHOIS |
| Google (av@icoda.io) | Restate Deals CRM, WhaleHome CRM, Apps Script WhaleHome, этот документ | доступ к CRM есть у ceo@restate.deals, к документу у artvoinv@gmail.com |
| Google (artvoinv@gmail.com) | папка CPanama_all_50_listings | |
| Calendly | `voinov-agency/real-estate-deals-ceo` (оба сайта), запасная `whalehome-ceo-meeting` | аккаунт Артёма |
| Plausible | аналитика restate.deals | аккаунт, где добавлен сайт restate.deals |
| Telegram | бот @whale_home_estate_bot (создан в @BotFather), канал @artofwar, личный @avicoda | аккаунт Артёма |

## 12. Что не доделано (на 30.10.2026)

- **Квиз whalehome.io не доставляет лиды.** Сайт отправляет их на `https://bot.whalehome.io/lead`, а домен `bot.whalehome.io` к Worker не привязан. Решение: Cloudflare → Workers & Pages → whalehome-bot → Settings → Domains & Routes → Add → Custom domain `bot.whalehome.io`. Или заменить `CONFIG.leadsUrl` на адрес Worker `….workers.dev/lead`.
- **Код бота в Cloudflare может быть старее, чем `telegram-bot/worker.js` в репозитории.** Последние изменения (About с @artofwar и @avicoda, VIP Tour Included, гарантия и ROI в консультации, ссылка Calendly, картинка на первое сообщение) появятся после замены кода: Edit code → вставить `worker.js` → Deploy → открыть `…/setup?key=<SETUP_KEY>`.
- **Форма на restate.deals не пишет в CRM**: `CONFIG.leadsUrl` пустой, заявка уходит в WhatsApp. Чтобы писать в «Restate Deals CRM», развернуть `crm/leads-apps-script.gs` как Web app и вставить URL в `CONFIG.leadsUrl`.
- **На whalehome.io нет аналитики** (Plausible только на restate.deals).
