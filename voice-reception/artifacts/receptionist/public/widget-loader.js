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
    ? new URL(document.currentScript.src).origin + new URL(document.currentScript.src).pathname.replace(/\/widget-loader\.js$/, "")
    : window.location.origin;

  // Detect the page's active language from the <html lang="…"> attribute,
  // falling back to the browser's navigator.language.
  var _pageLang = (document.documentElement.lang || navigator.language || "en")
    .split("-")[0].toLowerCase();
  var WIDGET_URL = WIDGET_ORIGIN + "/embed?lang=" + encodeURIComponent(_pageLang);

  // Keep WIDGET_URL in sync when the website's i18n system updates <html lang="…">
  (new MutationObserver(function () {
    var newLang = (document.documentElement.lang || navigator.language || "en")
      .split("-")[0].toLowerCase();
    if (newLang !== _pageLang) {
      _pageLang = newLang;
      WIDGET_URL = WIDGET_ORIGIN + "/embed?lang=" + encodeURIComponent(_pageLang);
    }
  })).observe(document.documentElement, { attributeFilter: ["lang"] });

  var PRIMARY      = "#16a34a";  // green-600
  var PRIMARY_DARK = "#15803d";  // green-700
  var RED          = "#dc2626";  // red-600 — active call
  var RED_DARK     = "#b91c1c";  // red-700
  var RADIUS = 60;

  // --- Styles ---
  var style = document.createElement("style");
  style.textContent = [
    "#devocean-widget-btn {",
    "  position: fixed;",
    "  bottom: 28px;",
    "  right: 28px;",
    "  width: " + RADIUS + "px;",
    "  height: " + RADIUS + "px;",
    "  border-radius: 50%;",
    "  background: " + PRIMARY + ";",
    "  box-shadow: 0 4px 20px rgba(22,163,74,0.40);",
    "  border: none;",
    "  cursor: pointer;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  z-index: 2147483647;",
    "  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;",
    "  outline: none;",
    "}",
    "#devocean-widget-btn:hover {",
    "  background: var(--devocean-btn-hover, " + PRIMARY_DARK + ");",
    "  transform: scale(1.07);",
    "}",
    "#devocean-widget-btn:active { transform: scale(0.97); }",
    "#devocean-widget-btn.call-active {",
    "  background: " + RED + " !important;",
    "  box-shadow: 0 4px 20px rgba(220,38,38,0.45) !important;",
    "  --devocean-btn-hover: " + RED_DARK + ";",
    "}",
    "#devocean-widget-icon {",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "}",
    /* iframe is invisible — only exists for audio + postMessage */
    "#devocean-widget-frame {",
    "  position: fixed;",
    "  width: 1px;",
    "  height: 1px;",
    "  bottom: 0;",
    "  right: 0;",
    "  border: none;",
    "  opacity: 0;",
    "  pointer-events: none;",
    "}",
    "@keyframes devocean-ring {",
    "  0%, 22%, 100% { transform: rotate(0deg); }",
    "  3%  { transform: rotate(-22deg); }",
    "  6%  { transform: rotate(22deg); }",
    "  9%  { transform: rotate(-22deg); }",
    "  12% { transform: rotate(22deg); }",
    "  15% { transform: rotate(-14deg); }",
    "  18% { transform: rotate(14deg); }",
    "  20% { transform: rotate(-6deg); }",
    "}",
    "@keyframes devocean-pulse {",
    "  0%   { box-shadow: 0 4px 20px rgba(22,163,74,0.40), 0 0 0 0 rgba(22,163,74,0.55); }",
    "  70%  { box-shadow: 0 4px 20px rgba(22,163,74,0.40), 0 0 0 18px rgba(22,163,74,0); }",
    "  100% { box-shadow: 0 4px 20px rgba(22,163,74,0.40), 0 0 0 0 rgba(22,163,74,0); }",
    "}",
    "#devocean-widget-btn.ringing #devocean-widget-icon {",
    "  animation: devocean-ring 4s ease-in-out infinite;",
    "}",
    "#devocean-widget-btn.attention { animation: devocean-pulse 1.7s ease-out 2; }",
    "@media (prefers-reduced-motion: reduce) {",
    "  #devocean-widget-btn.ringing #devocean-widget-icon { animation: none; }",
    "  #devocean-widget-btn.attention { animation: none; }",
    "}",
  ].join("\n");
  document.head.appendChild(style);

  // --- Icons ---
  var PHONE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24" fill="#fff"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';
  var HANGUP_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"/></svg>';

  // --- Elements ---
  var frame = document.createElement("iframe");
  frame.id = "devocean-widget-frame";
  frame.allow = "microphone";
  frame.title = "Talk to DEVOCEAN";
  document.body.appendChild(frame);

  var btn = document.createElement("button");
  btn.id = "devocean-widget-btn";
  btn.setAttribute("aria-label", "Talk to DEVOCEAN receptionist");

  var iconSpan = document.createElement("span");
  iconSpan.id = "devocean-widget-icon";
  iconSpan.innerHTML = PHONE_SVG;
  btn.appendChild(iconSpan);
  document.body.appendChild(btn);

  var open = false;

  function stopRinging() {
    btn.classList.remove("ringing");
  }

  function sendConnect() {
    // Always pass the current page lang so the WebSocket uses the live value,
    // regardless of what lang was baked into the iframe URL at load time.
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "devocean:connect", lang: _pageLang }, "*");
    }
  }

  function openWidget() {
    if (open) return;
    open = true;
    stopRinging();
    btn.classList.add("call-active");
    btn.classList.remove("ringing");
    iconSpan.innerHTML = HANGUP_SVG;
    btn.setAttribute("aria-label", "End call");

    if (!frame.src) {
      // Pre-warm hasn't fired yet (very early click); load now and connect on ready.
      frame.onload = function () {
        frame.onload = null;
        sendConnect();
      };
      frame.src = WIDGET_URL;
    } else {
      // Iframe already pre-warmed or from a previous call — connect immediately.
      sendConnect();
    }
  }

  function closeWidget() {
    if (!open) return;
    open = false;
    btn.classList.remove("call-active");
    iconSpan.innerHTML = PHONE_SVG;
    btn.setAttribute("aria-label", "Talk to DEVOCEAN receptionist");
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "devocean:disconnect" }, "*");
    }
    // Keep frame.src set — the React app stays mounted so the next call only
    // pays for the WebSocket handshake, not a full iframe reload.
  }

  // Messages from the iframe embed
  window.addEventListener("message", function (evt) {
    if (!evt.data || typeof evt.data !== "object") return;
    var type = evt.data.type;
    if (type === "devocean:embedReady") {
      if (open) sendConnect();
    }
    if (type === "devocean:callEnded") {
      closeWidget();
    }
  });

  btn.addEventListener("click", function () {
    open ? closeWidget() : openWidget();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) closeWidget();
  });

  // Pre-warm: load the embed iframe early so the React app + audio plumbing
  // are ready before the user clicks. Only the WebSocket handshake is cold.
  // 2 s delay keeps this off the critical path for page LCP.
  setTimeout(function () {
    if (!frame.src) frame.src = WIDGET_URL;
  }, 2000);

  // Start ringing after a short delay to draw attention to the button.
  setTimeout(function () {
    btn.classList.add("ringing");
  }, 4000);
})();
