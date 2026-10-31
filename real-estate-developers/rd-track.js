/* Restate Deals: Meta Pixel + ad attribution (UTM, fbclid). Invisible: no markup, no styles.
   Loaded with <script defer src="/rd-track.js"> in the <head> of every page (main page and its language/price copies, /partners/, /legal/).

   META_PIXEL_ID: put the dataset ID from Meta Events Manager here. This is the only place it lives.
   Empty string = the pixel is off: nothing loads from Facebook, the site and forms work as before. */
(function () {
  "use strict";
  var PIXEL_ID = ""; // META_PIXEL_ID (public, not a secret)

  var W = window, D = document, now = Date.now();
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];

  function store(k, v) {
    try {
      if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null");
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }
  function cookie(n) {
    try { var m = D.cookie.match("(?:^|; )" + n + "=([^;]*)"); return m ? decodeURIComponent(m[1]) : ""; }
    catch (e) { return ""; }
  }
  function uuid() {
    try { if (W.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return "e" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
  }

  /* 1. Attribution: first touch (kept forever) and last touch (updated by every ad / UTM visit) */
  var page = location.href.split("#")[0], ref = D.referrer || "", hit = {};
  try { var q = new URLSearchParams(location.search); KEYS.forEach(function (k) { var v = q.get(k); if (v) hit[k] = v.slice(0, 300); }); } catch (e) {}
  var visit = { ts: now, landing_page: page, referrer: ref };
  for (var k in hit) visit[k] = hit[k];
  if (!store("rd_ft")) store("rd_ft", visit);
  if (Object.keys(hit).length || !store("rd_lt")) store("rd_lt", visit);

  /* 2. _fbc fallback (the pixel normally sets it): fb.1.<ms>.<fbclid>, 90 days, first-party */
  if (hit.fbclid && !cookie("_fbc")) {
    var host = location.hostname, dom = /(^|\.)restate\.deals$/.test(host) ? "; domain=.restate.deals" : "";
    try { D.cookie = "_fbc=" + encodeURIComponent("fb.1." + now + "." + hit.fbclid) + "; max-age=7776000; path=/" + dom + "; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : ""); } catch (e) {}
  }

  /* 3. Meta Pixel base code (standard snippet), only when PIXEL_ID is set */
  var on = !!PIXEL_ID;
  if (on) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(W, D, "script", "https://connect.facebook.net/en_US/fbevents.js");
    W.fbq("init", PIXEL_ID);
    W.fbq("track", "PageView");
  }

  function meta(type, name, params, eventID) {
    if (!on || !W.fbq) return;
    try { if (eventID) W.fbq(type, name, params || {}, { eventID: eventID }); else W.fbq(type, name, params || {}); } catch (e) {}
  }

  /* Fields added to every lead POST: dedup id, Meta cookies, UTM (last + first touch), pages, browser */
  function leadFields(eventId) {
    var lt = store("rd_lt") || {}, ft = store("rd_ft") || {}, o = {
      event_id: eventId || "", fbp: cookie("_fbp"), fbc: cookie("_fbc"),
      landing_page: ft.landing_page || page, lt_landing_page: lt.landing_page || page,
      page_url: page, referrer: ref || ft.referrer || "", user_agent: (navigator.userAgent || "").slice(0, 400)
    };
    KEYS.forEach(function (k) { o[k] = lt[k] || ""; o["ft_" + k] = ft[k] || ""; });
    return o;
  }

  /* 4. Outbound clicks on every page: WhatsApp / Telegram -> Contact, Calendly -> Schedule */
  D.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null; if (!a || a.hasAttribute("data-rd-skip")) return; // data-rd-skip: WhatsApp opened by a form submit (already a Lead)
    var h = a.href || "", place = (a.dataset && a.dataset.place) || "other";
    if (a.classList.contains("js-calc-wa")) place = "roi";
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//.test(h)) meta("track", "Contact", { method: "whatsapp", placement: place });
    else if (/^https?:\/\/(t\.me|telegram\.me)\//.test(h)) meta("track", "Contact", { method: "telegram", placement: place });
    else if (/^https?:\/\/([a-z0-9-]+\.)?calendly\.com\//.test(h)) meta("track", "Schedule", { method: "calendly", placement: place });
  }, true);

  /* Calendly inline widget: a booked slot */
  W.addEventListener("message", function (e) {
    try {
      if (!/calendly\.com$/.test(new URL(e.origin).hostname)) return;
      if (e.data && e.data.event === "calendly.event_scheduled") meta("track", "Schedule", { method: "calendly", placement: "embed" });
    } catch (x) {}
  });

  W.rdTrack = { meta: meta, uuid: uuid, leadFields: leadFields, pixelOn: on };
})();
