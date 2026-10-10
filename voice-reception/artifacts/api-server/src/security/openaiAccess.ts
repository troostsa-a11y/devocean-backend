import type { RequestHandler } from "express";
import { adminAuth } from "../middleware/adminAuth";
import { conversationAuth, limitCreation, limitAi } from "./conversations";
import { originAllowed } from "./origins";
import { isAdminAuthorization } from "./secrets";
import { guardAiWork } from "./aiWork";

// Also mounted before body parsing: an unauthenticated caller must not be
// able to make Express buffer/decode a multi-megabyte audio request.
export const openaiAccess: RequestHandler = (req, res, next) => {
  if (res.locals.openaiAccessChecked) { next(); return; }
  const complete = (err?: unknown) => {
    if (err) { next(err); return; }
    res.locals.openaiAccessChecked = true;
    next();
  };
  const { method, path } = req;
  const creation = method === "POST" && path === "/conversations";
  const message = method === "POST" && /^\/conversations\/[^/]+\/(messages|voice-messages)$/.test(path);
  if (creation || message) {
    if (!originAllowed(req.headers.origin) && !isAdminAuthorization(req.headers.authorization)) {
      res.status(403).json({ error: "Widget origin not allowed" });
      return;
    }
    if (creation) { void limitCreation(req, res, complete); return; }
    req.params.id = path.split("/")[2];
    void conversationAuth(req, res, (err) => {
      if (err) { next(err); return; }
      void limitAi(req, res, (limitError) => {
        if (limitError) { next(limitError); return; }
        void guardAiWork(req, res, complete);
      });
    });
    return;
  }
  // Exact public allow-list: adding a /realtime/* handler never makes it
  // public. Tools are server-only; the active voice path is the gated WS relay.
  adminAuth(req, res, complete);
};
