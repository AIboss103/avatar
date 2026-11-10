#!/usr/bin/env python3
"""Owners checklist (restate.deals/owners): the 15 steps, in ES / EN / RU.

One text source feeds both the section on the page and the three PDFs.

    python3 scripts/owners_checklist.py        # injects into owners/index.html and writes owners/checklist-{es,en,ru}.pdf
    python3 scripts/build_owners_lang.py       # then rebuild owners/en and owners/ru

The Spanish page (owners/index.html) is the source; the section sits between the markers
<!-- CHECKLIST START --> and <!-- CHECKLIST END -->, its CSS between /* ck:start */ and /* ck:end */, its script
between /* ck-js:start */ and /* ck-js:end */. Dictionary keys are "ck.*".
"""
import html, json, pathlib, re, subprocess, sys, tempfile, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent / "real-estate-developers"
PAGE = ROOT / "owners" / "index.html"
CHROME = pathlib.Path.home() / "Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell"
WHATSAPP_TXT = "+507 6718 5938"
LEADS_URL = "https://whalehome.io/api/lead"

# item 14 is the "work with Restate Deals" step; its reasons are listed under it
DATA = {
"es": {
  "wamsg": "Hola Artem, descargué el checklist y quiero vender mi propiedad. ¿Me ayudas?",
  "k": "Checklist gratis",
  "t": "15 pasos para vender tu propiedad en 60–90 días",
  "l": "Una lista práctica para preparar, publicar y cerrar. Déjanos tu WhatsApp y la recibes al instante, en pantalla y en PDF.",
  "name": "Tu nombre (opcional)", "wa": "Tu WhatsApp", "btn": "Recibir el checklist",
  "consent": "Al enviar aceptas que te escribamos por WhatsApp y nuestra", "privacy": "Política de Privacidad",
  "err": "Escribe un número de WhatsApp válido, con el código del país.",
  "ok": "Listo. Aquí está tu checklist.", "pdf": "Descargar PDF", "okn": "¿Dudas? Escríbenos por WhatsApp.", "okb": "Escribir por WhatsApp",
  "pdf_title": "Checklist: 15 pasos para vender tu propiedad en 60–90 días", "pdf_foot": "Restate Deals · restate.deals/owners",
  "whyh": "Por qué con nosotros:",
  "items": [
    ("Fija un precio realista", "Compara con ventas recientes de propiedades parecidas en tu zona, no con precios publicados. Un precio más de 10% por encima del mercado frena las visitas."),
    ("Reúne los documentos antes de publicar", "Título en el Registro Público, paz y salvo del impuesto de inmueble y del agua, cuotas de mantenimiento al día si es PH, planos. Con todo listo, cierras más rápido cuando llega la oferta."),
    ("Define tu precio mínimo y qué incluye la venta", "Muebles, electrodomésticos, fecha de entrega. Decídelo antes, para no negociar desde cero con cada comprador."),
    ("Limpia, despeja y repara lo pequeño", "Quita objetos personales, arregla grifos y lámparas, retoca la pintura. Un lugar ordenado se ve más grande en las fotos."),
    ("Haz fotos profesionales con luz natural", "Entre 20 y 30 fotos horizontales, de día y con las cortinas abiertas. La primera foto decide si abren el anuncio."),
    ("Graba un video corto", "Un recorrido de 60 segundos con el celular, en vertical, para Instagram y Facebook."),
    ("Escribe una descripción clara", "Ubicación, metros cuadrados, habitaciones, año, cuota de mantenimiento y qué hay cerca. Sin adjetivos vacíos como “increíble”."),
    ("Piensa en quién compra", "Playa, vista, seguridad, internet, potencial de alquiler. Si el comprador es extranjero, explica el proceso: pago, abogado y documentos."),
    ("Publica donde están los compradores", "Meta Ads (Facebook e Instagram) para llegar a quien aún no busca, y Google Search para quien ya busca “casa en venta” en tu zona."),
    ("Usa una página propia con un solo botón", "Una landing page con fotos, precio y un botón de WhatsApp bien visible. Menos pasos, más mensajes."),
    ("Responde en menos de 24 horas, mejor en una", "El comprador escribe a varias propiedades. Gana quien responde primero."),
    ("Filtra antes de mostrar", "Pregunta presupuesto, plazo y forma de pago. Así solo muestras la propiedad a quien puede comprar."),
    ("Agrupa las visitas", "Dos o tres por día, con la propiedad lista, ventilada y con luz. Ahorras tiempo y se nota el interés."),
    ("Trabaja con Restate Deals en vez de agencias", "Una agencia cobra por la venta y trabaja con muchas propiedades a la vez. Aquí trabajamos tu propiedad por sprints, con precio fijo y resultados que puedes ver:"),
    ("Revisa cada dos semanas y ajusta", "Mira cuántos mensajes y visitas llegan. Si en 30 días no hay visitas, cambia las fotos, el texto o el precio. No esperes meses."),
  ],
  "why": [
    "Sin comisión: con corredor pagas 5% + 7% de ITBMS sobre la comisión. Aquí pagas el trabajo por sprint de 45 días y la publicidad directo a Meta y Google.",
    "Ves a cada comprador: recibes el nombre y el número de cada uno en el reporte, no solo “hubo interés”.",
    "Garantía: si traemos menos compradores calificados que los garantizados, extendemos el sprint gratis o te devolvemos el trabajo en proporción.",
    "Sin exclusividad: puedes seguir con tu corredor.",
    "Más rápido: un sprint son 45 días. Con corredor, el promedio es de 224 días (ACOBIR MLS, primer semestre de 2026).",
  ],
},
"en": {
  "wamsg": "Hi Artem, I downloaded the checklist and I want to sell my property. Can you help?",
  "k": "Free checklist",
  "t": "15 steps to sell your property in 60–90 days",
  "l": "A practical list to prepare, list and close. Leave your WhatsApp and you get it right away, on screen and as a PDF.",
  "name": "Your name (optional)", "wa": "Your WhatsApp", "btn": "Get the checklist",
  "consent": "By submitting you agree that we message you on WhatsApp and to our", "privacy": "Privacy Policy",
  "err": "Enter a valid WhatsApp number with the country code.",
  "ok": "Done. Here is your checklist.", "pdf": "Download PDF", "okn": "Questions? Message us on WhatsApp.", "okb": "Message on WhatsApp",
  "pdf_title": "Checklist: 15 steps to sell your property in 60–90 days", "pdf_foot": "Restate Deals · restate.deals/owners",
  "whyh": "Why with us:",
  "items": [
    ("Set a realistic price", "Compare with recent sales of similar properties in your area, not with listing prices. A price more than 10% above the market slows down viewings."),
    ("Gather the documents before you list", "Title at the Public Registry, property tax and water clearance, up-to-date maintenance fees if it is a condo (PH), floor plans. With everything ready, you close faster when an offer comes."),
    ("Decide your minimum price and what the sale includes", "Furniture, appliances, handover date. Decide it first, so you do not negotiate from zero with every buyer."),
    ("Clean, declutter and fix the small things", "Remove personal items, fix taps and lamps, touch up the paint. A tidy place looks bigger in photos."),
    ("Take professional photos in natural light", "20 to 30 horizontal photos, in the daytime with the curtains open. The first photo decides whether people open the listing."),
    ("Record a short video", "A 60-second walk-through on your phone, vertical, for Instagram and Facebook."),
    ("Write a clear description", "Location, square meters, bedrooms, year, maintenance fee and what is nearby. No empty adjectives like “amazing”."),
    ("Think about who buys", "Beach, view, security, internet, rental potential. If the buyer is a foreigner, explain the process: payment, lawyer and documents."),
    ("List where the buyers are", "Meta Ads (Facebook and Instagram) to reach people who are not searching yet, and Google Search for people who already search “house for sale” in your area."),
    ("Use your own page with one button", "A landing page with photos, the price and a clear WhatsApp button. Fewer steps, more messages."),
    ("Reply in under 24 hours, ideally in one", "Buyers write to several properties. The one who replies first wins."),
    ("Filter before you show", "Ask about budget, timeline and how they will pay. That way you only show the property to people who can buy."),
    ("Group the viewings", "Two or three a day, with the property ready, aired and bright. You save time and the interest shows."),
    ("Work with Restate Deals instead of agencies", "An agency is paid from the sale and works many properties at once. Here we work your property in sprints, at a fixed price, with results you can see:"),
    ("Review every two weeks and adjust", "Check how many messages and viewings come in. If there are no viewings in 30 days, change the photos, the text or the price. Do not wait for months."),
  ],
  "why": [
    "No commission: with a broker you pay 5% + 7% ITBMS on the commission. Here you pay for the work per 45-day sprint and for the ads directly to Meta and Google.",
    "You see every buyer: you get each buyer's name and number in the report, not just “there was interest”.",
    "Guarantee: if we bring fewer qualified buyers than guaranteed, we extend the sprint for free or refund the work fee in proportion.",
    "No exclusivity: you can keep your broker.",
    "Faster: a sprint is 45 days. With a broker the average is 224 days (ACOBIR MLS, first half of 2026).",
  ],
},
"ru": {
  "wamsg": "Здравствуйте! Я скачал чек-лист и хочу продать свою недвижимость. Поможете?",
  "k": "Бесплатный чек-лист",
  "t": "15 шагов, чтобы продать недвижимость за 60–90 дней",
  "l": "Практический список: подготовить, опубликовать и закрыть сделку. Оставьте WhatsApp, и он сразу откроется на экране и скачается в PDF.",
  "name": "Ваше имя (необязательно)", "wa": "Ваш WhatsApp", "btn": "Получить чек-лист",
  "consent": "Отправляя форму, вы разрешаете написать вам в WhatsApp и соглашаетесь с", "privacy": "Политикой конфиденциальности",
  "err": "Введите номер WhatsApp с кодом страны.",
  "ok": "Готово. Вот ваш чек-лист.", "pdf": "Скачать PDF", "okn": "Остались вопросы? Напишите нам в WhatsApp.", "okb": "Написать в WhatsApp",
  "pdf_title": "Чек-лист: 15 шагов, чтобы продать недвижимость за 60–90 дней", "pdf_foot": "Restate Deals · restate.deals/owners",
  "whyh": "Почему с нами:",
  "items": [
    ("Поставьте реальную цену", "Сравнивайте с недавними продажами похожих объектов рядом, а не с ценами в объявлениях. Цена выше рынка больше чем на 10% тормозит показы."),
    ("Соберите документы до публикации", "Право собственности в Публичном реестре, справки об уплате налога на недвижимость и за воду, взносы за обслуживание без долгов, если это кондо (PH), планировки. Когда всё готово, вы быстрее закрываете сделку после первого предложения."),
    ("Решите минимальную цену и что входит в продажу", "Мебель, техника, дата передачи. Решите это заранее, чтобы не торговаться с нуля с каждым покупателем."),
    ("Уберите лишнее и починьте мелочи", "Уберите личные вещи, почините краны и светильники, подкрасьте стены. Чистое пространство выглядит больше на фото."),
    ("Сделайте профессиональные фото при дневном свете", "От 20 до 30 горизонтальных фото днём, со шторами открытыми. Первое фото решает, откроют ли объявление."),
    ("Снимите короткое видео", "Прогулка по объекту на 60 секунд на телефон, вертикально, для Instagram и Facebook."),
    ("Напишите понятное описание", "Район, площадь, комнаты, год постройки, взнос за обслуживание и что рядом. Без пустых слов вроде «потрясающий»."),
    ("Подумайте, кто покупает", "Пляж, вид, безопасность, интернет, потенциал аренды. Если покупатель иностранец, объясните процесс: оплата, юрист и документы."),
    ("Публикуйтесь там, где покупатели", "Meta Ads (Facebook и Instagram), чтобы дойти до тех, кто ещё не ищет, и Google Search для тех, кто уже ищет «дом на продажу» в вашем районе."),
    ("Сделайте свою страницу с одной кнопкой", "Лендинг с фото, ценой и заметной кнопкой WhatsApp. Меньше шагов, больше сообщений."),
    ("Отвечайте быстрее 24 часов, лучше за час", "Покупатель пишет сразу нескольким объектам. Выигрывает тот, кто ответил первым."),
    ("Отсейте до показа", "Спросите бюджет, сроки и способ оплаты. Так вы показываете объект только тем, кто может купить."),
    ("Собирайте показы в блоки", "Два-три в день, объект подготовлен, проветрен и светлый. Экономите время, и интерес заметнее."),
    ("Работайте с Restate Deals, а не с агентствами", "Агентство получает деньги с продажи и ведёт много объектов сразу. Мы ведём ваш объект спринтами, по фиксированной цене и с результатом, который видно:"),
    ("Проверяйте раз в две недели и корректируйте", "Смотрите, сколько приходит сообщений и показов. Если за 30 дней показов нет, меняйте фото, текст или цену. Не ждите месяцами."),
  ],
  "why": [
    "Без комиссии: с брокером вы платите 5% + 7% ITBMS на комиссию. Здесь вы платите за работу за спринт 45 дней, а рекламу оплачиваете напрямую Meta и Google.",
    "Вы видите каждого покупателя: в отчёте имя и номер каждого, а не просто «был интерес».",
    "Гарантия: если приведём меньше квалифицированных покупателей, чем гарантировали, бесплатно продлим спринт или вернём оплату за работу пропорционально.",
    "Без эксклюзива: можно продолжать работать со своим брокером.",
    "Быстрее: спринт длится 45 дней. С брокером в среднем 224 дня (ACOBIR MLS, первое полугодие 2026).",
  ],
},
}
LANGS = ["es", "en", "ru"]
US = 13  # index of the "work with us" step


def jdump(v):
    return json.dumps(v, ensure_ascii=False)


def dict_keys(lang):
    d = DATA[lang]
    out = {"ck.k": d["k"], "ck.t": d["t"], "ck.l": d["l"], "ck.name": d["name"], "ck.wa": d["wa"], "ck.btn": d["btn"],
           "ck.consent": d["consent"], "ck.privacy": d["privacy"], "ck.err": d["err"], "ck.ok": d["ok"], "ck.pdf": d["pdf"],
           "ck.okn": d["okn"], "ck.okb": d["okb"], "ck.whyh": d["whyh"], "ck.wa": d["wamsg"]}
    for i, (t, x) in enumerate(d["items"], 1):
        out[f"ck.i{i}t"] = t
        out[f"ck.i{i}d"] = x
    for i, w in enumerate(d["why"], 1):
        out[f"ck.w{i}"] = w
    return out


def section_html():
    es = DATA["es"]
    prev = "".join(f'<li data-i="ck.i{i}t">{html.escape(es["items"][i-1][0])}</li>' for i in (1, 5, 9))
    items = []
    for i, (t, x) in enumerate(es["items"], 1):
        if i - 1 == US:
            why = "".join(f'<li data-i="ck.w{j}">{html.escape(w)}</li>' for j, w in enumerate(es["why"], 1))
            items.append(f'<li class="ck-us"><h3 data-i="ck.i{i}t">{html.escape(t)}</h3><p data-i="ck.i{i}d">{html.escape(x)}</p><ul class="ck-why">{why}</ul></li>')
        else:
            items.append(f'<li><h3 data-i="ck.i{i}t">{html.escape(t)}</h3><p data-i="ck.i{i}d">{html.escape(x)}</p></li>')
    return f'''<!-- CHECKLIST START -->
<section id="checklist">
  <div class="wrap">
    <div class="card ck">
      <div class="ck-l">
        <span class="kicker" data-i="ck.k">{html.escape(es["k"])}</span>
        <h2 class="title" data-i="ck.t">{html.escape(es["t"])}</h2>
        <p class="lead" data-i="ck.l">{html.escape(es["l"])}</p>
        <ul class="ck-prev">{prev}</ul>
      </div>
      <div class="ck-r">
        <form class="ck-f" id="ckF" name="owners-checklist" novalidate>
          <p hidden><label>Leave empty <input name="hp" tabindex="-1" autocomplete="off"></label></p>
          <label><span data-i="ck.name">{html.escape(es["name"])}</span><input name="name" autocomplete="name"></label>
          <label><span data-i="ck.wa">{html.escape(es["wa"])}</span><input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="+507 6000 0000" required></label>
          <p class="ck-err" id="ckErr" role="alert" hidden></p>
          <button class="btn btn-wa" type="submit"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg><span data-i="ck.btn">{html.escape(es["btn"])}</span></button>
          <p class="ck-note"><span data-i="ck.consent">{html.escape(es["consent"])}</span> <a id="ckPriv" href="/es/privacidad/" data-i="ck.privacy">{html.escape(es["privacy"])}</a>.</p>
        </form>
        <div class="ck-ok" id="ckOk" hidden>
          <b data-i="ck.ok">{html.escape(es["ok"])}</b>
          <a class="btn btn-gold" id="ckPdf" href="/owners/checklist-es.pdf" download><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg><span data-i="ck.pdf">{html.escape(es["pdf"])}</span></a>
          <p class="ck-note" data-i="ck.okn">{html.escape(es["okn"])}</p>
          <a class="btn btn-wa js-wa" data-place="checklist" data-msg="ck.wa" href="https://wa.me/50767185938?text={urllib.parse.quote(es["wamsg"], safe="")}" target="_blank" rel="noopener"><span data-i="ck.okb">{html.escape(es["okb"])}</span></a>
        </div>
      </div>
    </div>
    <ol class="ck-list" id="ckList" hidden>{"".join(items)}</ol>
  </div>
</section>
<!-- CHECKLIST END -->
'''


CSS = '''/* ck:start */
#checklist .ck{display:grid;grid-template-columns:1.15fr 1fr;gap:28px;padding:clamp(22px,4vw,40px);align-items:center}
.ck-prev{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:10px;color:var(--muted);font-size:15px}
.ck-prev li{display:flex;gap:10px;align-items:flex-start}
.ck-prev li::before{content:"✓";color:var(--gold);font-weight:800;flex:none}
.ck-f{display:flex;flex-direction:column;gap:14px;padding:22px;border-radius:18px;background:var(--surface2);border:1px solid var(--line2)}
.ck-f label{display:flex;flex-direction:column;gap:6px;font-size:14px;color:var(--muted)}
.ck-f input{min-height:50px;padding:0 14px;border-radius:12px;background:var(--bg);border:1px solid var(--line2);color:var(--text);font:600 16px/1.2 var(--body)}
.ck-f input:focus{outline:none;border-color:var(--gold)}
.ck-f .btn{width:100%}
.ck-note{margin:0;font-size:12.5px;line-height:1.5;color:var(--dim)}
.ck-note a{color:var(--gold)}
.ck-err{margin:0;color:#f08a8a;font-size:13.5px}
.ck-ok{display:flex;flex-direction:column;gap:14px;padding:22px;border-radius:18px;background:var(--surface2);border:1px solid var(--goldLine)}
.ck-ok>b{font:800 20px/1.25 var(--display)}
.ck-ok .btn{width:100%}
.ck-list{counter-reset:ck;list-style:none;margin:24px 0 0;padding:0;display:grid;gap:12px;grid-template-columns:1fr 1fr}
.ck-list>li{counter-increment:ck;position:relative;padding:18px 18px 18px 66px;border:1px solid var(--line);border-radius:18px;background:var(--surface);min-width:0}
.ck-list>li::before{content:counter(ck);position:absolute;left:16px;top:16px;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--goldSoft);color:var(--gold);font:800 15px/1 var(--display);border:1px solid var(--goldLine)}
.ck-list h3{font:700 16.5px/1.3 var(--display);margin:0}
.ck-list p{margin:6px 0 0;color:var(--muted);font-size:14.5px;line-height:1.5}
.ck-list>li.ck-us{grid-column:1/-1;border-color:var(--goldLine);background:linear-gradient(160deg,#1f1a11,#13161a)}
.ck-why{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px}
.ck-why li{position:relative;padding-left:22px;color:var(--text);font-size:14.5px;line-height:1.5}
.ck-why li::before{content:"✓";position:absolute;left:0;color:var(--gold);font-weight:800}
.ck-f[hidden],.ck-ok[hidden],.ck-list[hidden]{display:none}
.ck-ok .btn-gold{background:linear-gradient(135deg,#e6c58f,#b8864b);color:#1a1307;box-shadow:0 14px 30px -14px rgba(214,176,115,.6)}
@media (max-width:860px){#checklist .ck{grid-template-columns:1fr}.ck-list{grid-template-columns:1fr}.ck-list>li{padding-left:62px}}
/* ck:end */'''

JS = '''/* ck-js:start */
/* checklist: a WhatsApp number opens the 15 steps and the PDF; the lead goes to the bot and the CRM */
(()=>{const f=$('#ckF');if(!f)return;
  const show=()=>{$('#ckF').hidden=true;$('#ckOk').hidden=false;$('#ckList').hidden=false;};
  $('#ckPdf').href='/owners/checklist-'+lang+'.pdf';$('#ckPriv').href=lang==='es'?'/es/privacidad/':'/privacy/';
  try{if(sessionStorage.getItem('ck_ok')==='1')show();}catch(e){}
  f.addEventListener('submit',e=>{e.preventDefault();const D=I18N[lang],d=new FormData(f);if(d.get('hp'))return;
    const wa=String(d.get('whatsapp')||'').replace(/[^\\d+]/g,''),err=$('#ckErr');
    if(wa.replace(/\\D/g,'').length<8){err.textContent=D['ck.err'];err.hidden=false;return;}err.hidden=true;
    const id=eid();
    if(CONFIG.leadsUrl){const q=new URLSearchParams(location.search),b=new URLSearchParams({site:'restate.deals',type:'Owner',form:'owners_checklist',
        name:String(d.get('name')||'').slice(0,120),whatsapp:wa,lang,notes:'Owners checklist (PDF)',event_id:id,page_url:location.href.split('#')[0]});
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].forEach(k=>q.get(k)&&b.set(k,q.get(k)));
      fetch(CONFIG.leadsUrl,{method:'POST',mode:'no-cors',keepalive:true,body:b}).catch(()=>{});}
    fb('track','Lead',{content_name:'owners_checklist',lang},id);ga('generate_lead',{method:'checklist'});track('Lead',{form:'owners_checklist'});
    try{sessionStorage.setItem('ck_ok','1')}catch(e){}
    show();$('#ckOk').scrollIntoView({behavior:'smooth',block:'nearest'});
  });
})();
/* ck-js:end */'''


def inject():
    s = PAGE.read_text()
    # 1. dictionaries: drop old ck.* keys, add the new ones right after each language's opening brace
    s = re.sub(r'"ck\.[\w]+":\s*"(?:[^"\\]|\\.)*",\s*', "", s)
    for lang in LANGS:
        m = re.search(r"\n%s:\{" % lang, s)
        assert m, f"dictionary {lang} not found"
        add = "".join(f"{jdump(k)}:{jdump(v)}," for k, v in dict_keys(lang).items())
        s = s[:m.end()] + add + s[m.end():]
    # 2. section before the FAQ section
    s = re.sub(r"<!-- CHECKLIST START -->.*?<!-- CHECKLIST END -->\n", "", s, flags=re.S)
    faq = s.index('<span class="kicker" data-i="f.k">')
    start = s.rindex("<section", 0, faq)
    s = s[:start] + section_html() + "\n" + s[start:]
    # 3. css
    s = re.sub(r"/\* ck:start \*/.*?/\* ck:end \*/\n?", "", s, flags=re.S)
    s = s.replace("</style>", CSS + "\n</style>", 1)
    # 4. config + script
    if "leadsUrl:" not in s:
        s = s.replace('whatsapp:"50767185938",', f'whatsapp:"50767185938",\n  leadsUrl:"{LEADS_URL}",  // the WhaleHome bot Worker: leads go to the Restate Deals CRM and to Artem in Telegram', 1)
    s = re.sub(r"/\* ck-js:start \*/.*?/\* ck-js:end \*/\n?", "", s, flags=re.S)
    anchor = "$('#yr').textContent"
    assert anchor in s
    s = s.replace(anchor, JS + "\n" + anchor, 1)
    PAGE.write_text(s)
    print("injected into", PAGE)


def pdf_html(lang):
    d = DATA[lang]
    rows = []
    for i, (t, x) in enumerate(d["items"], 1):
        extra = ""
        cls = ""
        if i - 1 == US:
            extra = "<ul>" + "".join(f"<li>{html.escape(w)}</li>" for w in d["why"]) + "</ul>"
            cls = " class=us"
        rows.append(f"<li{cls}><span class=n>{i}</span><div><h3>{html.escape(t)}</h3><p>{html.escape(x)}</p>{extra}</div></li>")
    return f'''<!doctype html><html lang="{lang}"><meta charset="utf-8"><title>{html.escape(d["pdf_title"])}</title>
<style>
@page{{size:A4;margin:16mm 15mm 18mm}}
*{{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
body{{margin:0;font:11pt/1.45 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#17181b}}
header{{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #d6b073;padding-bottom:8pt;margin-bottom:14pt}}
.logo{{font-weight:800;font-size:13pt;letter-spacing:-.01em}}.logo i{{font-style:normal;color:#b8864b;font-weight:600}}
.tag{{font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase;color:#b8864b;font-weight:700}}
h1{{font-size:21pt;line-height:1.15;margin:0 0 6pt;letter-spacing:-.02em}}
.lead{{margin:0 0 14pt;color:#55575d}}
ol{{list-style:none;margin:0;padding:0}}
li{{display:flex;gap:10pt;padding:8pt 0;border-bottom:1px solid #e7e3da;break-inside:avoid}}
.n{{flex:none;width:22pt;height:22pt;border-radius:50%;background:#f3e9d6;color:#8a5f2b;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:10pt}}
h3{{margin:0;font-size:11.5pt}}p{{margin:2pt 0 0;color:#44464c;font-size:10pt}}
li.us{{background:#fbf5e9;border:1px solid #d6b073;border-radius:8pt;padding:10pt;margin:6pt 0}}
li.us ul{{margin:6pt 0 0;padding-left:14pt;font-size:10pt;color:#2a2b2f}}li.us li{{display:list-item;border:0;padding:1.5pt 0}}
footer{{margin-top:14pt;padding-top:8pt;border-top:2px solid #d6b073;display:flex;justify-content:space-between;font-size:9.5pt;color:#55575d}}
footer b,footer a{{color:#17181b;text-decoration:none}}
</style>
<header><div class=logo>Restate<i> Deals</i></div><div class=tag>{html.escape(d["k"])}</div></header>
<h1>{html.escape(d["t"])}</h1><p class=lead>{html.escape(d["l"].split(".")[0])}.</p>
<ol>{"".join(rows)}</ol>
<footer><span>{html.escape(d["pdf_foot"])}</span><span><a href="https://wa.me/50767185938?text={urllib.parse.quote(d["wamsg"], safe="")}"><b>WhatsApp {WHATSAPP_TXT}</b></a></span></footer></html>'''


def make_pdfs():
    assert CHROME.exists(), f"Chromium not found: {CHROME}"
    for lang in LANGS:
        with tempfile.TemporaryDirectory() as td:
            h = pathlib.Path(td) / f"c-{lang}.html"
            h.write_text(pdf_html(lang))
            out = ROOT / "owners" / f"checklist-{lang}.pdf"
            subprocess.run([str(CHROME), "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                            f"--print-to-pdf={out}", h.as_uri()], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("pdf", out, out.stat().st_size, "bytes")


if __name__ == "__main__":
    inject()
    make_pdfs()
