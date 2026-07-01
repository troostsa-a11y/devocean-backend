(function () {
  "use strict";

  // Do not inject the widget on booking / checkout / confirmation pages.
  var _path = window.location.pathname;
  if (
    _path.startsWith("/book-direct") ||
    _path.startsWith("/booking-confirmed") ||
    _path.startsWith("/canceled") ||
    _path === "/talk" ||
    _path.startsWith("/talk/")
  ) {
    return;
  }

  var WIDGET_ORIGIN = document.currentScript
    ? new URL(document.currentScript.src).origin + new URL(document.currentScript.src).pathname.replace(/\/widget-loader\.js$/, "")
    : window.location.origin;

  var WIDGET_URL = WIDGET_ORIGIN + "/embed";

  var PRIMARY      = "#16a34a";  // green-600
  var PRIMARY_DARK = "#15803d";  // green-700
  var RED          = "#dc2626";  // red-600 — active call
  var RED_DARK     = "#b91c1c";  // red-700
  var RADIUS = 60;
  var CALLOUT_TEXT = "Do you need help?\nTalk to Mia our AI receptionist.\nShe speaks your language.";

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
    "  z-index: 2147483646;",
    "  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;",
    "  outline: none;",
    "}",
    "#devocean-widget-btn:hover {",
    "  background: var(--devocean-btn-hover, " + PRIMARY_DARK + ");",
    "  transform: scale(1.07);",
    "}",
    "#devocean-widget-btn:active { transform: scale(0.97); }",
    "#devocean-widget-btn.open { z-index: 2147483647; }",
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
    "#devocean-widget-frame {",
    "  position: fixed;",
    "  bottom: 100px;",
    "  right: 28px;",
    "  width: 300px;",
    "  height: 220px;",
    "  border: none;",
    "  border-radius: 20px;",
    "  box-shadow: 0 12px 40px rgba(30,18,8,0.18);",
    "  z-index: 2147483647;",
    "  opacity: 0;",
    "  pointer-events: none;",
    "  transform: translateY(12px) scale(0.97);",
    "  transition: opacity 0.22s, transform 0.22s;",
    "  background: #faf7f4;",
    "}",
    "#devocean-widget-frame.open {",
    "  opacity: 1;",
    "  pointer-events: auto;",
    "  transform: translateY(0) scale(1);",
    "}",
    "@media (max-width: 480px) {",
    "  #devocean-widget-frame {",
    "    bottom: 16px !important; right: 12px !important; left: 12px !important;",
    "    width: auto !important; height: 240px !important;",
    "    border-radius: 20px !important;",
    "  }",
    "  #devocean-widget-btn.open {",
    "    bottom: 272px !important; top: auto !important; right: 16px !important;",
    "  }",
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
    "#devocean-widget-callout {",
    "  position: fixed;",
    "  bottom: 44px;",
    "  right: 100px;",
    "  max-width: 250px;",
    "  background: #ffffff;",
    "  color: #3a2a1a;",
    "  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;",
    "  font-size: 14px;",
    "  line-height: 1.45;",
    "  text-align: center;",
    "  white-space: pre-line;",
    "  padding: 20px 18px 14px;",
    "  border-radius: 14px;",
    "  box-shadow: 0 10px 32px rgba(30,18,8,0.20);",
    "  z-index: 2147483646;",
    "  opacity: 0;",
    "  transform: translateY(8px) scale(0.96);",
    "  transform-origin: bottom right;",
    "  transition: opacity 0.28s ease, transform 0.28s ease;",
    "  pointer-events: none;",
    "}",
    "#devocean-widget-callout.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }",
    "#devocean-widget-callout::after {",
    "  content: '';",
    "  position: absolute;",
    "  bottom: 14px;",
    "  right: -7px;",
    "  width: 14px;",
    "  height: 14px;",
    "  background: #ffffff;",
    "  transform: rotate(45deg);",
    "  border-radius: 2px;",
    "  box-shadow: 3px -3px 6px rgba(30,18,8,0.06);",
    "}",
    "#devocean-widget-callout-close {",
    "  position: absolute;",
    "  top: 7px;",
    "  right: 9px;",
    "  width: 20px;",
    "  height: 20px;",
    "  border: none;",
    "  background: transparent;",
    "  color: #b08968;",
    "  font-size: 18px;",
    "  line-height: 1;",
    "  cursor: pointer;",
    "  padding: 0;",
    "}",
    "#devocean-widget-callout-close:hover { color: " + PRIMARY_DARK + "; }",
    "@media (max-width: 480px) {",
    "  #devocean-widget-callout {",
    "    bottom: 90px;",
    "    right: 12px;",
    "    left: 12px;",
    "    max-width: none;",
    "  }",
    "  #devocean-widget-callout::after { display: none; }",
    "}",
    "@media (prefers-reduced-motion: reduce) {",
    "  #devocean-widget-btn.ringing #devocean-widget-icon { animation: none; }",
    "  #devocean-widget-btn.attention { animation: none; }",
    "}",
  ].join("\n");
  document.head.appendChild(style);

  // --- Icons ---
  var PHONE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24" fill="#fff"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';
  // Phone-slash (hang up) icon
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

  var callout = document.createElement("div");
  callout.id = "devocean-widget-callout";
  callout.setAttribute("role", "status");
  var calloutText = document.createElement("span");
  calloutText.textContent = CALLOUT_TEXT;
  var calloutClose = document.createElement("button");
  calloutClose.id = "devocean-widget-callout-close";
  calloutClose.setAttribute("aria-label", "Dismiss");
  calloutClose.innerHTML = "&times;";
  callout.appendChild(calloutText);
  callout.appendChild(calloutClose);
  document.body.appendChild(callout);

  var open = false;
  var dismissed = false;
  var iframeReady = false;
  var attentionTimer = null;
  var inviteInterval = null;

  function showCallout() {
    if (open || dismissed) return;
    callout.classList.add("show");
    if (attentionTimer) clearTimeout(attentionTimer);
    attentionTimer = setTimeout(function () {
      btn.classList.add("attention");
      setTimeout(function () { btn.classList.remove("attention"); }, 3500);
    }, 300);
  }

  function stopInviting() {
    dismissed = true;
    callout.classList.remove("show");
    btn.classList.remove("ringing");
    if (inviteInterval) { clearInterval(inviteInterval); inviteInterval = null; }
    if (attentionTimer) { clearTimeout(attentionTimer); attentionTimer = null; }
  }

  function sendConnect() {
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "devocean:connect" }, "*");
    }
  }

  function openWidget() {
    if (open) return;
    open = true;
    stopInviting();
    frame.classList.add("open");
    btn.classList.add("open", "call-active");
    btn.classList.remove("ringing");
    iconSpan.innerHTML = HANGUP_SVG;
    btn.setAttribute("aria-label", "End call");

    if (!frame.src) {
      // First open — iframe not yet loaded; send connect once it's ready
      frame.onload = function () {
        frame.onload = null;
        // iframeReady will be set when the embed posts devocean:embedReady,
        // but we also send here as a fallback (covers same-origin or if
        // the ready message races with onload).
        sendConnect();
      };
      frame.src = WIDGET_URL;
    } else {
      // Already loaded — send directly (carries user activation in Chrome)
      sendConnect();
    }
  }

  function closeWidget() {
    if (!open) return;
    open = false;
    frame.classList.remove("open");
    btn.classList.remove("open", "call-active");
    iconSpan.innerHTML = PHONE_SVG;
    btn.setAttribute("aria-label", "Talk to DEVOCEAN receptionist");
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "devocean:disconnect" }, "*");
    }
  }

  // Messages from the iframe embed
  window.addEventListener("message", function (evt) {
    if (!evt.data || typeof evt.data !== "object") return;
    var type = evt.data.type;
    if (type === "devocean:embedReady") {
      iframeReady = true;
      // If the widget was already opened before the iframe finished loading
      if (open) sendConnect();
    }
    if (type === "devocean:callEnded") {
      closeWidget();
    }
  });

  btn.addEventListener("click", function () {
    open ? closeWidget() : openWidget();
  });

  callout.addEventListener("click", function (e) {
    if (e.target === calloutClose) {
      stopInviting();
    } else {
      openWidget();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) closeWidget();
  });

  // Start ringing and show first callout after a short delay
  setTimeout(function () {
    btn.classList.add("ringing");
    showCallout();
  }, 4000);
  inviteInterval = setInterval(showCallout, 30000);
})();
