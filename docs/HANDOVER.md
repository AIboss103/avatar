# Restate Deals + WhaleHome: как всё устроено и как перенести на другой аккаунт

Секретов (токен бота, ключи) здесь нет: репозиторий публичный. Они лежат в Google Doc
«Restate Deals & WhaleHome — handover» на Google Drive владельца.

## 1. Что есть

| Что | Адрес | Где живёт |
|---|---|---|
| Сайт для застройщиков | https://restate.deals (+ /en/ /es/ /ru/, /price/, /partners/, /legal/, /privacy/, /es/privacidad/) | Cloudflare Pages, проект `restate-deals`, ветка `restate-site` |
| Сайт для покупателей WhaleHome | https://whalehome.io (+ /en/ /es/ /ru/, /properties/) | Cloudflare Pages, проект `cryptohome-demo`, ветка `demo-site` |
| Страница для собственников | https://restate.deals/owners/ (ES, переключатель EN/RU) | там же, `real-estate-developers/owners/index.html` |
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
| `real-estate-developers/` | restate.deals: `index.html` (весь сайт, тексты EN/ES/RU в `I18N`, цены в `CONFIG.pricing`), `owners/index.html` (страница для собственников, свои цены в `CONFIG.plans`), `partners/`, `legal/`, `privacy/`, `es/privacidad/`, `rd-track.js`, `img/`, `vendor/three.min.js`, `_headers`, `_redirects` |
| `panama-crypto-homes/` | whalehome.io: `index.html` (тексты в `S`, объекты в `HOMES`, настройки в `CONFIG`), `properties/` (каталог), `properties.json`, `homes.json`, `img/` |
| `telegram-bot/` | `worker.js` (весь бот), `README.md` (установка), `avatar.png`, `description.png` |
| `crm/` | Apps Script: `whalehome-leads-apps-script.gs`, `leads-apps-script.gs` (Restate Deals CRM), `meta-ads-stats-apps-script.gs` (статистика Meta Ads в таблицу раз в 3 дня, пока не установлен) |
| `scripts/` | сборка языковых страниц, `homes.json`, каталога из выгрузки CPanama |
| `.github/workflows/import-cpanama.yml` (ветка `cpanama-import-run`) | GitHub Action: качает объекты CPanama из Google Drive и собирает каталог |
| `CLAUDE.md` | правила проекта для Claude |

## 4. Настройки внутри сайтов (что менять при переезде)

**restate.deals** — `real-estate-developers/index.html`, объект `CONFIG`:
- `pricing` — планы и цены (только здесь), `capacity` — «берём 3 проекта, 2 занято»
- `calendly` — `https://calendly.com/voinov-agency/real-estate-deals-ceo`
- `whatsapp` — `50764566336`
- `leadsUrl` — `https://whalehome.io/api/lead`: бот пишет заявку в «Restate Deals CRM» (переменная Worker `RESTATE_LEADS_URL`) и шлёт её Артёму в Telegram; форма ещё и открывает WhatsApp
- Аналитика: Plausible, GA4 `G-K8FTGB7RF5`, Meta Pixel `1704556277678666` (подробно в разделе 13a)

**restate.deals/owners** — `real-estate-developers/owners/index.html`, объект `CONFIG`:
- `plans` — три спринта (работа, реклама, гарантия, цена покупателя сверх гарантии, продление), только здесь
- `brokerRate` 5% и `itbms` 7% — для сравнения с брокером; `closeDiscount` 6% — средняя скидка при сделке (ACOBIR MLS)
- `whatsapp`, `googleAds` (`id` и `label` конверсии Google Ads; пусто = выключено)
- Страница одна на три языка, сборщик не нужен: после правки выложить `owners/index.html` и `img/og-owners.jpg`

**whalehome.io** — `panama-crypto-homes/index.html`, объект `CONFIG`:
- `calendly` — `https://calendly.com/voinov-agency/real-estate-deals-ceo` (запасная: `.../whalehome-ceo-meeting`)
- `whatsapp` — `50764566336`, `telegram` — `https://t.me/whale_home_estate_bot`
- `leadsUrl` — `https://whalehome.io/api/lead` (квиз → бот → «WhaleHome CRM» и Telegram Артёма)
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
5. **CRM.** Открыть каждую таблицу → Файл → Создать копию. В копии WhaleHome CRM: Extensions → Apps Script → вставить `crm/whalehome-leads-apps-script.gs` → Deploy → Web app (Execute as: Me, Access: Anyone) → скопировать `/exec` URL. То же в копии Restate Deals CRM со скриптом `crm/leads-apps-script.gs`.
6. **Бот.** По `telegram-bot/README.md`: KV `whalehome-bot`, Worker `whalehome-bot` с кодом `worker.js`, binding `STATE`, секреты `BOT_TOKEN` и `SETUP_KEY`, переменные `LEADS_URL` и `RESTATE_LEADS_URL` (URL Apps Script обеих CRM из шага 5), Route `whalehome.io/api/*` на Worker, затем открыть `https://whalehome.io/api/setup?key=<SETUP_KEY>`. Аватар и картинка описания — через @BotFather.
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

## 9. Текущие цены и условия (на 04.11.2026)

**restate.deals** (всё в `CONFIG.pricing` в `real-estate-developers/index.html`):

| План | Цена в месяц | Часы команды | Бюджет на рекламу и фрилансеров (платит клиент) | Цель продаж в месяц | За каждого квалифицированного покупателя | Гарантия |
|---|---|---|---|---|---|---|
| Starter | $3,000 (зачёркнуто $5,000) | 30 | около $5,000 | 1 | $250 | 10+ квалифицированных покупателей за 60 дней или +1 месяц бесплатно |
| Growth | $6,500 | 70 | около $10,000 | 2–3 | $200 | 20+ квалифицированных покупателей за 60 дней или +1 месяц бесплатно |
| Enterprise | $12,000 | 140 | около $20,000 | 4+ | $150 | 30+ квалифицированных покупателей за 60 дней или +1 месяц бесплатно |

- Оплаты за показы нет. Процента с прибыли или с продажи нет. На страницах restate.deals (кроме /owners, где идёт сравнение с брокером) не пишем «комиссия» и проценты.
- Блок «Берём только 3 проекта в месяц, 2 заняты» — `CONFIG.capacity`.
- Калькулятора прибыли на главной больше нет (убран по просьбе владельца вместе со всеми «5%»).
- Квалифицированный покупатель (значок ⓘ в карточках планов): 1) имя и рабочий контакт, отвечает в WhatsApp или по почте; 2) подтверждённый бюджет от $500k и понятно, откуда деньги; 3) готов купить в течение 6 месяцев; 4) всерьёз хочет жить в Панаме или переехать; 5) согласился на звонок или показ с отделом продаж девелопера и не был у девелопера в базе.

**restate.deals/owners** (собственники; спринт 45 дней, работа оплачивается вперёд, реклама напрямую в Meta и Google, без комиссии и без эксклюзива):

| План | Объекты | Работа | Реклама | Гарантия | Сверх гарантии | Бонус | Продление |
|---|---|---|---|---|---|---|---|
| Small | до $250,000 | $900 | $900 | 10 квалифицированных | $40 за каждого, лимит задаёт владелец | остальные заявки (ожидаемо 60–80) бесплатно | $750 |
| Mid | $250,000–$600,000 | $1,500 | $1,800 | 12 квалифицированных | $70 | 80–100 бесплатно | $1,250 |
| Premium | от $600,000 | $2,500 | $3,000 | 8 квалифицированных с подтверждёнными средствами | $150 | 70–90 бесплатно | $2,100 |

- Premium: реклама на Панаму, США, Канаду и Европу на двух языках.
- Квалифицированный покупатель (подсказка ⓘ на странице): оставил имя и рабочий WhatsApp; ответил на контакт; подтвердил интерес к объекту; бюджет и сроки подходят под цену. Каждый — в отчёте с именем и номером.
- Гарантия: если привели меньше — на выбор бесплатное продление спринта до нужного числа или возврат оплаты за работу пропорционально недобору (обещали 12, привели 8 — возврат трети). Рекламный бюджет не возвращается, отчёт из кабинета владелец получает. Условия: цена не выше рынка больше чем на 10%, ответ покупателям в течение 24 часов, доступ к показам. Продан раньше конца спринта — это результат, возврата нет.
- Сравнение с брокером на странице: 5% + 7% ITBMS (дом за $400,000: $21,400 против $3,300 в Mid). Статистика: 224 дня на продажу и −6% к цене объявления (ACOBIR MLS, первое полугодие 2026).
- Сообщение в WhatsApp: «Hola Artem, quiero vender mi propiedad y estoy listo para pagar por tus servicios. ¿Cómo empezamos?» (+ план, если нажата кнопка плана; EN и RU переведены).

**whalehome.io**:
- Онлайн-консультация $1,000: гарантия 100% (не устроило — возврат всех $1,000 в течение 7 дней), включает финансовый расчёт и примерный ROI по каждому объекту, засчитывается в VIP-тур.
- VIP-тур $10,000, 3 дня: засчитывается в покупку, бесплатный при покупке от $1M (плашка «VIP Tour Included»).
- Прямая покупка от $500k (новый порог визы инвестора). Плашка «Residency» у объектов от $500k; в каталоге остаются и объекты дешевле, без плашки. Цены объектов округлены до $10,000, в крипте считаются по `CONFIG.rates`.
- Обещания «0% комиссии для покупателя» на сайте нет (убрано).

## 9a. A/B-тест restate.deals

- **B, без цен** — главная restate.deals (и /en/ /es/ /ru/): первый экран «Помогаем продать недвижимость в Панаме за 60 дней», блоки «Для кого», «Наши покупатели» и «Панама — крипто-столица Америки», «Живая воронка» (whalehome.io), одна форма «10 клиентов за 60 дней / узнать цену» (ответ в WhatsApp). Калькулятора нет.
- **A, с ценами** — restate.deals/price/ (и /en/price/ …): планы, оплата за квалифицированного покупателя, форма с Calendly. Калькулятора нет. Закрыта от поисковиков (noindex), ссылку дают только в рекламе.
- Один исходный файл `real-estate-developers/index.html`, версию включает `<html data-variant="a|b">`; элементы только для A помечены `class="va"`, только для B — `class="vb"`.
- Каждая заявка приходит с пометкой «variant A/B» в заметках, события Plausible несут свойство `variant`, ссылки Calendly — `utm_term=variant-a|b`.

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
cp -r real-estate-developers/* ../site/   # включая price/ && cd ../site && git add -A && git commit -m "..." && git push origin restate-site && cd -

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
| Google (av@icoda.io) | Restate Deals CRM, WhaleHome CRM, Apps Script WhaleHome, этот документ | доступ к CRM есть у ceo@restate.deals, к документу у artvoinv@gmail.com, artvoinv1@gmail.com, artemvoinovspb@gmail.com |
| Google (artvoinv@gmail.com) | папка CPanama_all_50_listings | |
| Calendly | `voinov-agency/real-estate-deals-ceo` (оба сайта), запасная `whalehome-ceo-meeting` | аккаунт Артёма |
| Plausible | аналитика restate.deals | аккаунт, где добавлен сайт restate.deals |
| Telegram | бот @whale_home_estate_bot (создан в @BotFather), канал @artofwar, личный @avicoda | аккаунт Артёма |

## 12. Приём заявок и что осталось включить (на 30.10.2026)

Код готов и выложен: квиз whalehome.io и форма restate.deals отправляют заявки на `https://whalehome.io/api/lead`. Это Telegram-бот (Worker `whalehome-bot`): он пишет заявку в нужную CRM и присылает её Артёму в Telegram (🐋 покупатель, 🏢 застройщик).

Чтобы заявки начали приходить, в панелях нужно один раз сделать (секреты не нужны):
1. Cloudflare → Workers & Pages → whalehome-bot → Edit code → заменить код на `telegram-bot/worker.js` → Deploy. Это же обновит бота до последней версии.
2. Там же Settings → Domains & Routes → Add → Route: зона `whalehome.io`, маршрут `whalehome.io/api/*`.
3. Таблица «Restate Deals CRM» → Extensions → Apps Script → вставить `crm/leads-apps-script.gs` → Deploy → Web app (Execute as: Me, Access: Anyone) → скопировать `/exec` URL → Worker → Settings → Variables and secrets → Add, тип Text, имя `RESTATE_LEADS_URL`, значение URL → Deploy.
4. Открыть `https://whalehome.io/api/setup?key=<SETUP_KEY>` и проверить `"webhook":{"ok":true`.
5. Проверить: отправить квиз на whalehome.io и форму на restate.deals; в Telegram приходят 🐋 и 🏢, в таблицах появляются строки.

Ещё не сделано: на whalehome.io нет аналитики (Plausible только на restate.deals).

## 13a. Аналитика и реклама: GA4, Meta Pixel, Conversions API, UTM (restate.deals)

Всё невидимое, внешний вид сайта не меняется.
- **Счётчики на всех страницах.** GA4 `G-K8FTGB7RF5` и Meta Pixel `1704556277678666` стоят прямо в `<head>`: исходник `index.html` (из него собираются /en/ /es/ /ru/ /price/), `/partners/`, `/partners/onepager.html`, `/legal/`. Plausible и Cloudflare Web Analytics остались как были.
- **`track()` в `index.html`.** Один вызов отправляет событие в Plausible, GA4 и Meta (таблица `EV`):

  | Событие на сайте | GA4 | Meta |
  |---|---|---|
  | Click WhatsApp | whatsapp_click | Contact |
  | Click Book | book_call_click | ScheduleClick (своё событие) |
  | Call Booked | book_call | Schedule |
  | Lead | generate_lead | Lead |
  | Calculator Use | calculator_use | CalculatorUse (своё событие) |
  | CTA | cta_click | — |

- **Запись на звонок.** Calendly после записи перенаправляет на `https://restate.deals/?booked=1`. Сайт засчитывает Call Booked и убирает параметр из адреса. Запись во встроенном виджете тоже засчитывается, без двойного счёта.
- **Lead и Conversions API.** У Lead уникальный `event_id`. Тот же id уходит в Worker, чтобы Meta склеила событие из браузера и с сервера. ViewContent отправляется, когда на экране блок цен (A) или формы (B).
- **`real-estate-developers/rd-track.js`** (на сайте `/rd-track.js`):
  - первый и последний источник визита (utm_*, fbclid, страница входа);
  - запасная cookie `_fbc`;
  - клики по WhatsApp, Telegram и Calendly там, где их не считает `track()` (например, /partners/).
- **Поля заявки, которые уходят в Worker:** event_id, fbp, fbc, utm_* (последний источник), ft_utm_* (первый), landing_page, page_url, referrer, user_agent.
- **Worker (`telegram-bot/worker.js`):**
  - пишет в Telegram и в CRM «Source: facebook / cpc / кампания / объявление»;
  - отправляет Lead в Meta Conversions API (телефон, email, имя и страна в виде SHA-256, плюс IP и браузер) с тем же event_id.
  - Переменные: `META_PIXEL_ID=1704556277678666` (Text), `META_CAPI_TOKEN` (Secret), `META_TEST_EVENT_CODE` (только на время проверки), `META_GRAPH_VERSION` (по умолчанию v25.0). См. `telegram-bot/README.md`.
- **Ещё сделать в панелях:**
  1. Calendly → событие real-estate-deals-ceo → Booking page → Confirmation page → Redirect на `https://restate.deals/?booked=1`;
  2. GA4: отметить ключевыми событиями whatsapp_click, book_call, generate_lead;
  3. Meta: код подтверждения домена уже стоит на сайте (`xbhgtd4uaqn0vniq3z5ot189g5r1u1`), осталось нажать Verify в Business Manager и проверить Test Events;
  4. Worker: обновить код и добавить переменные META_*;
  5. Google Ads: прислать ID и метку конверсии — вписать в `CONFIG.googleAds` на /owners (клик по WhatsApp станет конверсией).
- **/owners:** PageView, ViewContent при первом использовании калькулятора, Lead (с eventID) и GA4 `generate_lead` на каждый клик по WhatsApp, Plausible `Calculator Use` и `Lead`.
- **Статистика Meta Ads в таблицу** (`crm/meta-ads-stats-apps-script.gs`): Google Sheet + Apps Script, раз в 3 дня тянет расходы, показы, клики и лиды по каждому объявлению. Нужен токен Meta с правом ads_read и ID рекламного кабинета; установка описана в начале файла. Пока не установлен.

## 14. Превью-ветки (что можно удалить)

Ветки `restate-privacy-src`, `restate-privacy-preview`, `restate-buyers-src`, `restate-buyers-preview`, `restate-owners-src`, `restate-owners-preview` — превью для согласования. Всё из них уже на сайте; ветки можно удалить в GitHub. Новые видимые изменения restate.deals сначала выкладываются в такую ветку (адрес вида `https://<ветка>.restate-deals.pages.dev`), после «ОК» владельца — в `restate-site`.

## 15. Сайт для стоматологий (SmileScale)

- Адрес: https://dental-clinics-site.restate-deals.pages.dev/dental-clinics/ (B, без цен) и …/dental-clinics/price/ (A, с ценами, noindex). Это превью-ссылка Cloudflare Pages на ветку `dental-clinics-site`; обновляется при каждом пуше в неё. Свой домен — подключить Custom domain к ветке или вынести в отдельный проект Pages.
- Исходник один: `dental-clinics/index.html` (B). После правки: `python3 scripts/build_dental_ab.py` (собирает `dental-clinics/price/index.html`).
- B: «10 пациентов за 60 дней» с гарантией, форма «Цена за пациента» (ответ в WhatsApp), простой калькулятор. A: пакеты с ценами, калькулятор с планом и ROI.
- Заявки уходят в WhatsApp (+507 6456 6336) и в Telegram Артёму через бота (`site=smilescale`, 🦷), отдельной CRM пока нет.
- Calendly временно `voinov-agency/real-estate-deals-ceo` — заменить в `CONFIG.booking` на свою ссылку.
