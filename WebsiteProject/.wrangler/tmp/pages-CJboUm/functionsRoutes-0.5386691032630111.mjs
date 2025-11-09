import { onRequestPost as __api_contact_js_onRequestPost } from "/home/runner/workspace/WebsiteProject/functions/api/contact.js"
import { onRequest as __api_experience_inquiry_js_onRequest } from "/home/runner/workspace/WebsiteProject/functions/api/experience-inquiry.js"
import { onRequest as ___key__txt_js_onRequest } from "/home/runner/workspace/WebsiteProject/functions/[key].txt.js"
import { onRequest as ___middleware_js_onRequest } from "/home/runner/workspace/WebsiteProject/functions/_middleware.js"

export const routes = [
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
      method: "",
      middlewares: [],
      modules: [__api_experience_inquiry_js_onRequest],
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