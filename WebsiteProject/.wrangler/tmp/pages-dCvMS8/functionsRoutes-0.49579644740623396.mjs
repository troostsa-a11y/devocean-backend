import { onRequestGet as __api_booking_result__ref__js_onRequestGet } from "/home/runner/workspace/WebsiteProject/functions/api/booking/result/[ref].js"
import { onRequestPost as __api_booking_availability_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/booking/availability.js"
import { onRequestGet as __api_booking_calendar_js_onRequestGet } from "/home/runner/workspace/WebsiteProject/functions/api/booking/calendar.js"
import { onRequestPost as __api_booking_checkout_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/booking/checkout.js"
import { onRequestPost as __api_booking_nearest_available_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/booking/nearest-available.js"
import { onRequestPost as __api_booking_quote_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/booking/quote.js"
import { onRequestPost as __api_gift_voucher_checkout_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/gift-voucher/checkout.js"
import { onRequestGet as __api_gift_voucher_confirm_js_onRequestGet } from "/home/runner/workspace/WebsiteProject/functions/api/gift-voucher/confirm.js"
import { onRequestGet as __api_gift_voucher_validate_js_onRequestGet } from "/home/runner/workspace/WebsiteProject/functions/api/gift-voucher/validate.js"
import { onRequestPost as __api_contact_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/contact.js"
import { onRequestPost as __api_experience_inquiry_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/experience-inquiry.js"
import { onRequestGet as __api_fx_js_onRequestGet } from "/home/runner/workspace/WebsiteProject/functions/api/fx.js"
import { onRequestGet as __api_static_map_js_onRequestGet } from "/home/runner/workspace/WebsiteProject/functions/api/static-map.js"
import { onRequestPost as __api_track_session_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/track-session.js"
import { onRequest as ___key__txt_js_onRequest } from "/home/runner/workspace/WebsiteProject/functions/[key].txt.js"
import { onRequest as ___middleware_js_onRequest } from "/home/runner/workspace/WebsiteProject/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/booking/result/:ref",
      mountPath: "/api/booking/result",
      method: "GET",
      middlewares: [],
      modules: [__api_booking_result__ref__js_onRequestGet],
    },
  {
      routePath: "/api/booking/availability",
      mountPath: "/api/booking",
      method: "POST",
      middlewares: [],
      modules: [__api_booking_availability_js_onRequestPost],
    },
  {
      routePath: "/api/booking/calendar",
      mountPath: "/api/booking",
      method: "GET",
      middlewares: [],
      modules: [__api_booking_calendar_js_onRequestGet],
    },
  {
      routePath: "/api/booking/checkout",
      mountPath: "/api/booking",
      method: "POST",
      middlewares: [],
      modules: [__api_booking_checkout_js_onRequestPost],
    },
  {
      routePath: "/api/booking/nearest-available",
      mountPath: "/api/booking",
      method: "POST",
      middlewares: [],
      modules: [__api_booking_nearest_available_js_onRequestPost],
    },
  {
      routePath: "/api/booking/quote",
      mountPath: "/api/booking",
      method: "POST",
      middlewares: [],
      modules: [__api_booking_quote_js_onRequestPost],
    },
  {
      routePath: "/api/gift-voucher/checkout",
      mountPath: "/api/gift-voucher",
      method: "POST",
      middlewares: [],
      modules: [__api_gift_voucher_checkout_js_onRequestPost],
    },
  {
      routePath: "/api/gift-voucher/confirm",
      mountPath: "/api/gift-voucher",
      method: "GET",
      middlewares: [],
      modules: [__api_gift_voucher_confirm_js_onRequestGet],
    },
  {
      routePath: "/api/gift-voucher/validate",
      mountPath: "/api/gift-voucher",
      method: "GET",
      middlewares: [],
      modules: [__api_gift_voucher_validate_js_onRequestGet],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  {
      routePath: "/api/experience-inquiry",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_experience_inquiry_js_onRequestPost],
    },
  {
      routePath: "/api/fx",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_fx_js_onRequestGet],
    },
  {
      routePath: "/api/static-map",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_static_map_js_onRequestGet],
    },
  {
      routePath: "/api/track-session",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_track_session_js_onRequestPost],
    },
  {
      routePath: "/:key.txt",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [___key__txt_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]