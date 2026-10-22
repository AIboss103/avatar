(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var ES = window.I18N_ES || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PLANS = {
    starter: { name: "Starter", price: 10000 },
    standard: { name: "Standard", price: 20000 },
    maximum: { name: "Maximum", price: 30000 }
  };

  // Strings generated at runtime (not present in the HTML).
  var D = {
    en: {
      mo: "/ mo",
      countries: ["Mexico", "Cayman Islands", "Colombia", "Costa Rica", "Panama", "Other"],
      roi: "≈ {x}× projected revenue vs. package fee + est. lead cost",
      copied: "Address copied",
      copyFail: "Copy failed — select the address manually",
      addrMissing: "Wallet address is shared after a quick KYC call. Use the form and we'll send it within 1 hour.",
      addrNote: "Send only {coin} to this address. Amount: ${amount}.",
      stripeMissing: "Secure Stripe invoice will be sent after a short call — taking you to the form.",
      fRequired: "Please fill in all fields.",
      fEmail: "Please enter a valid email.",
      fSending: "Sending…",
      fOk: "Thank you! A senior strategist will contact you within one business day.",
      fErr: "Something went wrong. Please try again",
      fErrMail: " or email us at "
    },
    es: {
      mo: "/ mes",
      countries: ["México", "Islas Caimán", "Colombia", "Costa Rica", "Panamá", "Otros"],
      roi: "≈ {x}× ingresos proyectados frente a la tarifa del plan + costo estimado de leads",
      copied: "Dirección copiada",
      copyFail: "No se pudo copiar — seleccione la dirección manualmente",
      addrMissing: "La dirección de la billetera se comparte tras una breve llamada KYC. Use el formulario y se la enviaremos en 1 hora.",
      addrNote: "Envíe solo {coin} a esta dirección. Monto: ${amount}.",
      stripeMissing: "Le enviaremos una factura segura de Stripe tras una breve llamada — le llevamos al formulario.",
      fRequired: "Por favor complete todos los campos.",
      fEmail: "Por favor ingrese un correo válido.",
      fSending: "Enviando…",
      fOk: "¡Gracias! Un estratega senior le contactará en un día hábil.",
      fErr: "Algo salió mal. Inténtelo de nuevo",
      fErrMail: " o escríbanos a "
    }
  };

  var lang = "en";
  var t = function (k) { return D[lang][k]; };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var money = function (n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, "") + "M";
    if (n >= 1e4) return "$" + Math.round(n / 1e3) + "K";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return "$" + Math.round(n);
  };

  /* ---------------- i18n ---------------- */
  var EN = {};
  var nodes = $$("[data-i18n]");
  var phNodes = $$("[data-i18n-ph]");
  var metaDesc = $('meta[name="description"]');
  nodes.forEach(function (el) {
    var k = el.getAttribute("data-i18n");
    if (!(k in EN)) EN[k] = el.innerHTML;
  });
  phNodes.forEach(function (el) { EN[el.getAttribute("data-i18n-ph")] = el.getAttribute("placeholder"); });
  EN["meta.title"] = document.title;
  EN["meta.desc"] = metaDesc ? metaDesc.content : "";

  function tr(k) { return lang === "es" && ES[k] != null ? ES[k] : EN[k]; }

  function setLang(next, persist) {
    lang = next === "es" ? "es" : "en";
    document.documentElement.lang = lang;
    nodes.forEach(function (el) { el.innerHTML = tr(el.getAttribute("data-i18n")); });
    phNodes.forEach(function (el) { el.setAttribute("placeholder", tr(el.getAttribute("data-i18n-ph"))); });
    document.title = tr("meta.title");
    if (metaDesc) metaDesc.content = tr("meta.desc");
    $$(".lang__btn").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $$("#f-plan option").forEach(function (o) {
      var p = PLANS[o.value];
      if (p) o.textContent = p.name + " — $" + fmt(p.price) + " " + t("mo");
    });
    var fl = $("#formLang"); if (fl) fl.value = lang;
    if (persist) { try { localStorage.setItem("lang", lang); } catch (e) {} }
    renderChart();
    renderCalc();
    if (!modal.hidden) renderCoin();
  }

  function initialLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "es" || q === "en") return q;
    try { var s = localStorage.getItem("lang"); if (s) return s; } catch (e) {}
    return (navigator.language || "").toLowerCase().indexOf("es") === 0 ? "es" : "en";
  }

  $$(".lang__btn").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang"), true); });
  });

  /* ---------------- Header & nav ---------------- */
  var header = $("#header");
  var burger = $("#burger");
  var nav = $("#nav");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeNav() { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", closeNav); });

  if ("IntersectionObserver" in window) {
    var links = {};
    $$("#nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          $$("#nav a").forEach(function (a) { a.classList.remove("is-active"); });
          links[e.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) navIO.observe(s); });
  }

  /* ---------------- Reveal & counters ---------------- */
  function countUp(el) {
    var end = +el.getAttribute("data-count");
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = end + suffix; return; }
    var start = performance.now(), dur = 1400;
    (function step(now) {
      var p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  var reveals = $$(".reveal");
  // Stagger siblings in grids
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    var sibs = $$(":scope > .reveal", parent);
    if (sibs.length > 1) el.style.setProperty("--d", (sibs.indexOf(el) % 6) * 0.08 + "s");
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(countUp);
        if (e.target.id === "chart") animateBars();
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
    setTimeout(animateBars, 0);
  }

  // Cursor-follow glow on problem cards
  $$(".pcard").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------------- Chart ---------------- */
  var SCEN = {
    now:   [38, 22, 12, 9, 7, 12],
    after: [30, 17, 10, 7, 26, 10]
  };
  var scenario = "now";
  var barsShown = false;
  var chartEl = $("#chartBars");

  function renderChart() {
    if (!chartEl) return;
    var names = t("countries");
    if (!chartEl.firstChild) {
      var html = '<div class="bars">';
      names.forEach(function (n, i) {
        html += '<div class="bar' + (i === 4 ? " bar--panama" : "") + '"><span class="bar__label"></span>' +
          '<div class="bar__track"><div class="bar__fill"></div></div><span class="bar__val">0%</span></div>';
      });
      chartEl.innerHTML = html + "</div>";
    }
    $$(".bar", chartEl).forEach(function (row, i) {
      $(".bar__label", row).textContent = names[i];
    });
    if (barsShown) animateBars();
  }

  function animateBars() {
    barsShown = true;
    var vals = SCEN[scenario];
    var max = 40;
    $$(".bar", chartEl).forEach(function (row, i) {
      $(".bar__fill", row).style.width = (vals[i] / max) * 100 + "%";
      var valEl = $(".bar__val", row);
      var from = parseInt(valEl.textContent, 10) || 0, to = vals[i];
      if (reduceMotion) { valEl.textContent = to + "%"; return; }
      var start = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - start) / 900);
        valEl.textContent = Math.round(from + (to - from) * p) + "%";
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }

  $$("[data-scenario]").forEach(function (b) {
    b.addEventListener("click", function () {
      scenario = b.getAttribute("data-scenario");
      $$("[data-scenario]").forEach(function (x) {
        var on = x === b;
        x.classList.toggle("is-active", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      animateBars();
    });
  });

  /* ---------------- Calculator ---------------- */
  var ticket = $("#ticket"), patients = $("#patients");
  var CONSULT_TO_PATIENT = 0.25, LEAD_TO_CONSULT = [0.25, 0.35], CPL = [120, 280];

  function fill(r) {
    var p = ((r.value - r.min) / (r.max - r.min)) * 100;
    r.style.setProperty("--p", p + "%");
  }

  function renderCalc() {
    if (!ticket) return;
    var T = +ticket.value, P = +patients.value;
    fill(ticket); fill(patients);
    $("#ticketOut").textContent = "$" + fmt(T) + (T >= 70000 ? "+" : "");
    $("#patientsOut").textContent = P + (P >= 10 ? "+" : "");

    var revenue = T * P;
    var consults = Math.ceil(P / CONSULT_TO_PATIENT);
    var leadsLo = Math.ceil(consults / LEAD_TO_CONSULT[1]);
    var leadsHi = Math.ceil(consults / LEAD_TO_CONSULT[0]);
    var costLo = leadsLo * CPL[0], costHi = leadsHi * CPL[1];
    var planKey = P <= 3 ? "starter" : P <= 6 ? "standard" : "maximum";
    var plan = PLANS[planKey];
    var roi = revenue / (plan.price + (costLo + costHi) / 2);

    $("#rMonthly").textContent = "$" + fmt(revenue);
    $("#rYear").textContent = money(revenue * 12);
    $("#rConsults").textContent = consults;
    $("#rLeads").textContent = leadsLo + "–" + leadsHi;
    $("#rCpl").textContent = money(costLo) + "–" + money(costHi);
    $("#rPlan").textContent = plan.name + " · $" + fmt(plan.price);
    $("#rRoi").textContent = t("roi").replace("{x}", roi.toFixed(1));
  }
  [ticket, patients].forEach(function (r) { if (r) r.addEventListener("input", renderCalc); });

  /* ---------------- Modal / checkout ---------------- */
  var modal = $("#modal");
  var panel = $(".modal__panel", modal);
  var currentPlan = "standard";
  var currentCoin = "usdt";
  var lastFocus = null;
  var scrollY = 0;
  var COIN_LABEL = { usdt: "USDT (TRC20)", btc: "BTC", eth: "ETH (ERC20)" };

  function lockScroll() {
    scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
  }
  function unlockScroll() {
    document.body.style.position = document.body.style.top = document.body.style.left = document.body.style.right = "";
    window.scrollTo({ top: scrollY, behavior: "instant" });
  }

  function setTab(name) {
    $$("[data-tab]", modal).forEach(function (b) {
      var on = b.getAttribute("data-tab") === name;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$("[data-pane]", modal).forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== name; });
  }

  function renderCoin() {
    $$("[data-coin]", modal).forEach(function (b) {
      var on = b.getAttribute("data-coin") === currentCoin;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    var addr = (CFG.crypto || {})[currentCoin];
    var box = $(".addr", modal);
    if (addr) {
      $("#mAddr").textContent = addr;
      box.hidden = false;
      $("#mAddrNote").textContent = t("addrNote").replace("{coin}", COIN_LABEL[currentCoin]).replace("{amount}", fmt(PLANS[currentPlan].price));
    } else {
      box.hidden = true;
      $("#mAddrNote").textContent = t("addrMissing");
    }
  }

  function openModal(planKey, tab, coin) {
    currentPlan = PLANS[planKey] ? planKey : "standard";
    if (coin) currentCoin = coin;
    $("#mPlanName").textContent = PLANS[currentPlan].name;
    $("#mPlanPrice").textContent = "$" + fmt(PLANS[currentPlan].price);
    setTab(tab || "call");
    renderCoin();
    lastFocus = document.activeElement;
    modal.hidden = false;
    lockScroll();
    panel.focus();
    document.addEventListener("keydown", onModalKey);
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    unlockScroll();
    document.removeEventListener("keydown", onModalKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function onModalKey(e) {
    if (e.key === "Escape") return closeModal();
    if (e.key !== "Tab") return;
    var f = $$("button:not([hidden]), a[href], input, select", panel).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function goToForm(planKey) {
    closeModal();
    var sel = $("#f-plan");
    if (sel && planKey) sel.value = planKey;
    var contact = $("#contact");
    contact.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(function () { $("#f-name").focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
  }

  $$("[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () { openModal(b.getAttribute("data-plan")); });
  });
  $$("[data-close]", modal).forEach(function (b) { b.addEventListener("click", closeModal); });
  $$("[data-tab]", modal).forEach(function (b) {
    b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); });
  });
  $$("[data-coin]", modal).forEach(function (b) {
    b.addEventListener("click", function () { currentCoin = b.getAttribute("data-coin"); renderCoin(); });
  });

  $("#mCall").addEventListener("click", function () {
    if (CFG.bookingUrl) {
      window.open(CFG.bookingUrl, "_blank", "noopener");
      closeModal();
    } else {
      goToForm(currentPlan);
    }
  });

  $("#mStripe").addEventListener("click", function () {
    var link = (CFG.stripe || {})[currentPlan];
    if (link) {
      window.location.href = link;
    } else {
      toast(t("stripeMissing"));
      goToForm(currentPlan);
    }
  });

  $("#mCopy").addEventListener("click", function () {
    var addr = $("#mAddr").textContent;
    var done = function () { toast(t("copied")); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(addr).then(done, function () { toast(t("copyFail")); });
    } else {
      var range = document.createRange();
      range.selectNodeContents($("#mAddr"));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(range);
      try { document.execCommand("copy") ? done() : toast(t("copyFail")); } catch (e) { toast(t("copyFail")); }
    }
  });

  // Direct payment tiles in the contact block
  $$("[data-pay]").forEach(function (b) {
    b.addEventListener("click", function () {
      var kind = b.getAttribute("data-pay");
      var sel = $("#f-plan");
      var planKey = sel && PLANS[sel.value] ? sel.value : "standard";
      if (kind === "card") openModal(planKey, "card");
      else openModal(planKey, "crypto", kind);
    });
  });

  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  /* ---------------- Lead form (Netlify Forms) ---------------- */
  var form = $("#leadForm");
  var msg = $("#formMsg");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("input[required]", form).forEach(function (inp) {
      var bad = !inp.value.trim() || (inp.type === "email" && !EMAIL_RE.test(inp.value.trim()));
      inp.closest(".field").classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    msg.className = "form__msg";
    if (!ok) {
      var emailBad = !EMAIL_RE.test($("#f-email").value.trim()) && $("#f-email").value.trim();
      msg.textContent = emailBad ? t("fEmail") : t("fRequired");
      msg.classList.add("err");
      var firstBad = $(".is-invalid input", form); if (firstBad) firstBad.focus();
      return;
    }
    var btn = $('button[type="submit"]', form);
    btn.disabled = true;
    msg.textContent = t("fSending");
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      form.reset();
      $("#formLang").value = lang;
      msg.textContent = t("fOk");
      msg.classList.add("ok");
    }).catch(function () {
      msg.innerHTML = "";
      msg.appendChild(document.createTextNode(t("fErr")));
      if (CFG.email) {
        msg.appendChild(document.createTextNode(t("fErrMail")));
        var a = document.createElement("a");
        a.href = "mailto:" + CFG.email; a.textContent = CFG.email; a.style.textDecoration = "underline";
        msg.appendChild(a);
      }
      msg.appendChild(document.createTextNode("."));
      msg.classList.add("err");
    }).then(function () { btn.disabled = false; });
  });
  $$("input", form).forEach(function (inp) {
    inp.addEventListener("input", function () { inp.closest(".field") && inp.closest(".field").classList.remove("is-invalid"); });
  });

  /* ---------------- Brand links & year ---------------- */
  $$("[data-brand]").forEach(function (a) {
    var href = (CFG.brands || {})[a.getAttribute("data-brand")];
    if (href) a.href = href; else { a.removeAttribute("target"); a.removeAttribute("rel"); }
  });
  $("#year").textContent = new Date().getFullYear();

  /* ---------------- 3D DNA helix (Canvas 2D) ---------------- */
  (function dna() {
    var canvas = $("#dna");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, DPR = 1, mobile = false;
    var PAIRS = 34, TURNS = 2.4, FOCAL = 700;
    var rot = 0, spin = 0, tiltX = 0, targetTilt = 0, targetSpin = 0, scrollBoost = 0;
    var lastScroll = window.scrollY;
    var particles = [];
    var running = false, visible = true, raf = 0;

    function sprite(inner, outer, size) {
      var c = document.createElement("canvas");
      c.width = c.height = size;
      var g = c.getContext("2d");
      var r = size / 2;
      var grd = g.createRadialGradient(r * 0.75, r * 0.7, 0, r, r, r);
      grd.addColorStop(0, "#ffffff");
      grd.addColorStop(0.22, inner);
      grd.addColorStop(0.55, outer);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd;
      g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.fill();
      return c;
    }
    var SPR_A = sprite("#3dfcc8", "rgba(34,228,255,0.35)", 64);
    var SPR_B = sprite("#a99bff", "rgba(123,92,255,0.35)", 64);
    var SPR_P = sprite("rgba(34,228,255,0.9)", "rgba(34,228,255,0.08)", 32);

    function resize() {
      var rect = canvas.getBoundingClientRect();
      mobile = rect.width < 960;
      DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var count = mobile ? 26 : 60;
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random(), vy: 0.1 + Math.random() * 0.35, r: 6 + Math.random() * 18 });
      }
      if (!running) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // ambient cells / particles
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (!reduceMotion) { p.y -= p.vy * (0.5 + p.z); if (p.y < -30) { p.y = H + 30; p.x = Math.random() * W; } }
        var px = p.x + spin * 40 * p.z, size = p.r * (0.4 + p.z);
        ctx.globalAlpha = 0.15 + p.z * 0.35;
        ctx.drawImage(SPR_P, px - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      var cx = mobile ? W * 0.78 : W * 0.74;
      var cy = mobile ? H * 0.5 : H * 0.54;
      var R = mobile ? Math.min(W * 0.16, 70) : Math.min(W * 0.1, 140);
      var len = mobile ? H * 0.95 : H * 0.8;
      var baseAngle = -0.42 + spin * 0.12;
      var cosZ = Math.cos(baseAngle), sinZ = Math.sin(baseAngle);
      var cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
      var pts = [];

      for (var k = 0; k < PAIRS; k++) {
        var tt = k / (PAIRS - 1);
        var y = (tt - 0.5) * len;
        var a = tt * TURNS * Math.PI * 2 + rot;
        for (var s = 0; s < 2; s++) {
          var ang = a + s * Math.PI;
          var x = Math.cos(ang) * R, z = Math.sin(ang) * R;
          var y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX;
          var x2 = x * cosZ - y1 * sinZ, y2 = x * sinZ + y1 * cosZ;
          var sc = FOCAL / (FOCAL + z1);
          pts.push({ x: cx + x2 * sc, y: cy + y2 * sc, z: z1, sc: sc, s: s, k: k });
        }
      }

      // base-pair rungs
      ctx.lineCap = "round";
      for (k = 0; k < PAIRS; k++) {
        var A = pts[k * 2], B = pts[k * 2 + 1];
        var depth = 1 - ((A.z + B.z) / 2 + R) / (2 * R); // 1 = front
        var g = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
        g.addColorStop(0, "rgba(61,252,200," + (0.15 + depth * 0.55) + ")");
        g.addColorStop(0.5, "rgba(255,255,255," + (0.05 + depth * 0.2) + ")");
        g.addColorStop(1, "rgba(143,123,255," + (0.15 + depth * 0.55) + ")");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2 + depth * 2;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }

      // backbones
      for (s = 0; s < 2; s++) {
        ctx.beginPath();
        for (k = 0; k < PAIRS; k++) {
          var q = pts[k * 2 + s];
          if (k === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
        }
        ctx.strokeStyle = s ? "rgba(143,123,255,0.35)" : "rgba(34,228,255,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // nucleotides, back to front
      pts.sort(function (m, n) { return n.z - m.z; });
      for (i = 0; i < pts.length; i++) {
        var P = pts[i];
        var d = 1 - (P.z + R) / (2 * R);
        var sz = (mobile ? 16 : 24) * P.sc * (0.7 + d * 0.6);
        ctx.globalAlpha = 0.35 + d * 0.65;
        ctx.drawImage(P.s ? SPR_B : SPR_A, P.x - sz / 2, P.y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      if (!running) return;
      tiltX += (targetTilt - tiltX) * 0.05;
      spin += (targetSpin - spin) * 0.05;
      scrollBoost *= 0.92;
      rot += 0.006 + spin * 0.012 + scrollBoost;
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start() { if (running || reduceMotion) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function update() { (visible && !document.hidden) ? start() : stop(); }

    window.addEventListener("pointermove", function (e) {
      targetTilt = (e.clientY / window.innerHeight - 0.5) * 0.7;
      targetSpin = (e.clientX / window.innerWidth - 0.5) * 2;
    }, { passive: true });
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      scrollBoost += (y - lastScroll) * 0.0006;
      scrollBoost = Math.max(-0.08, Math.min(0.08, scrollBoost));
      lastScroll = y;
    }, { passive: true });
    window.addEventListener("resize", function () { clearTimeout(resize.t); resize.t = setTimeout(resize, 120); });
    document.addEventListener("visibilitychange", update);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; update(); }).observe(canvas);
    }
    resize();
    update();
  })();

  /* ---------------- Boot ---------------- */
  setLang(initialLang(), false);
})();
