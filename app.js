/* ============ MASTER SOUD — app.js ============ */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  var WA = C.whatsapp || "5562998103265";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Meta Pixel ---------- */
  var pixelLoaded = false;
  function loadPixel() {
    if (pixelLoaded || !C.metaPixelId) return;
    pixelLoaded = true;
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", C.metaPixelId);
    window.fbq("track", "PageView");
    pending.forEach(function (a) { window.fbq.apply(null, a); });
    pending = [];
  }
  var pending = [];
  function track(type, name, params) {
    var args = [type, name, params || {}];
    if (window.fbq && pixelLoaded) window.fbq.apply(null, args); else pending.push(args);
    if (window.dataLayer) window.dataLayer.push({ event: name, params: params || {} });
  }
  window.msTrack = track;

  /* consentimento LGPD */
  var consent = $("#consent");
  var choice = store("ms_consent");
  if (C.metaPixelId) {
    if (!C.requireConsent || choice === "yes") loadPixel();
    else if (choice !== "no" && consent) { consent.hidden = false; document.body.classList.add("has-consent"); }
  }
  function closeConsent(v) { store("ms_consent", v); consent.hidden = true; document.body.classList.remove("has-consent"); if (v === "yes") loadPixel(); }
  if (consent) {
    $("#consentYes").addEventListener("click", function () { closeConsent("yes"); });
    $("#consentNo").addEventListener("click", function () { closeConsent("no"); });
    $("#consentMore").addEventListener("click", function (e) { e.preventDefault(); alertless(); });
  }
  function alertless() { openChat(); bot("Usamos o <b>Pixel da Meta</b> só para medir quantas pessoas chegam pelo Instagram/Facebook e melhorar os anúncios. Não coletamos seus dados de contato pelo site."); }

  /* ---------- WhatsApp ---------- */
  function waUrl(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  function waMsgFor(svc) {
    if (!svc || /orçamento|botão|contato/i.test(svc)) return C.whatsappDefaultMsg || "Olá! Vim pelo site e quero um orçamento.";
    return "Olá! Vim pelo site da Master Soud e quero um orçamento de: " + svc + ".";
  }
  $$("[data-wa]").forEach(function (el) {
    var svc = el.getAttribute("data-svc") || "";
    el.href = waUrl(el.getAttribute("data-msg") || waMsgFor(svc));
    el.target = "_blank"; el.rel = "noopener";
    el.addEventListener("click", function () { track("track", "Contact", { content_name: svc || "WhatsApp", content_category: "WhatsApp" }); });
  });

  /* ---------- nav ---------- */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 20); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  var burger = $("#burger"), menu = $("#menu");
  burger.addEventListener("click", function () {
    var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o);
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });

  /* ---------- reveal ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".reveal").forEach(function (el, i) {
      var sib = el.parentElement ? $$(".reveal", el.parentElement).indexOf(el) : 0;
      el.style.transitionDelay = Math.min(sib, 6) * 60 + "ms";
      io.observe(el);
    });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* ViewContent quando a seção de serviços aparece */
  var vcSent = false, svcSec = $("#servicos");
  if (svcSec && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting && !vcSent) { vcSent = true; track("track", "ViewContent", { content_name: "Serviços" }); ob.disconnect(); } }, { threshold: .25 }).observe(svcSec);
  }

  /* ---------- filtros ---------- */
  $$(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
      var f = b.getAttribute("data-filter");
      $$("#svcGrid .svc").forEach(function (s) { s.classList.toggle("hide", f !== "all" && s.getAttribute("data-cat") !== f); });
    });
  });
  $$(".svc").forEach(function (s) {
    s.addEventListener("pointermove", function (e) {
      var r = s.getBoundingClientRect();
      s.style.setProperty("--mx", (e.clientX - r.left) + "px"); s.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- tilt 3D do card ---------- */
  var card = $("[data-tilt]");
  if (card && !reduce) {
    var wrap = card.parentElement, tiltChips = $$(".tilt-child", wrap);
    function setTilt(x, y) { // x,y em -1..1
      card.style.transform = "rotateY(" + (-12 + x * 14) + "deg) rotateX(" + (6 - y * 12) + "deg)";
      card.style.setProperty("--mx", (50 + x * 40) + "%"); card.style.setProperty("--my", (30 + y * 40) + "%");
      tiltChips.forEach(function (c, i) { c.style.transform = "translate3d(" + (x * (i ? -14 : 14)) + "px," + (y * 10) + "px,0)"; });
    }
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      setTilt(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
    }, { passive: true });
    window.addEventListener("deviceorientation", function (e) {
      if (e.gamma == null) return;
      setTilt(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    }, { passive: true });
  }

  /* ---------- antes/depois (residencial) ---------- */
  var ba = $("#ba");
  if (ba) {
    var rng = $("input", ba);
    rng.addEventListener("input", function () { ba.style.setProperty("--pos", rng.value + "%"); });
  }

  /* ---------- ano ---------- */
  var ano = $("#ano"); if (ano) ano.textContent = new Date().getFullYear();

  /* =========================================================
     CHAT AUTOMÁTICO
     ========================================================= */
  var chat = $("#chat"), body = $("#chatBody"), quick = $("#chatQuick"), form = $("#chatForm"), input = $("#chatInput");
  var btn = $("#chatBtn"), bubble = $("#bubble");
  var started = false, flow = null;
  var SERVICES = $$("#svcGrid .svc").map(function (s) { return { name: $("h3", s).textContent, svc: s.getAttribute("data-svc") }; });

  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function add(html, who) {
    var d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; body.appendChild(d); scrollDown(); return d;
  }
  function me(t) { var d = add("", "me"); d.textContent = t; }
  function bot(html, delay) {
    var t = document.createElement("div"); t.className = "msg bot typing"; t.innerHTML = "<i></i><i></i><i></i>"; body.appendChild(t); scrollDown();
    setTimeout(function () { t.remove(); add(html, "bot"); }, reduce ? 0 : (delay || 650));
  }
  function waBtn(msg, label, lead) {
    var nm = lead && flow ? ' data-svcname="' + esc(flow.svc) + '" data-kind="' + flow.kind + '"' : "";
    return '<a class="btn btn-wa" href="' + waUrl(msg) + '" target="_blank" rel="noopener" data-chatwa="' + (lead ? "lead" : "contact") + '"' + nm + '><svg class="ico"><use href="#i-wa"/></svg>' + (label || "Continuar no WhatsApp") + "</a>";
  }
  body.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-chatwa]"); if (!a) return;
    track("track", a.getAttribute("data-chatwa") === "lead" ? "Lead" : "Contact", { content_name: a.getAttribute("data-svcname") || "Chat", content_category: a.getAttribute("data-kind") || "Chat" });
  });
  function chips(list) {
    quick.innerHTML = "";
    list.forEach(function (c) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = c.label;
      b.addEventListener("click", function () { me(c.label); c.fn ? c.fn() : answer(c.label); });
      quick.appendChild(b);
    });
  }
  var MODE = document.body.getAttribute("data-mode") === "casa" ? "casa" : "carro";
  var RES_SERVICES = [
    { name: "Controle solar", svc: "Película de controle solar" },
    { name: "Privacidade / espelhada", svc: "Película espelhada / privacidade" },
    { name: "Jateada / decorativa", svc: "Película jateada / decorativa" },
    { name: "Segurança", svc: "Película de segurança" },
    { name: "Proteção UV", svc: "Película com proteção UV" },
    { name: "Comercial e fachadas", svc: "Película comercial / fachada" }
  ];
  var RES_SVCS = RES_SERVICES.map(function (r) { return r.svc; });
  var RES_RE = /resid|janela|apartamento|\bapto\b|\bap\b|fachada|comerci|vitrine|sacada|varanda|escrit[oó]rio|porta de vidro|\bbox\b|divis[oó]ria|claraboia|empresa|im[oó]vel|minha casa|da casa|pra casa|para casa|sala|quarto/;
  var CAR_RE = /\bcarro|ve[ií]culo|autom[oó]v|moto\b|caminhonete|picape|para-?brisa|volant/;

  var MAIN = MODE === "casa" ? [
    { label: "💬 Fazer orçamento", fn: function () { startFlow(null, false, "casa"); } },
    { label: "Tipos de película", fn: function () { reply("servicos"); } },
    { label: "Vão até o local?", fn: function () { reply("casa"); } },
    { label: "Escurece a casa?", fn: function () { reply("escuro"); } },
    { label: "Onde fica?", fn: function () { reply("local"); } },
    { label: "🚗 Película para carro", fn: function () { reply("carro"); } },
    { label: "Falar com atendente", fn: function () { reply("humano"); } }
  ] : [
    { label: "💬 Fazer orçamento", fn: function () { startFlow(); } },
    { label: "Quais serviços?", fn: function () { reply("servicos"); } },
    { label: "🏠 Película residencial", fn: function () { reply("resid"); } },
    { label: "Atendem em casa?", fn: function () { reply("casa"); } },
    { label: "Onde fica?", fn: function () { reply("local"); } },
    { label: "Película Windowblue", fn: function () { reply("pelicula"); } },
    { label: "Garantia", fn: function () { reply("garantia"); } },
    { label: "Falar com atendente", fn: function () { reply("humano"); } }
  ];
  function listOf(arr) { return "<ul>" + arr.map(function (s) { return "<li>" + s.name + "</li>"; }).join("") + "</ul>"; }
  var RES_MSG = "Olá! Vim pelo site da Master Soud e quero um orçamento de insulfilm residencial.";

  var R = {
    oi: function () { return MODE === "casa"
      ? "Oi! 😄 Eu sou o assistente da <b>Master Soud</b>. Posso montar seu orçamento de <b>película para casa ou empresa</b> ou tirar dúvidas rápidas. O que você precisa?"
      : "Oi! 😄 Eu sou o assistente da <b>Master Soud</b>. Posso montar seu orçamento ou tirar dúvidas rápidas, para o <b>carro</b> ou para a <b>sua casa</b>. O que você precisa?"; },
    servicos: function () { return MODE === "casa"
      ? "Para casas e empresas temos estes tipos de película:" + listOf(RES_SERVICES) + "Aplicamos em janelas, portas de vidro, sacadas, box, divisórias, vitrines e fachadas. Quer orçar?"
      : "Para o carro fazemos <b>17 serviços</b>:" + listOf(SERVICES) + "E também <b>insulfilm residencial e comercial</b> 🏠. Quer orçar algum?"; },
    casa: function () { return MODE === "casa"
      ? "Sim! 🏠 Vamos até o local para <b>medir, mostrar as amostras e aplicar</b>, em Aparecida de Goiânia e região, com horário marcado."
      : "Sim! 🏠 Fazemos <b>atendimento domiciliar</b> em Aparecida de Goiânia e região, com horário marcado. Me fala o serviço que já monto seu pedido."; },
    local: function () { return "📍 Ficamos na <b>Rua Jamunda com Itu, Vila Brasília</b>, Aparecida de Goiânia – GO (CEP 74905-430). Também vamos até você."; },
    pelicula: function () { return MODE === "casa"
      ? "Trabalhamos com películas de <b>controle solar, privacidade (espelhada), jateada, segurança e proteção UV</b>, e somos aplicadores autorizados <b>Windowblue</b>. Levamos amostras para você escolher no seu vidro. Quer um orçamento?"
      : "Somos <b>aplicadores autorizados Windowblue e Window Premium</b>. A Windowblue incolor no para-brisa tem bloqueio térmico de <b>90%</b> e de <b>80% dos raios UV</b>. Também temos a película profissional <b>G20</b>, com 4 anos de garantia. Quer um orçamento para o seu carro?"; },
    garantia: function () { return MODE === "casa"
      ? "A garantia depende da película escolhida. A equipe te passa os detalhes junto com o orçamento."
      : "A garantia depende da película. A <b>G20</b> tem <b>4 anos de garantia</b>. Nas outras, a equipe te passa os detalhes no orçamento."; },
    preco: function (k) { return (k || MODE) === "casa"
      ? "O valor depende da <b>metragem dos vidros</b> e do tipo de película. Vou montar seu pedido pra equipe te passar uma estimativa. 👇"
      : "O valor depende do serviço e do modelo do carro. Vou montar seu pedido rapidinho pra equipe te passar o preço certinho. 👇"; },
    escuro: function () { return "Depende da película: tem opção <b>bem clara</b>, focada em calor e UV, e opções mais escuras ou espelhadas para privacidade. Levamos amostras pra você ver no seu vidro antes de decidir. 😉"; },
    resid: function () { return "Sim! 🏠 Também aplicamos <b>insulfilm em casas, apartamentos e comércios</b>: controle solar, privacidade, jateado, segurança e proteção UV. <br><a href=\"residencial.html\" style=\"color:var(--brand2);text-decoration:underline\">Ver a página de residências</a>"; },
    carro: function () { return "Fazemos sim! 🚗 Insulfilm Windowblue e Window Premium, capa de volante, som, multimídia, alarme, elétrica e mais. <br><a href=\"/\" style=\"color:var(--brand2);text-decoration:underline\">Ver a parte de veículos</a>"; },
    horario: function () { return "Trabalhamos com <b>horário marcado</b>, na loja ou no local. Chama no WhatsApp que a equipe vê o melhor horário pra você." + waBtn("Olá! Vim pelo site e quero agendar um horário.", "Agendar no WhatsApp"); },
    pagamento: function () { return "As formas de pagamento são combinadas direto com a equipe no WhatsApp." + waBtn("Olá! Vim pelo site e queria saber as formas de pagamento.", "Perguntar no WhatsApp"); },
    volante: function () { return "Nossa <b>capa de volante é costurada à mão</b>: protege o volante original e recupera o que já está gasto. Quer ver os modelos pro seu carro?"; },
    humano: function () { return "Claro! A equipe responde rapidinho no WhatsApp. 👇" + waBtn(MODE === "casa" ? RES_MSG : (C.whatsappDefaultMsg || "Olá! Vim pelo site."), "Falar com a equipe"); },
    obrigado: function () { return "Nada! Qualquer coisa é só chamar. 🤙"; },
    fallback: function () { return "Hmm, essa eu não sei responder por aqui. 😅 Mas a equipe responde rapidinho no WhatsApp:" + waBtn(MODE === "casa" ? RES_MSG : (C.whatsappDefaultMsg || "Olá! Vim pelo site."), "Perguntar à equipe"); }
  };
  var SVC_KEYS = [
    [/insul|pel[ií]cul|film|window|g20|escur|fum[eê]/, "Insulfilm"],
    [/volant|capa/, "Capa de volante costurada à mão"],
    [/plot|soleira|coluna/, "Plotagem de soleira e coluna"],
    [/limp|teto|higien/, "Limpeza de teto e limpeza interna completa"],
    [/farol|polim/, "Polimento de farol"],
    [/\bsom\b|alto.?falante|subwoofer|caixa|m[oó]dulo/, "Som automotivo"],
    [/multim[ií]d|central|tela|android|carplay/, "Multimídia"],
    [/c[aâ]mera/, "Câmera de ré"],
    [/sensor/, "Sensor de ré"],
    [/\bled\b|l[aâ]mpad|leed/, "Lâmpadas LED"],
    [/m[aá]quina|fechadura/, "Recuperação de máquina de vidro e fechadura"],
    [/vidro el|vidro/, "Instalação de vidro elétrico"],
    [/trava/, "Instalação de trava elétrica"],
    [/alarme/, "Instalação de alarme"],
    [/bloque|antifurto|furto|roubo/, "Bloqueador antifurto"],
    [/el[eé]tric|fia[cç]|pane|bateria/, "Elétrica automotiva em geral"],
    [/acess[oó]ri|instala/, "Montagem de acessórios"]
  ];
  var RES_KEYS = [
    [/solar|calor|quente|\bsol\b|claridade|ar.?condicionado/, "Película de controle solar"],
    [/espelh|privac|ver de fora|vizinh|intimidade/, "Película espelhada / privacidade"],
    [/jatead|fosc|decor|\bbox\b|divis[oó]ria|banheiro/, "Película jateada / decorativa"],
    [/segur|estilha|quebr|anti.?vand/, "Película de segurança"],
    [/\buv\b|desbot|m[oó]ve|piso|cortina/, "Película com proteção UV"],
    [/comerci|fachad|vitrine|escrit|loja|empresa|consult/, "Película comercial / fachada"]
  ];
  function norm(t) { return (t || "").toLowerCase(); }
  function findIn(keys, t) { for (var i = 0; i < keys.length; i++) if (keys[i][0].test(t)) return keys[i][1]; return null; }
  function findSvc(t, kind) { return (kind || MODE) === "casa" ? findIn(RES_KEYS, t) : findIn(SVC_KEYS, t); }

  function reply(key) { bot(R[key]()); afterReply(key); }
  function afterReply(key) {
    var orc = { label: "💬 Sim, fazer orçamento", fn: null };
    if (key === "resid") { orc.label = "💬 Orçar película residencial"; orc.fn = function () { startFlow(null, false, "casa"); }; }
    else if (key === "carro") { orc.label = "💬 Orçar para o carro"; orc.fn = function () { startFlow(null, false, "carro"); }; }
    else if (["pelicula", "volante", "casa", "preco", "garantia", "servicos", "escuro"].indexOf(key) > -1) {
      orc.fn = function () { startFlow(MODE === "casa" ? null : (key === "pelicula" || key === "garantia" ? "Insulfilm" : key === "volante" ? "Capa de volante costurada à mão" : null)); };
    }
    if (orc.fn) setTimeout(function () { chips([orc].concat(MAIN.slice(1))); }, 700);
    else chips(MAIN);
  }

  function answer(text) {
    var t = norm(text);
    if (flow) return flowInput(text);
    if (/^(oi|ol[aá]|e a[ií]|opa|bom dia|boa tarde|boa noite|salve)\b/.test(t) && t.length < 25) return reply("oi");
    if (/obrigad|valeu|vlw|tmj/.test(t)) return reply("obrigado");
    if (/atendente|humano|pessoa|falar com|whats|zap/.test(t)) return reply("humano");
    var wantsRes = RES_RE.test(t) && !CAR_RE.test(t);
    var wantsCar = CAR_RE.test(t) && !RES_RE.test(t);
    if (/pre[cç]o|valor|quanto|custa|or[cç]a/.test(t)) {
      var kind = wantsRes ? "casa" : wantsCar ? "carro" : MODE;
      var s = findSvc(t, kind) || (kind === "casa" ? "Insulfilm residencial (tipo a definir)" : null); bot(R.preco(kind)); return setTimeout(function () { startFlow(s, true, kind); }, 700);
    }
    if (MODE === "carro" && wantsRes) return reply("resid");
    if (MODE === "casa" && wantsCar) return reply("carro");
    if (MODE === "casa" ? /domic|vem at|vai at|v[aã]o at|visita|medi[cç]|no local/.test(t) : /casa|domic|busca|vem at|vai at|vcs v[aã]o|voc[eê]s v[aã]o/.test(t)) return reply("casa");
    if (/onde|endere|localiza|fica\b|mapa/.test(t)) return reply("local");
    if (/hor[aá]rio|abre|fecha|funciona|agenda|hoje|amanh|s[aá]bado|domingo/.test(t)) return reply("horario");
    if (/garant/.test(t)) return reply("garantia");
    if (/pix|cart[aã]o|parcel|pagamento|pagar|dinheiro/.test(t)) return reply("pagamento");
    if (MODE === "casa" && /escur|escurece|transparen|claro/.test(t)) return reply("escuro");
    if (/servi[cç]o|o que (voc[eê]s )?faz|fazem o qu|trabalham com|tipos? de/.test(t)) return reply("servicos");
    if (MODE === "carro" && /volant|capa/.test(t)) return reply("volante");
    var svc = findSvc(t);
    if (MODE === "casa" && svc) { bot("Temos sim: <b>" + svc + "</b>! ✅ Quer que eu monte seu pedido de orçamento?"); return chips([{ label: "💬 Sim, fazer orçamento", fn: function () { startFlow(svc, false, "casa"); } }].concat(MAIN.slice(1))); }
    if (/insul|pel[ií]cul|film|window|g20|calor|\buv\b|escur/.test(t)) return reply("pelicula");
    if (svc) { bot("Sim, fazemos <b>" + svc + "</b>! ✅ Quer que eu monte seu pedido de orçamento?"); return chips([{ label: "💬 Sim, orçar " + svc.split(" ")[0].toLowerCase(), fn: function () { startFlow(svc); } }].concat(MAIN.slice(1))); }
    bot(R.fallback()); chips(MAIN);
  }

  /* fluxo de orçamento: serviço -> carro/imóvel -> onde -> nome -> WhatsApp */
  function startFlow(svc, quiet, kind) {
    kind = kind || (svc && RES_SVCS.indexOf(svc) > -1 ? "casa" : MODE);
    flow = { svc: svc || null, step: svc ? "car" : "svc", kind: kind };
    track("trackCustom", "ChatOrcamentoInicio", { content_name: svc || "", content_category: kind });
    if (!svc) {
      bot(kind === "casa" ? "Qual tipo de película você procura? Se não souber, tudo bem: toque em <b>Não sei ainda</b>. 👇" : "Qual serviço você precisa? Pode tocar numa opção ou escrever. 👇");
      var list = kind === "casa" ? RES_SERVICES.concat([{ name: "Não sei ainda", svc: "Insulfilm residencial (quero ajuda para escolher)" }]) : SERVICES;
      chips(list.map(function (s) { return { label: s.name, fn: function () { flow.svc = s.svc; flow.step = "car"; askCar(); } }; }));
    } else { if (!quiet) bot("Show! <b>" + svc + "</b> então."); askCar(); }
  }
  function askCar() {
    setTimeout(function () {
      bot(flow.kind === "casa"
        ? "Qual o <b>tipo de imóvel</b> e <b>quantos vidros</b>? (ex.: casa, 4 janelas e 1 porta de vidro) Se tiver as medidas, melhor ainda!"
        : "Qual é o <b>modelo e o ano</b> do carro? (ex.: Onix 2020)");
      quick.innerHTML = ""; input.focus({ preventScroll: true });
    }, 300);
  }
  function flowInput(text) {
    if (flow.step === "svc") { flow.svc = findSvc(norm(text), flow.kind) || text; flow.step = "car"; return askCar(); }
    if (flow.step === "car") {
      flow.car = text;
      if (flow.kind === "casa") { flow.where = "no local (medição e aplicação)"; return askName(); }
      flow.step = "where";
      bot("Perfeito. Prefere fazer <b>aqui na loja</b> ou <b>na sua casa</b>?");
      return chips([{ label: "Na loja", fn: function () { flow.where = "na loja"; askName(); } }, { label: "Na minha casa", fn: function () { flow.where = "em domicílio"; askName(); } }, { label: "Tanto faz", fn: function () { flow.where = "onde for melhor"; askName(); } }]);
    }
    if (flow.step === "where") { flow.where = text; return askName(); }
    if (flow.step === "name") { flow.name = text; return finish(); }
  }
  function askName() {
    flow.step = "name";
    bot(flow.kind === "casa" ? "Anotado! Qual é o seu <b>nome</b> e o <b>bairro</b>?" : "Pra finalizar: qual é o seu <b>nome</b>?");
    chips([{ label: "Prefiro não dizer", fn: function () { flow.name = ""; finish(); } }]);
  }
  function finish() {
    var casa = flow.kind === "casa";
    var msg = "Olá! Vim pelo site da Master Soud." + (flow.name ? " Sou " + flow.name + "." : "") +
      "\n\n*Orçamento " + (casa ? "residencial/comercial" : "automotivo") + "*\n• Serviço: " + flow.svc +
      "\n• " + (casa ? "Imóvel/vidros: " : "Carro: ") + flow.car + "\n• Local: " + flow.where +
      (casa ? "\n\n(Posso mandar fotos dos vidros por aqui.)" : "");
    var summary = "Pronto" + (flow.name ? ", " + esc(flow.name.split(/[ ,]/)[0]) : "") + "! ✅ Seu pedido:<ul><li><b>" + esc(flow.svc) + "</b></li><li>" + esc(flow.car) + "</li><li>" + esc(flow.where) + "</li></ul>" +
      (casa ? "Toque abaixo pra enviar no WhatsApp. Se puder, mande <b>fotos dos vidros</b> por lá. 📸" : "Toque abaixo pra enviar no WhatsApp. A equipe responde rapidinho.") + waBtn(msg, "Enviar pedido no WhatsApp", true);
    bot(summary, 900);
    var done = flow; flow = null;
    setTimeout(function () { chips(MAIN); }, 1000);
    return done;
  }
  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); var v = input.value.trim(); if (!v) return;
    input.value = ""; me(v); answer(v);
  });

  function openChat() {
    chat.classList.add("open"); chat.setAttribute("aria-hidden", "false"); btn.setAttribute("aria-expanded", "true"); btn.classList.add("seen");
    bubble.classList.remove("show"); store("ms_chat_seen", "1");
    if (!started) { started = true; bot(R.oi(), 400); setTimeout(function () { chips(MAIN); }, 500); track("trackCustom", "ChatAberto", {}); }
    if (window.matchMedia("(min-width:821px)").matches) setTimeout(function () { input.focus({ preventScroll: true }); }, 350);
  }
  function closeChat() { chat.classList.remove("open"); chat.setAttribute("aria-hidden", "true"); btn.setAttribute("aria-expanded", "false"); }
  window.openChat = openChat;
  btn.addEventListener("click", function () { chat.classList.contains("open") ? closeChat() : openChat(); });
  $("#chatClose").addEventListener("click", closeChat);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeChat(); });
  bubble.addEventListener("click", function (e) { if (e.target.id === "bubbleClose") { bubble.classList.remove("show"); return; } openChat(); });
  if (!store("ms_chat_seen")) setTimeout(function () { if (!chat.classList.contains("open")) bubble.classList.add("show"); }, 5000);
})();
