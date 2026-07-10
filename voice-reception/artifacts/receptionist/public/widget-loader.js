(function () {
  "use strict";

  // Do not inject the widget on booking / checkout / confirmation pages.
  var _path = window.location.pathname;
  if (
    _path.startsWith("/book-direct") ||
    _path.startsWith("/booking-confirmed") ||
    _path.startsWith("/canceled")
  ) {
    return;
  }

  var WIDGET_ORIGIN = document.currentScript
    ? new URL(document.currentScript.src).origin +
      new URL(document.currentScript.src).pathname.replace(
        /\/widget-loader\.js$/,
        ""
      )
    : window.location.origin;

  // Detect active language from <html lang="…">, fall back to navigator.
  var _pageLang = (document.documentElement.lang || navigator.language || "en")
    .split("-")[0]
    .toLowerCase();

  new MutationObserver(function () {
    var newLang = (document.documentElement.lang || navigator.language || "en")
      .split("-")[0]
      .toLowerCase();
    if (newLang !== _pageLang) {
      _pageLang = newLang;
      if (state === "text") {
        // Panel is currently open — reload it immediately with the new lang.
        textFrame.src = WIDGET_ORIGIN + "/embed-text?lang=" + encodeURIComponent(_pageLang);
      } else {
        // Panel is closed — blank it so the next open reloads with the new lang.
        textFrame.src = "";
      }
      // Reload voice frame with new lang unless a call is active.
      if (state !== "voice") {
        voiceFrame.src = WIDGET_ORIGIN + "/embed?lang=" + encodeURIComponent(_pageLang);
      }
    }
  }).observe(document.documentElement, { attributeFilter: ["lang"] });

  // --- Colours ---
  var ORANGE      = "#f97316";
  var ORANGE_DARK = "#ea580c";
  var GREEN       = "#16a34a";
  var GREEN_DARK  = "#15803d";
  var RED         = "#dc2626";
  var RED_DARK    = "#b91c1c";

  var BTN_R   = 56;   // diameter — all three buttons are the same size
  var MARGIN  = 20;   // distance from screen edges
  var GAP     = 10;   // gap between stacked buttons
  var PANEL_W = 360;  // text-chat panel width
  var PANEL_H = 480;  // text-chat panel height

  // --- Styles ---
  var style = document.createElement("style");
  style.textContent =
    "#dv-fab{" +
      "position:fixed;bottom:" + MARGIN + "px;right:" + MARGIN + "px;" +
      "width:" + BTN_R + "px;height:" + BTN_R + "px;" +
      "border-radius:50%;background:" + ORANGE + ";" +
      "box-shadow:0 4px 20px rgba(249,115,22,.45);" +
      "border:none;cursor:pointer;" +
      "display:flex;align-items:center;justify-content:center;" +
      "z-index:2147483647;" +
      "transition:background .18s,transform .18s,box-shadow .18s;" +
      "outline:none;" +
    "}" +
    "#dv-fab:hover{background:" + ORANGE_DARK + ";transform:scale(1.07);}" +
    "#dv-fab:active{transform:scale(0.96);}" +
    "#dv-fab.dv-voice-active{" +
      "background:" + RED + "!important;" +
      "box-shadow:0 4px 20px rgba(220,38,38,.45)!important;" +
    "}" +
    "#dv-fab.dv-voice-active:hover{background:" + RED_DARK + "!important;}" +

    ".dv-opt{" +
      "position:fixed;right:" + MARGIN + "px;" +
      "width:" + BTN_R + "px;height:" + BTN_R + "px;" +
      "border-radius:50%;border:none;cursor:pointer;" +
      "display:flex;align-items:center;justify-content:center;" +
      "z-index:2147483646;" +
      "opacity:0;transform:translateY(14px);pointer-events:none;" +
      "transition:opacity .22s,transform .22s,filter .15s;" +
    "}" +
    ".dv-opt.dv-vis{opacity:1;transform:translateY(0);pointer-events:auto;}" +
    ".dv-opt:hover{filter:brightness(1.12);}" +
    ".dv-opt:active{transform:scale(0.93)!important;}" +

    "#dv-backdrop{position:fixed;inset:0;z-index:2147483644;display:none;}" +
    "#dv-backdrop.dv-vis{display:block;}" +

    "#dv-text-panel{" +
      "position:fixed;" +
      "bottom:" + (MARGIN + BTN_R + 12) + "px;" +
      "right:" + MARGIN + "px;" +
      "width:" + PANEL_W + "px;height:" + PANEL_H + "px;" +
      "border:none;border-radius:16px;" +
      "box-shadow:0 8px 40px rgba(0,0,0,.18);" +
      "z-index:2147483645;" +
      "opacity:0;transform:scale(.96) translateY(8px);" +
      "transform-origin:bottom right;" +
      "transition:opacity .2s,transform .2s;" +
      "pointer-events:none;" +
    "}" +
    "#dv-text-panel.dv-vis{opacity:1;transform:scale(1) translateY(0);pointer-events:auto;}" +

    "#dv-voice-frame{" +
      "position:fixed;width:1px;height:1px;bottom:0;right:0;" +
      "border:none;opacity:0;pointer-events:none;" +
    "}" +

    "@media(max-width:420px){" +
      "#dv-text-panel{width:calc(100vw - " + (MARGIN * 2) + "px);right:" + MARGIN + "px;}" +
    "}" +
    "@media(max-height:560px){" +
      "#dv-text-panel{height:75vh;}" +
    "}" +

    "@keyframes dv-pulse{" +
      "0%{box-shadow:0 4px 20px rgba(249,115,22,.45),0 0 0 0 rgba(249,115,22,.55)}" +
      "70%{box-shadow:0 4px 20px rgba(249,115,22,.45),0 0 0 18px rgba(249,115,22,0)}" +
      "100%{box-shadow:0 4px 20px rgba(249,115,22,.45),0 0 0 0 rgba(249,115,22,0)}" +
    "}" +
    "#dv-fab.dv-attention{animation:dv-pulse 1.7s ease-out 2;}" +

    "@media(prefers-reduced-motion:reduce){" +
      "#dv-fab,.dv-opt,#dv-text-panel{transition:none!important;animation:none!important;}" +
    "}";

  document.head.appendChild(style);

  // --- DOM helpers ---
  function mk(tag, id, attrs) {
    var e = document.createElement(tag);
    if (id) e.id = id;
    if (attrs) {
      for (var k in attrs) {
        if (k === "className") e.className = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
    }
    document.body.appendChild(e);
    return e;
  }

  // Main FAB
  var fab = mk("button", "dv-fab", { type: "button", "aria-label": "Chat with Marin" });

  // Backdrop (closes expanded state on outside click)
  var backdrop = mk("div", "dv-backdrop");

  // Text option button
  var textBtn = mk("button", null, { type: "button", className: "dv-opt", "aria-label": "Text chat with Marin" });
  textBtn.style.background = ORANGE;
  textBtn.innerHTML = iconMsg(24);

  // Voice option button
  var voiceBtn = mk("button", null, { type: "button", className: "dv-opt", "aria-label": "Voice call with Marin" });
  voiceBtn.style.background = GREEN;
  voiceBtn.innerHTML = iconPhone(24);

  // Text chat iframe (visible panel)
  var textFrame = mk("iframe", "dv-text-panel");
  textFrame.setAttribute("allow", "");

  // Voice audio iframe (invisible — audio + postMessage only)
  var voiceFrame = mk("iframe", "dv-voice-frame");
  voiceFrame.setAttribute("allow", "microphone");

  // --- Position option buttons above the FAB ---
  function placeOptions() {
    var textBottom  = MARGIN + BTN_R + GAP;
    var voiceBottom = textBottom + BTN_R + GAP;

    textBtn.style.bottom  = textBottom  + "px";
    voiceBtn.style.bottom = voiceBottom + "px";
  }
  placeOptions();

  // --- State machine ---
  // States: "idle" | "expanded" | "text" | "voice"
  var state = "idle";

  function setState(next) {
    state = next;
    var isExpanded = next === "expanded";
    var isText     = next === "text";
    var isVoice    = next === "voice";

    // FAB icon + colour
    fab.classList.toggle("dv-voice-active", isVoice);
    fab.style.removeProperty("background");
    if (isVoice) {
      fab.innerHTML = iconPhoneOff(24);
    } else if (isExpanded || isText) {
      fab.innerHTML = iconClose(24);
    } else {
      fab.innerHTML = iconMsg(24);
    }

    // Option fan-out
    var vis = isExpanded;
    textBtn.classList.toggle("dv-vis", vis);
    voiceBtn.classList.toggle("dv-vis", vis);
    backdrop.classList.toggle("dv-vis", isExpanded);

    // Text chat panel
    textFrame.classList.toggle("dv-vis", isText);
    if (isText && !textFrame.src) {
      textFrame.src = WIDGET_ORIGIN + "/embed-text?lang=" + encodeURIComponent(_pageLang);
    }
  }

  // --- FAB click ---
  fab.addEventListener("click", function () {
    if (state === "idle")          { setState("expanded"); }
    else if (state === "expanded") { setState("idle"); }
    else if (state === "text")     { setState("idle"); }
    else if (state === "voice")    { endVoiceCall(); }
  });

  // --- Option clicks ---
  textBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    setState("text");
  });

  voiceBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    setState("voice");
    if (!voiceFrame.src) {
      voiceFrame.src = WIDGET_ORIGIN + "/embed?lang=" + encodeURIComponent(_pageLang);
    } else {
      postToVoice("devocean:connect");
    }
  });

  // Outside click collapses expanded menu
  backdrop.addEventListener("click", function () {
    if (state === "expanded") setState("idle");
  });

  // Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (state === "expanded")   setState("idle");
    else if (state === "text")  setState("idle");
    else if (state === "voice") endVoiceCall();
  });

  function endVoiceCall() {
    postToVoice("devocean:disconnect");
    setState("idle");
  }

  function postToVoice(type) {
    try { voiceFrame.contentWindow.postMessage({ type: type }, WIDGET_ORIGIN); } catch (_) {}
  }

  // Messages from the voice iframe
  window.addEventListener("message", function (evt) {
    if (!evt.data || typeof evt.data !== "object") return;
    if (evt.data.type === "devocean:embedReady" && state === "voice") {
      postToVoice("devocean:connect");
    }
    if (evt.data.type === "devocean:callEnded" && state === "voice") {
      setState("idle");
    }
  });

  // Pre-warm voice iframe (off critical path — 2 s delay)
  setTimeout(function () {
    if (!voiceFrame.src) {
      voiceFrame.src = WIDGET_ORIGIN + "/embed?lang=" + encodeURIComponent(_pageLang);
    }
  }, 2000);

  // Pulse FAB after a few seconds to draw attention
  setTimeout(function () {
    if (state === "idle") fab.classList.add("dv-attention");
  }, 4000);

  // Auto-open voice if ?talk is in the URL (e.g. WhatsApp deep-link)
  if (new URLSearchParams(window.location.search).has("talk")) {
    setTimeout(function () { voiceBtn.click(); }, 1000);
  }

  // Initial render
  setState("idle");

  // --- SVG icon factories ---
  function svg(size, content) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg"' +
      ' width="' + size + '" height="' + size + '"' +
      ' viewBox="0 0 24 24"' +
      ' fill="none" stroke="white"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      content + "</svg>"
    );
  }
  function iconMsg(s) {
    return svg(s, '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>');
  }
  function iconPhone(s) {
    return svg(s,
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07' +
      ' A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.44' +
      ' 2 2 0 0 1 3.59 2.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81' +
      ' 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.91-.91' +
      ' a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>'
    );
  }
  function iconPhoneOff(s) {
    return svg(s,
      '<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45' +
      ' c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2' +
      ' 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67' +
      ' m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3' +
      ' a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81' +
      ' 2 2 0 0 1-.45 2.11L8.09 9.91"/>' +
      '<line x1="23" y1="1" x2="1" y2="23"/>'
    );
  }
  function iconClose(s) {
    return svg(s,
      '<line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/>'
    );
  }
})();
