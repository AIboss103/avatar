/* Restate Deals: ad attribution (UTM, fbclid) + outbound click events. Invisible: no markup, no styles.
   Loaded with <script defer src="/rd-track.js"> in the <head> of every page (main page and its language/price copies,
   /partners/, /legal/). The GA4 tag (G-K8FTGB7RF5) and the Meta Pixel (913718525040508) are inline in each page's <head>;
   this file only sends events to them (window.gtag / window.fbq) and works fine when they are blocked. */
(function () {
  "use strict";

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

  function meta(type, name, params, eventID) {
    if (!W.fbq) return;
    try { if (eventID) W.fbq(type, name, params || {}, { eventID: eventID }); else W.fbq(type, name, params || {}); } catch (e) {}
  }

  function ga(name, params) { try { if (W.gtag) W.gtag("event", name, params || {}); } catch (e) {} }

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

  /* 3. Outbound clicks the page itself doesn't track: WhatsApp / Telegram -> Contact, Calendly -> ScheduleClick.
     Links with .js-wa .js-calc-wa .js-cal .js-calc-book already go through the main page's track(). */
  D.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null; if (!a || a.hasAttribute("data-rd-skip") || a.matches(".js-wa,.js-calc-wa,.js-cal,.js-calc-book")) return; // data-rd-skip: WhatsApp opened by a form submit (already a Lead)
    var h = a.href || "", place = (a.dataset && a.dataset.place) || "other";
    if (a.classList.contains("js-calc-wa")) place = "roi";
    var p = { method: "", place: place, page: location.pathname };
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//.test(h)) { p.method = "whatsapp"; meta("track", "Contact", p); ga("whatsapp_click", p); }
    else if (/^https?:\/\/(t\.me|telegram\.me)\//.test(h)) { p.method = "telegram"; meta("track", "Contact", p); ga("telegram_click", p); }
    else if (/^https?:\/\/([a-z0-9-]+\.)?calendly\.com\//.test(h)) { p.method = "calendly"; meta("trackCustom", "ScheduleClick", p); ga("book_call_click", p); }
  }, true);

  /* Calendly inline widget: a booked slot */
  W.addEventListener("message", function (e) {
    try {
      if (!/calendly\.com$/.test(new URL(e.origin).hostname)) return;
      if (!(e.data && e.data.event === "calendly.event_scheduled")) return;
      store("rd_booked", Date.now());   // the ?booked=1 redirect skips its own count for 15 min
      if (typeof W.track === "function") W.track("Call Booked", { method: "calendly_embed" });
      else { meta("track", "Schedule", { method: "calendly", place: "embed" }); ga("book_call", { method: "calendly_embed" }); }
    } catch (x) {}
  });

  W.rdTrack = { meta: meta, ga: ga, uuid: uuid, leadFields: leadFields };
})();
