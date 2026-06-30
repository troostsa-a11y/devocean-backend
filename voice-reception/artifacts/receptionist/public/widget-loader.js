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

  var WIDGET_URL = WIDGET_ORIGIN + "/embed";

  var PRIMARY = "#b65a1a";
  var PRIMARY_DARK = "#8f4715";
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
    "  box-shadow: 0 4px 20px rgba(182,90,26,0.45);",
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
    "  background: " + PRIMARY_DARK + ";",
    "  transform: scale(1.07);",
    "  box-shadow: 0 6px 28px rgba(182,90,26,0.55);",
    "}",
    "#devocean-widget-btn:active { transform: scale(0.97); }",
    "#devocean-widget-btn.open { z-index: 2147483647; }",
    "#devocean-widget-backdrop {",
    "  position: fixed;",
    "  inset: 0;",
    "  background: rgba(30,18,8,0.45);",
    "  z-index: 2147483645;",
    "  opacity: 0;",
    "  transition: opacity 0.22s;",
    "  pointer-events: none;",
    "}",
    "#devocean-widget-backdrop.open {",
    "  opacity: 1;",
    "  pointer-events: auto;",
    "}",
    "#devocean-widget-frame {",
    "  position: fixed;",
    "  bottom: 100px;",
    "  right: 28px;",
    "  width: 340px;",
    "  height: 240px;",
    "  border: none;",
    "  border-radius: 16px;",
    "  box-shadow: 0 16px 56px rgba(30,18,8,0.22);",
    "  z-index: 2147483647;",
    "  opacity: 0;",
    "  pointer-events: none;",
    "  transform: translateY(16px) scale(0.97);",
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
    "    width: auto !important; height: 270px !important;",
    "    border-radius: 16px !important;",
    "  }",
    "  #devocean-widget-btn.open {",
    "    bottom: 302px !important; top: auto !important; right: 16px !important;",
    "  }",
    "}",
    "@keyframes devocean-pulse {",
    "  0%   { box-shadow: 0 4px 20px rgba(182,90,26,0.45), 0 0 0 0 rgba(182,90,26,0.50); }",
    "  70%  { box-shadow: 0 4px 20px rgba(182,90,26,0.45), 0 0 0 18px rgba(182,90,26,0); }",
    "  100% { box-shadow: 0 4px 20px rgba(182,90,26,0.45), 0 0 0 0 rgba(182,90,26,0); }",
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
    "#devocean-widget-callout-close:hover { color: #8f4715; }",
    "@media (max-width: 480px) { #devocean-widget-callout { display: none; } }",
    "@media (prefers-reduced-motion: reduce) { #devocean-widget-btn.attention { animation: none; } }",
  ].join("\n");
  document.head.appendChild(style);

  // --- Mic icon (inline SVG) ---
  var MIC_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/></svg>';
  var CLOSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // --- Elements ---
  var backdrop = document.createElement("div");
  backdrop.id = "devocean-widget-backdrop";
  document.body.appendChild(backdrop);

  var frame = document.createElement("iframe");
  frame.id = "devocean-widget-frame";
  frame.allow = "microphone";
  frame.title = "Talk to DEVOCEAN";
  document.body.appendChild(frame);

  var btn = document.createElement("button");
  btn.id = "devocean-widget-btn";
  btn.setAttribute("aria-label", "Talk to DEVOCEAN receptionist");
  btn.innerHTML = MIC_SVG;
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
  var dismissed = false; // user opened the widget or dismissed the invite this session
  var attentionTimer = null;
  var inviteInterval = null;

  function showCallout() {
    if (open || dismissed) return;
    callout.classList.add("show");
    btn.classList.add("attention");
    if (attentionTimer) clearTimeout(attentionTimer);
    // Remove the class after the animation so it can re-trigger next cycle.
    attentionTimer = setTimeout(function () {
      btn.classList.remove("attention");
    }, 3600);
    // Auto-hide the bubble after a few seconds; the button keeps the user's attention.
    setTimeout(function () {
      if (!open) callout.classList.remove("show");
    }, 6500);
  }

  function stopInviting() {
    dismissed = true;
    callout.classList.remove("show");
    btn.classList.remove("attention");
    if (inviteInterval) {
      clearInterval(inviteInterval);
      inviteInterval = null;
    }
  }

  function openWidget() {
    if (!frame.src) frame.src = WIDGET_URL;
    open = true;
    stopInviting();
    frame.classList.add("open");
    backdrop.classList.add("open");
    btn.classList.add("open");
    btn.innerHTML = CLOSE_SVG;
    btn.setAttribute("aria-label", "Close receptionist");
  }

  function closeWidget() {
    open = false;
    frame.classList.remove("open");
    backdrop.classList.remove("open");
    btn.classList.remove("open");
    btn.innerHTML = MIC_SVG;
    btn.setAttribute("aria-label", "Talk to DEVOCEAN receptionist");
  }

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

  backdrop.addEventListener("click", closeWidget);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) closeWidget();
  });

  // Gently invite the visitor: first nudge shortly after load, then periodically
  // until they open the widget or dismiss the invitation.
  setTimeout(showCallout, 4000);
  inviteInterval = setInterval(showCallout, 30000);
})();
